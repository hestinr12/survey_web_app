var express = require('express');
var session = require('express-session');
var basicAuth = require('basic-auth');
var bodyParser = require('body-parser');
var jade = require('jade');
var Sequelize = require('sequelize');

var config = require('./config');
var surveyQuestionModel = require('./models/survey_question.js').Model;
var answerModel = require('./models/answer.js').Model;

var app = express();
var adminAccount = config.adminAccount;
var tempQuestions = config.tempQuestions;

/*
	Set up databases
*/
var sequelize = new Sequelize(config.databaseURI);
SurveyQuestion = sequelize.define('SurveyQuestion', surveyQuestionModel);
Answer = sequelize.define('Answer', answerModel);
SurveyQuestion.hasMany(Answer);


/*
	Template Engine
*/
app.set('views', './views');
app.set('view engine', 'jade');

/*
	Middleware for all routes
*/
//app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: config.sessionSecret,
	resave: true,
	saveUninitialized: true	
}));

/*
	Survey routes
		GET '/' - Return a rendered form with a random survey question
		POST '/result' - Receive the result of a url-encoded form
*/
app.get('/', function (req, res){
	//init session variable to play nice with the rest of the logic
	if(!req.session.seenQuestions){
		req.session.seenQuestions = [];
	}

	var queryAttributes = {}
	if(req.session.seenQuestions.length > 0) {
		queryAttributes = {
			include: [ Answer ],
		  where: {
		  	id: { notIn: req.session.seenQuestions }
			}
		}
	} else {
		queryAttributes = {
			include: [ Answer ]
		}
	}
	
	SurveyQuestion
		.find(queryAttributes)
		.then(function (result){
			if(result) {
				req.session.seenQuestions.push(result.dataValues.id);
				res.render('random_survey.jade', result);
			} else {
				res.render('random_survey.jade');
			}
		})
		.catch(function (err) {
			console.log('From \'/\': ' + err);
			res.status(502).send('Status 502 - Internal Server Error');
		});
});

app.post('/result', function (req, res){
	var queryAttributes = {
		where: {
			id: req.body.answer
		}
	}

	Answer
		.find(queryAttributes)
		.then(function (result) {
			//FIXME: Fails quietly if no result. Not good.
			if(result) {
				result.increment('count');
				res.redirect('/');
			}
		})
		.catch(function (err) {
			console.log('From \'/\': ' + err);
			res.status(502).send('Status 502 - Internal Server Error');
		});
});

/*
	Admin Routes
		GET '/admin' - Sign in page (credentials predetermined)
		POST '/login' - Authenticate the user via Basic Auth (TODO: Use bcrypt for safer authentication against the DB record)
		GET '/logout' - Logout the user (purge session)

	Protected Admin Routes
		GET 'admin/survey_questions' - List of all questions
		GET 'admin/new_survey' - Form to add a new survey
		POST 'admin/new_survey' - Submit a new survey to be added in
*/
app.get('/admin', function (req, res){
	if(req.session.admin) {
		res.redirect('/admin/survey_questions');
	} else {
		res.render('admin_login.jade', {error: req.session.loginErr});
	}

	if(req.session.loginErr) {
		delete req.session.loginErr;
	}
});

app.post('/login', function (req, res){
	if (req.body.user == adminAccount.user && req.body.pass == adminAccount.pass){
		req.session.admin = true;
		req.session.loginErr = false;
		res.redirect('/admin/survey_questions');
	} else {
		req.session.loginErr = true
		res.redirect('/admin');
	}
});

app.get('/logout', function(req, res){
	delete req.session.loginErr;
	delete req.session.admin;
	res.redirect('/admin');
});

/*
	Middleware for psuedo basic auth
*/
app.use(function (req, res, next){
	if(req.session.admin) {
		next();
	} else {
		res.status(401).send('Status 401 - Unauthorized Access');
	}
});

/*
	Everything below here requires authenticated session
*/
app.get('/admin/survey_questions', function (req, res){
	var queryAttributes = {
		include: [ Answer ],
		order: [
			['createdAt', 'DESC'], 
			[Answer, 'count', 'DESC']] 
	}

	SurveyQuestion
		.findAll(queryAttributes)
		.then(function (packedData){
			res.render('admin_survey_list.jade', {questions: packedData});
		})
		.catch(function (err) {
			console.log('From \'/admin/survey_questions\': ' + err);
			res.status(502).send('Status 502 - Internal Server Error');
		});
});

app.get('/admin/new_survey', function (req, res){
	res.render('new_survey_question.jade');
});

app.post('/admin/new_survey', function (req, res){
	var surveyQuestionData = {};
	var answersData = [];

	for (key in req.body) {
		if (key == 'text') {
			surveyQuestionData = {
				text: req.body[key]
			}
		} else {
			answersData.push({
				text: req.body[key]
			});
		}
	}

	//Promise chain for the transaction...it's kinda ugly, but apparently the accepted method?
	sequelize
		.transaction(function (t) {
			return SurveyQuestion.create(surveyQuestionData, {transaction: t}).then(function (surveyQuestion) {
					return sequelize.Promise.map(answersData, function (answerData) {
						return Answer.create(answerData, {transaction: t}).then(function (answer) {
								return surveyQuestion.addAnswer(answer, {transaction: t});
							});
					});
				});
		})
		.then(function (result) {
			res.redirect('/admin/survey_questions');
		})
		.catch(function (err) {
			console.log('From \'/admin/survey_questions\': ' + err);
			res.status(502).send('Status 502 - Internal Server Error');
		});
});

sequelize.sync().then(function (){
	app.listen(process.env.PORT || 8000);
});

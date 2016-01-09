var express = require('express');
var session = require('express-session');
var basicAuth = require('basic-auth');
var bodyParser = require('body-parser');
var jade = require('jade');

var app = express();
var adminAccout = {user: 'admin', pass: 'taco'};
var tempQuestions = [
	{
		text: 'What kind of tacos do you like?',
		questionId: 1,
		choices: [
			[1, 'crispy chickennnnnnnnnn nnnnnnnnnnnn nnnnnnnnnnnnn nnnn nnnnnnnnnnnnnn nnnnnn nn', 14],
			[2, 'soft chicken', 13],
			[3, 'crispy shredded beef', 8],
			[4, 'soft shredded beef', 9],
			[5, 'soft fish', 1],
			[6, 'soft veggie', 6],
			[7, 'none :(', 0]
		]
	},
	{
		text: 'What color is the sky?',
		questionId: 2,
		choices: [
			[8, 'red', 2],
			[9, 'blue', 27],
			[10, 'green', 0],
			[11, 'purple', 0],
		]
	},
	{
		text: 'Who\'s your idol?',
		questionId: 3,
		choices: [
			[12, 'A Machine', 0],
			[13, 'Spiderman', 2],
			[14, 'Bob Ross', 43],
			[15, 'You', 1],
		]
	}
];

/*
	Template Engine
*/
app.set('views', './views');
app.set('view engine', 'jade');

/*
	Middleware for all routes
*/
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: 'sumomechallengetacos',
	resave: true,
	saveUninitialized: true	
}));

/*
	Survey routes
		GET '/' - Return a rendered form with a random survey question
		POST '/:survey_id' - Receive the result of a url-encoded form
*/
app.get('/', function (req, res){

	//init session variables
	if(!req.session.seenQuestions){
		req.session.seenQuestions = [];
	}
	console.log(req.session.seenQuestions);

	//get possibilities (!!!!!!! Done via DB query eventually !!!!!!!)
	var possibilities = tempQuestions.filter(function (value) {
		return req.session.seenQuestions.indexOf(value.questionId) == -1;
	});

	//package data for jade (once using DB))
		//(when on the DB)
		//will need to strip "count" out of the answer field, etc
		//just try to make it match the current json format, see if it converts simply

	//pick question
	var pick = Math.floor((Math.random() * possibilities.length));
	
	//mark session
	try{
		req.session.seenQuestions.push(possibilities[pick].questionId)
	} catch(e) {
		console.log(e);
	}

	//render
	res.render('random_survey.jade', possibilities[pick]);
});

app.post('/result', function (req, res){
	console.log(req.body);
	res.redirect('/')
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
	if (req.body.user == adminAccout.user && req.body.pass == adminAccout.pass){
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
	Middleware for Basic Auth
*/
app.use(function (req, res, next){
	if(req.session.admin) {
		next();
	} else {
		res.status(401).send('Status 401 - Unauthorized Access');
	}
});

/*
	Everything below here requires Authorization
*/
app.get('/admin/survey_questions', function (req, res){
	res.render('admin_survey_list.jade', {questions: tempQuestions});
});

app.get('/admin/new_survey', function (req, res){
	res.render('new_survey_question.jade');
});

app.post('/admin/new_survey', function (req, res){
	console.log(req.body);
	res.redirect('/admin/survey_questions');
});



app.listen(process.env.PORT || 8000);
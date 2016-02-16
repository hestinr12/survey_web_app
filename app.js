var express = require('express');
var session = require('express-session');
var basicAuth = require('basic-auth');
var bodyParser = require('body-parser');
var jade = require('jade');
var Sequelize = require('sequelize');

var config = require('./config');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
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
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: config.sessionSecret,
	resave: true,
	saveUninitialized: true	
}));

/*
	User routes
		GET '/' - Return a rendered form with a random survey question
		POST '/result' - Receive the result of a url-encoded form
*/
app.get('/', userRoutes.survey);
app.post('/result', userRoutes.result);

/*
	Admin Routes
		GET '/admin' - Sign in page (credentials predetermined)
		POST '/login' - Authenticate the user via Basic Auth (TODO: Use bcrypt for safer authentication against the DB record)
		GET '/logout' - Logout the user (purge session)
*/
app.get('/admin', adminRoutes.admin);
app.post('/login', adminRoutes.login);
app.get('/logout', adminRoutes.logout);

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
	Protected Admin Routes
		GET 'admin/survey_questions' - List of all questions
		GET 'admin/new_survey' - Form to add a new survey
		POST 'admin/new_survey' - Submit a new survey to be added in
*/

app.get('/admin/survey_questions', adminRoutes.surveyQuestions);
app.get('/admin/new_survey', adminRoutes.newSurvey);
app.post('/admin/new_survey', adminRoutes.newSurveySubmit);

sequelize.sync().then(function (){
	app.listen(process.env.PORT || 8000);
});

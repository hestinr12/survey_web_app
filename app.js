var express = require('express');
var session = require('express-session')
var basicAuth = require('basic-auth');
var bodyParser = require('body-parser')

var app = express();
var adminAccout = {'name': 'sumome', 'pass': 'tacos'};

/*
	Middleware for all routes
*/
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
	res.send('SURVEY HERE');
});

app.post('/:survey_id', function (req, res){
	res.send(req.body.answer_id + ' picked for survey ' + req.params.survey_id);
});

/*
	Admin Routes
		GET '/admin' - Sign in page (credentials predetermined)
		POST '/login' - Authenticate the user via Basic Auth
		GET '/logout' - Logout the user (purge session)

	Protected Admin Routes
		(TODO: Use bcrypt for safer authentication against the DB record)
		GET 'admin/survey_questions' - List of all questions
		GET 'admin/survey_questions/:survey_id' - List current results (TODO: Should they be able to edit?)
		GET 'admin/new_survey' - Form to add a new survey
		POST 'admin/new_survey' - Submit a new survey to be added in
*/
app.get('/admin', function (req, res){
	res.send('ADMIN SIGNIN');
});

app.post('/login', function (req, res){
	res.send('user: ' + req.body.user + '| pass: ' + req.body.pass);
});

app.get('/logout', function(req, res){
	res.send('logging out');
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
	res.send('some questions being listed here');
});

app.get('/admin/survey_questions/:survey_id' function (req, res){
	res.send('some details about the specific survey here');
});

app.get('admin/new_survey', function (req, res){
	res.send('form for adding a new question here');
});

app.post('admin/new_survey', function (req, res){
	res.send('handling the form data for new question aaaaaand redirect...');
});



app.listen(process.env.PORT || 8000);
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

module.exports = {
	admin: function (req, res){
		if(req.session.admin) {
			res.redirect('/admin/survey_questions');
		} else {
			res.render('admin_login.jade', {error: req.session.loginErr});
		}

		if(req.session.loginErr) {
			delete req.session.loginErr;
		}
	},

	login: function (req, res){
		if (req.body.user == adminAccount.user && req.body.pass == adminAccount.pass){
			req.session.admin = true;
			req.session.loginErr = false;
			res.redirect('/admin/survey_questions');
		} else {
			req.session.loginErr = true
			res.redirect('/admin');
		}
	},

	logout: function(req, res){
		delete req.session.loginErr;
		delete req.session.admin;
		res.redirect('/admin');
	},

	surveyQuestions: function (req, res){
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
	},

	newSurvey: function (req, res){
		res.render('new_survey_question.jade');
	},

	newSurveySubmit: function (req, res){
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
	}
}
/*
	User routes
		GET '/' - Return a rendered form with a random survey question
		POST '/result' - Receive the result of a url-encoded form
*/
module.exports = {


	survey: function (req, res){
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
	},

	result: function (req, res){
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
	}
}
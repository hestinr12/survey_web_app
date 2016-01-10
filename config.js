
exports.sessionSecret = 'sumomechallengetacos';

exports.adminAccount = {user: 'admin', pass: 'taco'};

exports.databaseURI = 'mysql://sumo:sumodev@localhost:3306/sumo_dev'

exports.tempQuestions = [
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
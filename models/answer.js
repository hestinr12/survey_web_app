var Sequelize = require('sequelize');


exports.Model = {
  text: { type: Sequelize.STRING, allowNull: false },
  count: { type: Sequelize.INTEGER, defaultValue: 0 }
}
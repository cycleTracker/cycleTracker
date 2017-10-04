const Sequelize = require("sequelize");
const db = require("./_db");

const Hotel = db.define("hotel", {
  name: Sequelize.STRING,
  num_stars: {
    type: Sequelize.INTEGER,
    validate: { min: 1, max: 5 }
  },
  amenities: Sequelize.STRING
});

module.exports = Hotel;

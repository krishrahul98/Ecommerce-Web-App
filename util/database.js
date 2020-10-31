const Sequelize = require("sequelize");

const databaseName = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USER;
const password = process.env.MYSQL_USER_PASSWORD;
const hostName = process.env.MYSQL_HOST;

const sequelize = new Sequelize(databaseName, username, password, {
  dialect: "mysql",
  host: hostName,
});

module.exports = sequelize;

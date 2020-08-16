import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const db = {};

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  logging: false
});

const curFileName = path.basename(__filename);

// Imports models
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== curFileName) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Defines associations between models
Object.keys(db).forEach(model => {
  if (model.associate)
    model.associate(db);
});

db.Sequelize = Sequelize;
db.db = sequelize;

module.exports = db;
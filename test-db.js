import Sequelize from 'sequelize';

const db = new Sequelize('testdb', 'postgres', 'abc123', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  logging: false
});

const User = db.define('user', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: { 
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  freezeTableName: true
});

export {db, User};
/* eslint-disable require-jsdoc */
'use strict';
const {
  Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Conversation, {
        as: 'peer_id_1',
        foreignKey: 'user_id_1',
      });

      User.hasMany(models.Conversation, {
        as: 'peer_id_2',
        foreignKey: 'user_id_2',
      });
    }
  };
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};

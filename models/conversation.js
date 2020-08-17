/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
'use strict';
const {
  Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Conversation.belongsTo(models.User, {
        as: 'convUser_1',
        foreignKey: 'user_id_1',
        targetKey: 'id',
      });

      Conversation.belongsTo(models.User, {
        as: 'convUser_2',
        foreignKey: 'user_id_2',
        targetKey: 'id',
      });

      Conversation.hasMany(models.Message, {
        as: 'messages',
        foreignKey: 'conversation_id',
      });
    }
  };
  Conversation.init({
    user_id_1: DataTypes.INTEGER,
    user_id_2: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Conversation',
  });
  return Conversation;
};

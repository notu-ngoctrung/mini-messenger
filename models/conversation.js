module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('conversation', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id_1: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id_2: {
      type: DataTypes.INTEGER, 
      allowNull: false
    }
  }, {
    freezeTableName: true
  });

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.User, {
      as: 'convUser_1',
      foreignKey: 'user_id_1',
      targetKey: 'id'
    });
    
    Conversation.belongsTo(models.User, {
      as: 'convUser_2',
      foreignKey: 'user_id_2',
      targetKey: 'id'
    });

    Conversation.hasMany(models.Message, {
      as: 'messages',
      foreignKey: 'conversation_id'
    });
  };

  return Conversation;
};
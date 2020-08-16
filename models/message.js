module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    }
  }, {
    freezeTableName: true
  });

  Message.associate = (models) => {
    Message.belongsTo(Conversation, {
      foreignKey: 'conversation_id',
      targetKey: 'id'
    });    
  };

  return Message;
};
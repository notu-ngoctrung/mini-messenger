module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: { 
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true
  });

  User.associate = (models) => {
    User.hasMany(models.Conversation, {
      as: 'peer_id_1',
      foreignKey: 'user_id_1'
    });

    User.hasMany(models.Conversation, {
      as: 'peer_id_2',
      foreignKey: 'user_id_2'
    });
  };

  return User;
};
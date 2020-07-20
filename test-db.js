import Sequelize from 'sequelize';
import config from './config';

const db = new Sequelize('testdb', config.db.username, config.db.password, {
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
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
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

const Conversation = db.define('conversation', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id_1: {
    type: Sequelize.INTEGER, // changed to string?
    allowNull: false
  },
  user_id_2: {
    type: Sequelize.INTEGER, // changed to string?
    allowNull: false
  }
}, {
  freezeTableName: true
});

const Message = db.define('message', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  conversation_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT
  }
});

// User-Conversation relationship
User.hasMany(Conversation, {
  as: 'sender',
  foreignKey: 'user_id_1'
});

User.hasMany(Conversation, {
  as: 'receiver',
  foreignKey: 'user_id_2'
});

Conversation.belongsTo(User, {
  foreignKey: 'user_id_1',
  targetKey: 'id'
});

Conversation.belongsTo(User, {
  foreignKey: 'user_id_2',
  targetKey: 'id'
});

// Conversation-Message relationship
Conversation.hasMany(Message, {
  as: 'message',
  foreignKey: 'conversation_id'
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  targetKey: 'id'
});

export {db, User, Conversation, Message};
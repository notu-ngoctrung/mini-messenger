import Sequelize from 'sequelize';
import config from './config';

const db = new Sequelize(config.db.dbName, config.db.username, config.db.password, {
  host: config.db.host,
  dialect: config.db.dialect,
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
    type: Sequelize.INTEGER,
    allowNull: false
  },
  user_id_2: {
    type: Sequelize.INTEGER, 
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
}, {
  freezeTableName: true
});

// User-Conversation relationship
User.hasMany(Conversation, {
  as: 'peer_id_1',
  foreignKey: 'user_id_1'
});

User.hasMany(Conversation, {
  as: 'peer_id_2',
  foreignKey: 'user_id_2'
});

Conversation.belongsTo(User, {
  as: 'convUser_1',
  foreignKey: 'user_id_1',
  targetKey: 'id'
});

Conversation.belongsTo(User, {
  as: 'convUser_2',
  foreignKey: 'user_id_2',
  targetKey: 'id'
});

// Conversation-Message relationship
Conversation.hasMany(Message, {
  as: 'messages',
  foreignKey: 'conversation_id'
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  targetKey: 'id'
});

export {db, User, Conversation, Message};
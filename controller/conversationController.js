import Sequelize from 'sequelize';
import config from '../config';
import {User, Conversation, Message} from '../database';

const jwt = require('jsonwebtoken');
const ConversationController = {};

ConversationController.createOneConversation = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, config.keys.secret);
    console.log(`${decoded.userID} creates a conversation`);
    const user1 = await User.findByPk(decoded.userID).catch(() => {
      res.status(400).send(`An error happened in finding ID ${decoded.userID}`);
    });
    if (user1 === null) {
      res.status(404).send(`Cannot get conversations: ID ${decoded.userID} not found`);
      return;
    }
    const user2 = await User.findOne({
      where: { username: req.body.peerName }
    }).catch(() => {
      res.status(400).send(`An error happened in finding ${req.body.peerName}`);
    });
    if (user2 === null) {
      res.status(404).send(`Cannot get conversations: ${req.body.peerName} not found`);
      return;
    }
    const conversation = await Conversation.findOne({
      where: { 
        [Sequelize.Op.or]: [
          {
            user_id_1: user1.id,
            user_id_2: user2.id
          },
          {
            user_id_1: user2.id,
            user_id_2: user1.id
          }
        ]
      }
    });
    if (conversation === null) {
      Conversation.create({
        user_id_1: user1.id,
        user_id_2: user2.id
      }).then(() => {
        res.status(200).end();
      }).catch(() => {
        res.status(400).send(`An error happened in creating a conversation between ${user1.username} and ${user2.username}`);
      });
    }
    res.status(200).end();
  } else
    res.status(400).send('Empty header');
};

ConversationController.getAllConversations = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, config.keys.secret);
    console.log(`${decoded.userID} requires all conversations`);
    const user1 = await User.findByPk(decoded.userID).catch(() => {
      res.status(400).send(`An error happened in finding ${decoded.userID}`);
    });
    if (user1 === null)
      res.status(404).send(`Cannot get conversations: ${decoded.userID} not found`);
    else {
      const conversations = await Conversation.findAll({
        attributes: ['createdAt'],
        where: {
          [Sequelize.Op.or]: [
            { user_id_1: decoded.userID },
            { user_id_2: decoded.userID }
          ]
        },
        include: [
          {
            model: Message,
            as: 'messages',
            attributes: ['content']
          },
          {
            model: User,
            as: 'convUser_1',
            attributes: ['username']
          },
          {
            model: User,
            as: 'convUser_2',
            attributes: ['username']
          }
        ]
      });
      res.json(JSON.stringify(conversations));
    }
  } else
    res.status(400).send('Empty header');
};

ConversationController.deleteOneConversation = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, config.keys.secret);
    console.log(`${decoded.userID} wants to delete all conversations`);
    const user2 = await User.findOne({
      where: { username: req.body.peerName }
    })
    if (user2 === null) {
      res.status(400).send('Cannot delete conversations: username not found');
      return;
    }
    Conversation.findAll({
      where: {
        [Sequelize.Op.or]: [
          {
            user_id_1: decoded.userID,
            user_id_2: user2.id
          },
          {
            user_id_1: user2.id,
            user_id_2: decoded.userID
          }
        ]
      }
    }).then((conversations) => {
      conversations.every((conversation) => {
        conversation.destroy();
      });
      res.status(200).end();
    }).catch(() => {
      res.status(400).send('Cannot delete conversations');
    });
  } else
    res.status(400).send('Empty header');
};

ConversationController.sendOneMessage = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, config.keys.secret);
    console.log(`${decoded.userID} wants to send a message`);
    const receiver = await User.findOne({
      where: { username: req.body.receiver }
    })
    const conversation = await Conversation.findOne({
      where: { 
        [Sequelize.Op.or]: [
          {
            user_id_1: decoded.userID,
            user_id_2: receiver.id
          },
          {
            user_id_1: receiver.id,
            user_id_2: decoded.userID
          }
        ]
      }
    });
    Message.create({
      conversation_id: conversation.id,
      content: req.body.content
    }).then(() => {
      res.status(200).end();
    }).catch(() => {
      res.status(400).send('An error happened when creating a new message');
    });
  } else
    res.status(400).send('Empty header');
};

export default ConversationController;
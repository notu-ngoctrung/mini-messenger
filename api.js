import express, { response } from 'express';
import bcrypt from 'bcrypt';
import Sequelize from 'sequelize';
import {User, Conversation, Message} from './database';

const jwt = require('jsonwebtoken');
const route = express.Router();

route.post('/api/register', async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  const user = await User.create({
    username: req.body.username,
    password: hash
  }).then(() => {
    res.status(200).end();
  }).catch(() => {
    res.status(409).send('Username is taken');
  });
});

route.get('/api/login', async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  const user = await User.findOne({
    where: { username: req.body.username }
  })
  if (user === null) 
    res.status(404).send('User not found');
  else if (user.password !== hash)
    res.status(409).send('Password mismatched');
  else {
    const token = jwt.sign({
      userID: user.id
    },
    config.keys.secret, {
      expiresIn: '300m'
    });

    res.json({
      success: true,
      jwtToken: token
    });
  }
});

route.post('/api/conversation', async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, config.keys.secret);
    console.log(`${decoded.userID} create a conversation`);
    const user1 = await User.findByPk(decoded.userID).catch(() => {
      res.status(400).send(`An error happened in finding ID ${decoded.userID}`);
    });
    if (user1 === null) {
      res.status(404).send(`Cannot get conversations: ID ${decoded.userID} not found`);
      return;
    }
    const user2 = await User.findOne({
      where: { username: req.body.username_2 }
    }).catch(() => {
      res.status(400).send(`An error happened in finding ${req.body.username_2}`);
    });
    if (user2 === null) {
      res.status(404).send(`Cannot get conversations: ${req.body.username_2} not found`);
      return;
    }
    Conversation.create({
      user_id_1: user1.id,
      user_id_2: user2.id
    }).then(() => {
      res.status(200).end();
    }).catch(() => {
      res.status(400).send(`An error happened in creating a conversation between ${user1.username} and ${user2.username}`);
    });
  } else
  res.status(400).send('Empty header');
});

route.get('/api/conversation', async (req, res) => {
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
        where: {
          [Sequelize.Op.or]: [
            { user_id_1: decoded.userID },
            { user_id_2: decoded.userID }
          ]
        },
        include: {
          model: Message,
          as: 'messages'
        }
      });
      res.json(JSON.stringify(conversations));
    }
  } else
    res.status(400).send('Empty header');
});

route.put('/api/conversation/delete', async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, config.keys.secret);
    console.log(`${decoded.userID} wants to delete all conversations`);
    const user2 = await User.findOne({
      where: { username: req.body.username_2 }
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
});

route.post('/api/conversation/message', async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, config.keys.secret);
    console.log(`${decoded.userID} wants to send a message`);
    const receiver = await User.findOne({
      where: { username: req.body.username_2 }
    });
    Message.create({
      conversation_id: req.body.conversation_id,
      content: req.body.content
    }).then(() => {
      // code to send back to receiver
    }).catch(() => {
      res.status(400).send('An error happened when creating a new message');
    });
  } else
    res.status(400).send('Empty header');
});

route.get('/api/user', async (req, res) => {
  const receiver = await User.findOne({
    where: { username: req.body.username }
  }).catch(() => {
    res.status(400).send(`An error happened in finding ${req.body.username}`);
  });
  if (receiver === null) 
    res.status(404).send(`${req.body.username} not found`);
  else
    res.status(200).end();
});

export default route;
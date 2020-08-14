import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import config from '../config';
import {User, Conversation, Message} from '../database';
import UserService from '../services/user.service';
import ConversationService from '../services/conversation.service';
import MessageService from '../services/message.service';

const jwt = require('jsonwebtoken');
dotenv.config();

class ConversationController {
  static async createOneConversation(req, res) {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.SECRET);
      console.log(`${decoded.userID} creates a conversation`);
      try {
        const user1 = await UserService.searchForID(decoded.userID);
        const user2 = await UserService.searchForUsername(req.body.peerName);
        let conversation = await ConversationService.searchAConversation(user1.id, user2.id);
        if (conversation) 
          res.status(200).send('Conversation has already created');
        else {
          conversation = await ConversationService.createNewConversation(user1.id, user2.id);
          res.status(200).send('Conversation has successfully created');
        }
      }
      catch (err) {
        res.status(err.statusCode).send(err.message);
      }
    } 
    else
      res.status(400).send('Empty header');
  }

  static async getAllConversations(req, res) {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.SECRET);
      console.log(`${decoded.userID} requires all conversations`);
      try {
        const user = await UserService.searchForID(decoded.userID);
        const conversations = await ConversationService.searchAllConversations(user.id);
        res.json(JSON.stringify(conversations));
      }
      catch (err) {
        res.status(err.statusCode).send(err.message);
      }
    } else
      res.status(400).send('Empty header');
  }

  static async deleteOneConversation(req, res) {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, config.keys.secret);
      console.log(`${decoded.userID} wants to delete all conversations`);
      try {
        const user2 = await UserService.searchForUsername(req.body.peerName);
        const conversation = await ConversationService.searchAConversation(decoded.userID, user2.id);
        conversation.destroy()
          .catch(() => {
            res.status(400).send('Cannot destroy the conversation');
          });
        res.status(200).send('Conversation is deleted');
      }
      catch (err) {
        res.status(err.statusCode || 409).send(err.message);
      }
    } else
      res.status(400).send('Empty header');
  }

  static async sendOneMessage(req, res) {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, config.keys.secret);
      console.log(`${decoded.userID} wants to send a message`);
      try {
        const receiver = await UserService.searchForUsername(req.body.receiver);
        const conversation = await ConversationService.searchAConversation(decoded.userID, receiver.id);
        if (conversation == null)
          res.status(400).send('Cannot find the conversation to post message');
        else {
          const message = await MessageService.createAMessage(conversation.id, req.body.content);
          res.status(200).send('Message is posted successfully');
        }
      }
      catch (err) {
        res.status(err.statusCode || 409).send(err.message);
      }
    } else
      res.status(400).send('Empty header');
  }
}

export default ConversationController;
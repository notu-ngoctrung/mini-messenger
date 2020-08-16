import UserService from '../services/user.service';
import ConversationService from '../services/conversation.service';
import MessageService from '../services/message.service';
import ReqError from '../services/error.service';

class ConversationController {
  static async createOneConversation(req, res) {
    try {
      const userID = UserService.decodeUserID(req.headers.authorization);
      console.log(`${userID} creates a conversation`);
      const user1 = await UserService.searchForID(userID);
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
      res.status(err.statusCode || 409).send(ReqError.getErrMessage(err));
    }
  }

  static async getAllConversations(req, res) {
    try {
      const userID = UserService.decodeUserID(req.headers.authorization);
      console.log(`${userID} requires all conversations`);
      const user = await UserService.searchForID(userID);
      const conversations = await ConversationService.searchAllConversations(user.id);
      res.json(JSON.stringify(conversations));
    }
    catch (err) {
      res.status(err.statusCode || 409).send(ReqError.getErrMessage(err));
    }
  }

  static async deleteOneConversation(req, res) {
    try {
      const userID = UserService.decodeUserID(req.headers.authorization);
      console.log(`${userID} deletes a conversation`);
      const user2 = await UserService.searchForUsername(req.body.peerName);
      const conversation = await ConversationService.searchAConversation(userID, user2.id);
      conversation.destroy()
        .catch(() => {
          res.status(400).send('Cannot destroy the conversation');
        });
      res.status(200).send('Conversation is deleted');
    }
    catch (err) {
      res.status(err.statusCode || 409).send(ReqError.getErrMessage(err));
    }
  }

  static async sendOneMessage(req, res) {
    try {
      const userID = UserService.decodeUserID(req.headers.authorization);
      console.log(`${userID} wants to send a message`);
      const receiver = await UserService.searchForUsername(req.body.receiver);
      const conversation = await ConversationService.searchAConversation(userID, receiver.id);
      if (conversation == null)
        res.status(400).send('Cannot find the conversation to post message');
      else {
        const message = await MessageService.createAMessage(conversation.id, req.body.content);
        res.status(200).send('Message is posted successfully');
      }
    }
    catch (err) {
      res.status(err.statusCode || 409).send(ReqError.getErrMessage(err));
    }
  }
}

export default ConversationController;
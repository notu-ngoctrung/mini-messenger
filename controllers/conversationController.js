import UserService from '../services/user.service';
import ConversationService from '../services/conversation.service';
import MessageService from '../services/message.service';
import ReqError from '../services/error.service';

class ConversationController {
  static async createOneConversation(req, res) {
    try {
      console.log(`${req.username} creates a conversation`);
      const peer = await UserService.getUserByName(req.body.peerName);
      let conversation = await ConversationService.searchAConversation(req.userID, peer.id);
      if (conversation) 
        res.status(200).send('Conversation has already created');
      else {
        conversation = await ConversationService.createNewConversation(req.userID, peer.id);
        res.status(200).send('Conversation has successfully created');
      }
    }
    catch (err) {
      res.status(err.statusCode || 409).send(ReqError.getErrMessage(err));
    }
  }

  static async getAllConversations(req, res) {
    try {
      console.log(`${req.username} requires all conversations`);
      const conversations = await ConversationService.searchAllConversations(req.userID);
      res.json(JSON.stringify(conversations));
    }
    catch (err) {
      res.status(err.statusCode || 409).send(ReqError.getErrMessage(err));
    }
  }

  static async deleteOneConversation(req, res) {
    try {
      console.log(`${req.username} deletes a conversation`);
      const peer = await UserService.getUserByName(req.body.peerName);
      const conversation = await ConversationService.searchAConversation(req.userID, peer.id);
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
      console.log(`${req.username} wants to send a message`);
      const receiver = await UserService.getUserByName(req.body.receiver);
      const conversation = await ConversationService.searchAConversation(req.userID, receiver.id);
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
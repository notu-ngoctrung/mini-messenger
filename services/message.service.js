import Sequelize from 'sequelize';
import { Message } from '../database';
import ReqError from './error.service';

class MessageService {
  static async createAMessage(conversationID, content) {
    let err;
    const message = Message.create({
      conversation_id: conversationID,
      content: content
    }).catch((e) => { err = e; });
    if (err)
      throw new ReqError(409, 'An error happens when posting a new message');
    return message;
  }
}

export default MessageService;
import { db, Message } from '../models';
import ReqError from './error.service';

class MessageService {
  static async createAMessage(conversationID, content) {
    try {
      const result = await db.transaction(async (t) => {
        const message = await Message.create({
          conversation_id: conversationID,
          content: content
        }, { transaction: t });
        return message;
      });

      return result;
    }
    catch (err) {
      throw new ReqError(409, 'An error happens when posting a new message');
    }
  }
}

export default MessageService;
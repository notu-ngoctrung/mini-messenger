import {sequelize, Message} from '../models';
import ReqError from './error.service';

/**
 * Supports with an access to database related to Message table
 */
class MessageService {
  /**
   * Creates a new message in the database
   * @param {number} conversationID conversation ID to post the message
   * @param {string} sender the message's sender
   * @param {string} content the message's content
   */
  static async createAMessage(conversationID, sender, content) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const message = await Message.create({
          conversation_id: conversationID,
          sender: sender,
          content: content,
        }, {transaction: t});
        return message;
      });

      return result;
    } catch (err) {
      throw new ReqError(409, 'An error happens when posting a new message');
    }
  }
}

export default MessageService;

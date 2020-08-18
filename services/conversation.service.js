/* eslint-disable max-len */
import {sequelize, Sequelize, Conversation, Message, User} from '../models';
import ReqError from './error.service';

/**
 * Provides ConversationController with access to the database
 */
class ConversationService {
  /**
   * Looks up in the database and searches all conversations of a user
   * @param {number} userID an ID of user in database
   */
  static async searchAllConversations(userID) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const conversations = await Conversation.findAll({
          attributes: ['createdAt'],
          where: {
            [Sequelize.Op.or]: [
              {user_id_1: userID},
              {user_id_2: userID},
            ],
          },
          include: [
            {
              model: Message,
              as: 'messages',
              attributes: ['content'],
            },
            {
              model: User,
              as: 'convUser_1',
              attributes: ['username'],
            },
            {
              model: User,
              as: 'convUser_2',
              attributes: ['username'],
            },
          ],
        }, {transaction: t});
        return conversations;
      });

      return result;
    } catch (err) {
      console.log(err.message);
      throw new ReqError(409, 'An error happens when searching all conversations');
    }
  }

  /**
   * Looks up in the database and returns a conversation of two users
   * @param {number} userID1 ID of user 1 in database
   * @param {number} userID2 ID of user 2 in database
   */
  static async searchAConversation(userID1, userID2) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const conversation = await Conversation.findOne({
          where: {
            [Sequelize.Op.or]: [
              {
                user_id_1: userID1,
                user_id_2: userID2,
              },
              {
                user_id_1: userID2,
                user_id_2: userID1,
              },
            ],
          },
        }, {transaction: t});
        return conversation;
      });

      return result;
    } catch (err) {
      console.log('searchAConversation error: ', err.message);
      throw new ReqError(409, 'An error happens when searching for a conversation');
    }
  }

  /**
   * Creates a new conversation in the database between two users
   * @param {number} userID1 ID of user 1 in database
   * @param {number} userID2 ID of user 2 in database
   */
  static async createNewConversation(userID1, userID2) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const conversation = await Conversation.create({
          user_id_1: userID1,
          user_id_2: userID2,
        }, {transaction: t});
        return conversation;
      });

      return result;
    } catch (err) {
      console.log('createNewConversation error: ', err.message);
      throw new ReqError(409, 'An error happens when creating a new conversation');
    }
  }

  /**
   * Deletes a conversation in the database
   * @param {*} conversation a conversation from database
   */
  static async deleteConversation(conversation) {
    try {
      await sequelize.transaction(async (t) => {
        conversation.destroy({transaction: t});
      });
    } catch (err) {
      console.log('deleteConversation error: ', err.message);
      throw new ReqError(400, 'Cannot destroy the conversation');
    }
  }
}

export default ConversationService;

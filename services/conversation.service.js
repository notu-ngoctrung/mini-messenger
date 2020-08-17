import { sequelize, Sequelize, Conversation, Message, User } from "../models";
import ReqError from "./error.service";

class ConversationService {
  static async searchAllConversations(userID) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const conversations = await Conversation.findAll({
          attributes: ['createdAt'],
          where: {
            [Sequelize.Op.or]: [
              { user_id_1: userID },
              { user_id_2: userID }
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
        }, { transaction: t });
        return conversations;
      });

      return result;
    }
    catch (err) {
      console.log(err.message);
      throw new ReqError(409, 'An error happens when searching all conversations');
    }
  }
  
  static async searchAConversation(userID1, userID2) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const conversation = await Conversation.findOne({
          where: { 
            [Sequelize.Op.or]: [
              {
                user_id_1: userID1,
                user_id_2: userID2
              },
              {
                user_id_1: userID2,
                user_id_2: userID1
              }
            ]
          }
        }, { transaction: t });
        return conversation;
      });

      return result;
    }
    catch (err) {
      console.log('searchAConversation error: ', err.message);
      throw new ReqError(409, 'An error happens when searching for a conversation');
    }
  }

  static async createNewConversation(userID1, userID2) {
    let err;
    try {
      const result = await sequelize.transaction(async (t) => {
        const conversation = await Conversation.create({
          user_id_1: userID1,
          user_id_2: userID2
        }, { transaction: t });
        return conversation;
      });

      return result;
    }
    catch (err) {
      console.log('createNewConversation error: ', err.message);
      throw new ReqError(409, 'An error happens when creating a new conversation');
    }
  }
}

export default ConversationService;
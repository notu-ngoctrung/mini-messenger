import { Conversation, Message, User } from "../database";
import Sequelize from 'sequelize';
import ReqError from "./error.service";

class ConversationService {
  static async searchAllConversations(userID) {
    let err;
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
    }).catch((e) => { err = e; });
    if (err)
      throw new ReqError(409, 'An error happens when searching all conversations');
    return conversations;
  }
  
  static async searchAConversation(userID1, userID2) {
    let err;
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
    }).catch((e) => { err = e; });
    if (err)
      throw new ReqError(409, 'An error happens when searching for a conversation');
    return conversation;
  }

  static async createNewConversation(userID1, userID2) {
    let err;
    const conversation = await Conversation.create({
      user_id_1: userID1,
      user_id_2: userID2
    }).catch((e) => { err = e; });
    if (err)
      throw new ReqError(409, 'An error happens when creating a new conversation');
    return conversation;
  }
}

export default ConversationService;
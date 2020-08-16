import dotenv from 'dotenv';
import { db, User } from '../models';
import ReqError from './error.service';

dotenv.config();

const jwt = require('jsonwebtoken');

class UserService {
  static generateJWTToken(userID) {
    const jwtToken = jwt.sign({
      userID: userID
    },
    process.env.SECRET_KEY, {   
      expiresIn: '300m'
    });
    return jwtToken;
  }

  static decodeUserID(token) {
    if (token) {
      const verfiedUser = jwt.verify(token, process.env.SECRET_KEY);
      return verfiedUser.userID;
    } else
      throw new ReqError(400, 'Authorization token is empty');
  }

  static async searchForUsername(username) {
    try {
      const result = await db.transaction(async (t) => {
        const user = await User.findOne({
          where: { username: username }
        }, { transaction: t });
        return user;
      });

      if (result === null)
        throw new ReqError(404, `User ${username} is not found`);
      return result;
    }
    catch (err) {
      console.log('searchForUsername error: ', err.message);
      if (err instanceof ReqError)
        throw err;
      throw new ReqError(400, `An error happens when searching for ${username}`);
    }
  }

  static async searchForID(userID) {
    try {
      const result = await db.transaction(async (t) => {
        const user = await User.findByPk(userID, { transaction: t });
        return user;
      });
      
      if (result === null)
        throw new ReqError(404, `User searched by ID is not found`);
      return result;
    }
    catch (err) {
      console.log('searchForID error: ', err.message);
      if (err instanceof ReqError)
        throw err;
      throw new ReqError(409, 'An error happens when searching for userID');
    }
  }

  static async addUser(username, hashPwd) {
    let err;
    try {
      const result = await db.transaction(async (t) => {
        const user = await User.create({
          username: username,
          password: hashPwd
        }, { transaction: t });
        return user;
      });

      return result;
    }
    catch (err) {
      console.log('addUser error: ', err.message);
      throw new ReqError(409, `An error happens when adding ${username}`);
    }
  }
}

export default UserService;
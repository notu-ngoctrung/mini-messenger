/* eslint-disable max-len */
import dotenv from 'dotenv';
import {sequelize, User} from '../models';
import ReqError from './error.service';

dotenv.config();

const jwt = require('jsonwebtoken');

/**
 * Provides UserController & some middlewares with an access to the User table
 */
class UserService {
  /**
   * Generates a JWT token for authorization
   * @param {string} username username of the user
   * @param {number} userID userID in the database
   * @return {string} JWT token represents the username and userID
   */
  static generateJWTToken(username, userID) {
    const jwtToken = jwt.sign({
      username: username,
      userID: userID,
    },
    process.env.SECRET_KEY, {
      expiresIn: '300m',
    });
    return jwtToken;
  }

  /**
   * Returns the user in the database
   * @param {string} username username of the user
   */
  static async getUserByName(username) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const user = await User.findOne({
          where: {username: username},
        }, {transaction: t});
        return user;
      });

      if (result === null) {
        throw new ReqError(404, `User ${username} is not found`);
      }
      return result;
    } catch (err) {
      console.log('getUserByName error: ', err.message);
      if (err instanceof ReqError) {
        throw err;
      }
      throw new ReqError(400, `An error happens when searching for ${username}`);
    }
  }

  /**
   * Returns the user in the database, searched by the username
   * @param {string} username username of the user
   */
  static async searchForUsername(username) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const user = await User.findOne({
          where: {username: username},
        }, {transaction: t});
        return user;
      });
      return (result !== null);
    } catch (err) {
      console.log('searchForUsername error: ', err.message);
      if (err instanceof ReqError) {
        throw err;
      }
      throw new ReqError(400, `An error happens when searching for ${username}`);
    }
  }

  /**
   * Returns the user in the database, searched by its ID
   * @param {number} userID user ID in the database
   */
  static async searchForID(userID) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const user = await User.findByPk(userID, {transaction: t});
        return user;
      });

      if (result === null) {
        throw new ReqError(404, `User searched by ID is not found`);
      }
      return result;
    } catch (err) {
      console.log('searchForID error: ', err.message);
      if (err instanceof ReqError) {
        throw err;
      }
      throw new ReqError(409, 'An error happens when searching for userID');
    }
  }

  /**
   * Adds a new user into database
   * @param {string} username username of the user
   * @param {string} hashPwd the encrypted password to store
   */
  static async addUser(username, hashPwd) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const user = await User.create({
          username: username,
          password: hashPwd,
        }, {transaction: t});
        return user;
      });

      return result;
    } catch (err) {
      console.log('addUser error: ', err.message);
      throw new ReqError(409, `An error happens when adding ${username}`);
    }
  }
}

export default UserService;

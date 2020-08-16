import dotenv from 'dotenv';
import { User } from '../database';
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
    let err;
    const user = await User.findOne({
      where: { username: username }
    }).catch((e) => { err = e; });
    if (err)
      throw new ReqError(400, `An error happens when searching for ${username}`);
    if (user === null)
      throw new ReqError(404, `User ${username} is not found`);
    return user;
  }

  static async searchForID(userID) {
    let err;
    const user = await User.findByPk(userID).catch((e) => {
      err = e;
    });
    if (err)
      throw new ReqError(409, 'An error happens when searching for userID');
    if (user === null)
      throw new ReqError(404, `User searched by ID is not found`);
    return user;
  }

  static async addUser(username, hashPwd) {
    let err;
    const user = await User.create({
      username: username,
      password: hashPwd
    }).catch((e) => { err = e; });
    if (err)
      throw new ReqError(409, `An error happens when adding ${username}`);
    return user;
  }
}

export default UserService;
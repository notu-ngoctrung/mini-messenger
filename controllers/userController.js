/* eslint-disable max-len */
import bcrypt from 'bcrypt';
import UserService from '../services/user.service';
import ReqError from '../services/error.service';

/**
 * Controllers to process requests related to user
 */
class UserController {
  /**
   * Registers a new user if not exists
   * @param {*} req HTTP request (should contain both username and password in its body)
   * @param {*} res HTTP response (JWT token as JSON or an error message)
   */
  static async registerUser(req, res) {
    await bcrypt.hash(req.body.password, 10, async (err, hashPwd) => {
      if (err) {
        console.log('Error in userController.registerUser: ', err);
        res.status(409).send(`An error happens when encrypting the password of ${req.body.username}`);
        return;
      }
      try {
        const isFound = await UserService.searchForUsername(req.body.username);
        if (isFound) {
          res.status(409).send(`User '${req.body.username}' has already registered`);
        } else {
          const user = await UserService.addUser(req.body.username, hashPwd);
          res.status(200).json({
            token: UserService.generateJWTToken(req.body.username, user.id),
          });
        }
      } catch (err) {
        res.status(err.statusCode || 409).send(ReqError.getErrMessage(err));
      }
    });
  }

  /**
   * Logins a user to the system with username and password
   * @param {*} req HTTP request (should contain username in its body)
   * @param {*} res HTTP response (JWT token as JSON or an error message)
   */
  static async login(req, res) {
    try {
      const user = await UserService.getUserByName(req.body.username);
      if (user) {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) {
            res.status(409).send('Some error happens');
          } else if (!result) {
            res.status(409).send('Password mismatched');
          } else {
            res.status(200).json({
              token: UserService.generateJWTToken(req.body.username, user.id),
            });
          }
        });
      }
    } catch (err) {
      res.status(err.statusCode || 409).send(ReqError.getErrMessage(err));
    }
  }

  /**
   * Searches for a user by its username
   * Returns true if user exists. Otherwise, false
   * @param {*} req HTTP request (should contains username as a param)
   * @param {*} res HTTP response (an informing message)
   */
  static async searchForUsername(req, res) {
    try {
      const isFound = await UserService.searchForUsername(req.params.username);
      if (isFound) {
        res.status(200).send(`${req.params.username} is found`);
      } else {
        res.status(404).send(`${req.params.username} is not in database`);
      }
    } catch (err) {
      res.status(err.statusCode || 409).send(ReqError.getErrMessage(err));
    }
  }
}

export default UserController;

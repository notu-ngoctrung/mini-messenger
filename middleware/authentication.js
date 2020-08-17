/* eslint-disable max-len */
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import UserService from '../services/user.service';
dotenv.config();

const verifyRequest = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    jwt.verify(req.headers.authorization, process.env.SECRET_KEY, (err, verifiedUser) => {
      if (err) {
        console.log('verifyRequest error: ', err.message);
        res.status(400).send('Token verfication failed');
        return;
      }
      try {
        UserService.searchForID(verifiedUser.userID);
        req.userID = verifiedUser.userID;
        req.username = verifiedUser.username;
        next();
      } catch (err) {
        res.status(400).send(`User ${verifiedUser.username} is no longer in the database`);
      }
    });
  } else {
    res.status(400).send('Empty header');
  }
};

export default verifyRequest;

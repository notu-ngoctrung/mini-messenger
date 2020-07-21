import bcrypt from 'bcrypt';
import Sequelize from 'sequelize';
import config from '../config';
import { User } from '../database';

const jwt = require('jsonwebtoken');
const UserController = {};

UserController.registerUser = async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  console.log(req.body, hash);
  const user = await User.create({
    username: req.body.username,
    password: hash
  }).then(() => {
    res.status(200).end();
  }).catch((err) => {
    res.status(409).send(err);
  });
};

UserController.login = async (req, res) => {
  const user = await User.findOne({
    where: { username: req.body.username }
  });
  if (user === null)
    res.status(404).send('User not found');
  else 
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (!result)
        res.status(409).send('Password mismatched');
      else {
        console.log('matched');
        const token = jwt.sign({
          userID: user.id
        },
        config.keys.secret, {
          expiresIn: '300m'
        });
    
        res.status(200).json({
          success: true,
          jwtToken: token
        });
      }
    });
};

UserController.searchForUsername = async (req, res) => {
  console.log(req.params.username);
  const user = await User.findOne({
    where: { username: req.params.username }
  }).catch(() => {
    res.status(400).send(`An error happened in finding ${req.params.username}`);
  });
  if (user === null) 
    res.status(404).send(`${req.params.username} not found`);
  else
    res.status(200).end();
};

export default UserController;
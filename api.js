import express from 'express';
import bcrypt from 'bcrypt';
import User from './index.js';

const route = express.Router();

route.post('/api/register', async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  try {
    const user = await User.create({
      username: req.body.username,
      password: hash
    });
    const data = user.authorize();
    return res.json(data);
  } catch (err) {
    return res.status(400).send(err);
  }
});

export default route;
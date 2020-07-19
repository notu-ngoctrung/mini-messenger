import express from 'express';
import router from './test-api';
import {db, User} from './test-db';

const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;

app.use(router);

http.listen(port, async () => {
  console.log("connected");
  db.authenticate()
    .then(() => {
      console.log("database connected");
    })
    .catch((err) => {
      console.log("failed to connect to database", err);
    });
  db.sync();
  User.sync();
  // User.create({
  //   username: 'hahaha',
  //   password: 'shouldbelaterencrypted'
  // }).then(() => {
  //   console.log("created successfully");
  // }).catch(() => {});
  const users = await User.findAll();
  console.log(users.every(user => user instanceof User)); // true
  console.log("All users:", JSON.stringify(users, null, 2));
});
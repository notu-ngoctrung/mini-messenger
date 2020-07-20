import express from 'express';
import router from './test-api';
import {db, User, Conversation, Message} from './test-db';

const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;

app.use(router);

async function createDatabase() {
  const user = await User.create({
    username: '123',
    password: 'duma'
  });
  const user2 = await User.create({
    username: '1233',
    password: 'duma'
  });
  const user3 = await User.create({
    username: '12334',
    password: 'duma'
  });
  const conve = await Conversation.create({
    user_id_1: 1,
    user_id_2: 2
  });
  const conve2 = await Conversation.create({
    user_id_1: 2,
    user_id_2: 3
  });
  const mess = await Message.create({
    conversation_id: 1,
    content: 'dkdkd'
  });
}

async function printAll() {
  let users = await User.findAll({
    include: [{
      model: Conversation,
      as: 'sender'
    }]
  });
  const convs = await Conversation.findAll({
    include: [{
      model: Message,
      as: 'message'
    }]
  });
  const mess = await Message.findAll();
  console.log('begin printing');
  console.log(JSON.stringify(users, null, 2));
  console.log(JSON.stringify(convs, null, 2));
  console.log(JSON.stringify(mess, null, 2));
}

async function doSomething() {
  const message = await Message.create({
    conversation_id: 1,
    content: 'a new message'
  });
  console.log(message.createdAt);
}

http.listen(port, async () => {
  console.log("connected");
  db.authenticate()
    .then(() => {
      console.log("database connected");
    })
    .catch((err) => {
      console.log("failed to connect to database", err);
    });
  await db.sync({force: true});
  await User.sync();
  await Conversation.sync();
  await Message.sync();
  await createDatabase();
  await printAll();
  await User.findAll({
    where: {
      id: 3
    }
  }).then((users) => {
    users.every((user) => {
      // await Conversation.destroy({
      //   where: {
      //     user_id_2: user.id
      //   }
      // });
      // user.sender.destroy();
      user.destroy();
      console.log('completed ');
    });
  });
  await printAll();
  await User.create({
    username: '324',
    password: '34'
  });
  const users = await User.findAll({
    include: [{
      model: Conversation,
      as: 'receiver'
    }]
  });
  await doSomething();
  await printAll();
  // users.getConversation();
  // console.log(mess.toJSON());
});
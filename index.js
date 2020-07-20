import express from 'express';
import route from './api';
import {db, User, Conversation, Message} from './database';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;
const socketMap = new Map();

app.use('/static', express.static(__dirname + '/static'));
app.use(route);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    console.log(`User {${username}} joined the chat`);
    socketMap.set(username, socket.id);
  });
  socket.on('message', (sender, receiver, data) => {
    console.log(`${sender} sent a message to ${receiver}`);
    try {
      socket.to(socketMap.get(receiver)).emit('message-new', sender, receiver, data);
    } 
    catch (err) {
      console.log(`An error happened when ${sender} sent a message to ${receiver}`);
    }
  });
});
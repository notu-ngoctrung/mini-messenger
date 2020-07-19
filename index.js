import express from 'express';
import Sequelize from 'sequelize';
 import route from './api';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.use('/static', express.static(__dirname + '/static'));
app.use(route);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    console.log(`User {${username}} joined the chat`);
    socket.broadcast.emit('user-new', username);
  });

  socket.on('leave', (username) => {
    console.log(`User {${username}} left the chat`);
    socket.broadcast.emit('user-left', data);
  });

  socket.on('message', (username, data) => {
    console.log(`${username} sent a message`);
    socket.broadcast.emit('message-new', username, data);
  });
});

/**
 * Database
 */
const db = new Sequelize('minimessenger', 'postgres', 'abc123', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});
const User = db.define('user', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: { 
    type: Sequelize.STRING,
    allowNull: false
  },
  createdAt: { 
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
});

/**
 * Http
 */
http.listen(port, async () => {
  db.authenticate()
    .then(() => {
      console.log('Connection established successfully');
    })
    .catch((err) => {
      console.log('Failed to connect to database');
    });
});

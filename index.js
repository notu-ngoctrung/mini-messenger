const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, () => {
  console.log(`Server is working on ${port}`);
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
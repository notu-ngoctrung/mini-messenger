const express = require('express');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const app = express();
const port = process.env.PORT || 3000;

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, () => {
  console.log(`Server is working on ${port}`);
});

io.on('connection', (socket) => {

});

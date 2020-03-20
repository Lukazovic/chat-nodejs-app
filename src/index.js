const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
  console.log('New Websocket connection');

  socket.emit('sendMessage', generateMessage('Welcome!'));
  socket.broadcast.emit(
    'sendMessage',
    generateMessage('A new user has joined!')
  );

  socket.on('newMessage', (newMessage, callback) => {
    const filter = new Filter();

    if (filter.isProfane(newMessage)) {
      return callback('Profanity is not allowed');
    }

    io.emit('sendMessage', generateMessage(newMessage));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    io.emit(
      'sendLocationMessage',
      generateLocationMessage(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    io.emit('sendMessage', generateMessage('A user has left!'));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

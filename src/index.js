const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
  console.log('New Websocket connection');

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('sendMessage', generateMessage(user.username, 'Welcome!'));
    socket.broadcast
      .to(user.room)
      .emit(
        'sendMessage',
        generateMessage(user.username, `${user.username} has joined!`)
      );

    callback();
  });

  socket.on('newMessage', ({ id, message }, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }

    const user = getUser(id);

    io.emit('sendMessage', generateMessage(user.username, message));
    callback();
  });

  socket.on('sendLocation', (id, coords, callback) => {
    const user = getUser(id);

    io.emit(
      'sendLocationMessage',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'sendMessage',
        generateMessage(user.username, `${user.username} has left!`)
      );
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

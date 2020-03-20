const Filter = require('bad-words');

const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return { error: 'Username and Room are required!' };
  }

  const filter = new Filter();

  if (filter.isProfane(username) || filter.isProfane(room)) {
    return { error: 'Profanity is not allowed' };
  }

  const existingUser = users.find(
    user => user.room === room && user.username === username
  );

  if (existingUser) {
    return { error: 'Username is already is use!' };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

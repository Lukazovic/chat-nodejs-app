const socket = io();

// Elementes
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.on('sendMessage', message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('hh:mm A')
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('sendLocationMessage', location => {
  console.log(location);
  const html = Mustache.render(locationMessageTemplate, {
    locationURL: location.url,
    createdAt: moment(location.createdAt).format('hh:mm A')
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

document.querySelector('#message-form').addEventListener('submit', e => {
  $messageFormButton.setAttribute('disabled', 'disabled');

  e.preventDefault();
  const inputMessage = e.target.elements.message.value;
  socket.emit('newMessage', inputMessage, error => {
    $messageFormButton.removeAttribute('disabled');

    if (error) {
      return console.log(error);
    }

    $messageFormInput.value = '';
    $messageFormInput.focus();
    console.log('Message delivered!');
  });
});

$sendLocationButton.addEventListener('click', () => {
  $sendLocationButton.setAttribute('disabled', 'disabled');
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser!');
  }

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        console.log('Location shared!');
        $sendLocationButton.removeAttribute('disabled');
      }
    );
  });
});

socket.emit('join', { username, room });

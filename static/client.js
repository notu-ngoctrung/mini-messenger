// import io from 'socket.io-client';

const form = document.querySelector('form');
const input = document.querySelector('.input'); // Get the first element named 'input'
const messages = document.querySelector('.messages'); 
let username, password;

function checkUsername(username) {
  
}

function login(username, password) {

}

while (true) {
  username = prompt('Please enter a username: ', '');
  if (checkUsername(username)) {
    password = prompt('Enter your password: ', '');
    if (login(username, password))
      break;
  } else 
    alert('Your username is not found in our database. Try another');
}

const socket = io();

form.addEventListener('submit', (event) => {
  event.preventDefault();

  addMessage(`${username}: ${input.value}`);
  socket.emit('message', username, input.value);

  input.value = '';
  return false;
}, false);

addMessage(`Me: You have joined the chat as ${username}.`);

function addMessage(message) {
  const li = document.createElement('li');
  li.innerHTML = message;
  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
}

socket.emit('join', username);

socket.on('user-new', (username) => {
  addMessage(`${username} has joined the chat.`);
});

socket.on('user-left', (username) => {
  addMessage(`${username} has left the chat.`);
});

socket.on('message-new', (username, data) => {
  addMessage(`${username}: ${data}`);
});


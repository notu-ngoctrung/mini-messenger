// import io from 'socket.io-client';

const form = document.querySelector('form');
const messageInput = document.querySelector('.messageInput'); 
const userInput = document.querySelector('.userInput'); 
const currentConversation = document.querySelector('.messages'); 

const conversations = [];

let currentPeerName = '';

askUser()
  .then(({username, token}) => {
    const socket = io();

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      processMessage(currentPeerName, currentPeerName, username, input.value);
      socket.emit('message', username, currentPeerName, input.value);
    
      input.value = '';
      return false;
    }, false);

    // addMessage(`Me: You have joined the chat as ${username}.`);

    socket.emit('join', username);

    // socket.on('user-new', (username) => {
    //   addMessage(`${username} has joined the chat.`);
    // });
    
    // socket.on('user-left', (username) => {
    //   addMessage(`${username} has left the chat.`);
    // });
    
    socket.on('message-new', (sender, data) => processMessage(currentPeerName, sender, sender, data));
  });

/** Helpers function (later moved) */

function processMessage(currentPeerName, peerName, sender, data) {
  conversations.forEach(conversation => {
    if (conversation.username === sender) {
      conversation.messages.append({

      })
    }
  });
}

function addMessage(message) {
  const li = document.createElement('li');
  li.innerHTML = message;
  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
}

async function checkUsername(username) {
  let isTaken = true;
  await fetch(`/api/user/${username}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  }).then((res) => {
    if (res.status === 404)
      isTaken = false;
    console.log(res.status, 'djfjdsjsd');
  }).catch(() => {
    console.log('sdkdkd');
  });
  return isTaken;
}

async function login(username, password) {
  let isSuccessful = true;
  let token = '';
  await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({
      username: username,
      password: password
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  }).then((res) => {
    console.log(res.status);
    if (res.status === 404 || res.status === 409) 
      isSuccessful = false;
    else {
      token = res.body.jwtToken;
      console.log(res.body);
    }
  });
  return { isSuccessful, token };
}

async function register(username, password) {
  console.log('password: ', password);
  let isSuccessful = true;
  await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      username: username,
      password: password
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  }).then((res) => {
    if (res.status === 409) {
      isSuccessful = false;
      console.log(res.body);
    }
  });
  return isSuccessful;
}

async function askUser() {
  let username, password;
  while (true) {
    username = prompt('Enter your username: ', '');
    if (await checkUsername(username)) {
      password = prompt('Enter your password: ', '');
    } else {
      password = prompt('User is not registered. Enter your password to register: ', '');
      if (!(await register(username, password)))
        continue;
    }
    const { isSuccessful, token } = await login(username, password);
    if (isSuccessful) {
      alert('Login successfully');
      return { username, token };
    } else
      alert('Login failed. Please try again!');
  }
}
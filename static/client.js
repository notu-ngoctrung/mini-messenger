// import io from 'socket.io-client';

const messageForm = document.querySelector('#messageForm');
const userForm = document.querySelector('#userForm');
const messageInput = document.querySelector('#messageInput'); 
const userInput = document.querySelector('#userInput'); 
const userList = document.querySelector('#user-list');
const currentConversation = document.querySelector('.messages'); 

/**
 * {
 *   peerName: string
 *   messages: [...content]
 * }
 */
const conversations = [];

// Disable form at the beginning
for(let i = 0; i < messageForm.elements.length; i++) 
  messageForm.elements[i].readOnly = true;

let currentPeerName = '';

askUser()
  .then(async ({username, token}) => {
    const socket = io();

    await getInitialDataFromServer(username, token);

    userForm.addEventListener('submit', async (event) => {
      console.log('dkfkf');
      event.preventDefault();
      if (searchForConversation(userInput.value) === false)  {
        let isSuccessful = await addNewConversation(username, userInput.value, token);
        if (!isSuccessful)
          alert('Cannot create a new conversation');
        else
           socket.emit('conversation', username, userInput.value);
      }
      resetMessageList(userInput.value);
      userInput.value = '';
    });

    messageForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = `${username}: ${messageInput.value}`;
      processMessage(currentPeerName, currentPeerName, message);
      postMessage(currentPeerName, message, token);
      socket.emit('message', username, currentPeerName, message);
      messageInput.value = '';
      return false;
    }, false);

    // addMessage(`Me: You have joined the chat as ${username} ${token}.`);

    socket.emit('join', username);
    
    socket.on('message-new', (sender, data) => processMessage(currentPeerName, sender, data));
    socket.on('conversation-new', async (sender) => {
      let isSuccessful = await addNewConversation(username, sender, token);
      if (!isSuccessful)
        alert('Cannot create a new conversation');
    });
  });

/** Helpers functions (will be moved later) */

// Do more efficiently??
function searchForConversation(peerName) {
  for(let i = 0; i < conversations.length; i++)
    if (conversations[i].peerName === peerName)
      return true;
  return false;
}

function addMessage(message) {
  const li = document.createElement('li');
  li.innerHTML = message;
  currentConversation.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
}

// Do something more efficiently????
function resetMessageList(peerName) {
  currentPeerName = peerName;
  currentConversation.innerHTML = '';
  for(let i = 0; i < conversations.length; i++) {
    const conversation = conversations[i];
    if (conversation.peerName === peerName) {
      for(let j = 0; j < conversation['messages'].length; j++)
        addMessage(conversation['messages'][j]);
      break;
    }
  }
  if (conversations.length > 0)
    for(let i = 0; i < messageForm.elements.length; i++) 
      messageForm.elements[i].readOnly = false;
}

async function addNewConversation(myName, peerName, token) {
  let isSuccessful = true;
  await fetch('/api/conversation', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Authorization': token
    },
    body: JSON.stringify({
      peerName: peerName
    })
  }).then((res) => {
    if (res.status === 400 || res.status === 404) {
      console.log('addNewConversation: ', res.json());
      isSuccessful = false;
    }
  }).catch((err) => {
    isSuccessful = false;
    console.log('addNewConversation: ', err);
  });
  if (!isSuccessful)
    return isSuccessful;
  conversations.push({
    peerName: peerName,
    messages: []
  });
  addNewConversationHTML(peerName);
  return true;
}

function addNewConversationHTML(peerName) {
  const li = document.createElement('li');
  const conversationButton = document.createElement('button');
  conversationButton.className = 'conversation-button';
  conversationButton.innerHTML = peerName;
  conversationButton.peerName = peerName;
  conversationButton.addEventListener('click', (event) => resetMessageList(event.target.peerName));
  li.appendChild(conversationButton);
  userList.appendChild(li);
}

async function getInitialDataFromServer(username, token) {
  fetch('/api/conversation', {
    method: 'GET',
    headers: {
      'Authorization': token
    }
  }).then((res) => res.json())
    .then((res) => {
      let resObj = JSON.parse(res);
      console.log(resObj);
      for(let i = 0; i < resObj.length; i++) {
        const messages = [];
        const peerName = (resObj[i].convUser_1.username === username ? resObj[i].convUser_2.username : resObj[i].convUser_1.username);
        for(let j = 0; j < resObj[i]['messages'].length; j++)
          messages.push(resObj[i]['messages'][j].content);
        conversations.push({
          peerName: peerName,
          messages: messages
        });
        // Add HTML element
        addNewConversationHTML(peerName);
      }
      if (conversations.length > 0)
        for(let i = 0; i < messageForm.elements.length; i++) 
          messageForm.elements[i].readOnly = false;
    });
}

function processMessage(currentPeerName, peerName, message) {
  // use foreach
  for(let i = 0; i < conversations.length; i++) {
    const conversation = conversations[i];
    if (conversation.peerName === peerName) {
      conversation.messages.push(message);
      break;
    }
  }
  if (currentPeerName === peerName)
    addMessage(message);
}

async function postMessage(receiver, message, token) {
  fetch('/api/conversation/message', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Authorization': token
    },
    body: JSON.stringify({
      receiver: receiver,
      content: message
    })
  });
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
    // console.log(res.status, 'djfjdsjsd');
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
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  }).then((res) => res.json())
    .then((res) => {
    console.log(res.status);
    if (res.status === 404 || res.status === 409) 
      isSuccessful = false;
    else 
      token = res.jwtToken;
  });
  return { isSuccessful, token };
}

async function register(username, password) {
  console.log('password: ', password);
  let isSuccessful = true;
  await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
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
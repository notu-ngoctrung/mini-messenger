/**
 * Creates a HTML element to display a message
 * @param {string} message A message to be displayed
 */
function addMessage(message) {
  const li = document.createElement('li');
  li.innerHTML = message;
  currentConversation.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
}

/**
 * Checks if we have the conversation with a given user or not
 * Note: Should be improved for performance
 * @param {string} peerName A username of another different user to be looked for
 * @returns {boolean} true if we've already had the conversation; false, otherwise
 */
function searchForConversation(peerName) {
  for(let i = 0; i < conversations.length; i++)
    if (conversations[i].peerName === peerName)
      return true;
  return false;
}

/**
 * Changes the message lists on HTML so that we can chat with a given user from now on
 * Note: Should be improved for performance
 * @param {string} peerName A username of another different user
 */
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
  // Unfreeze the message textbox when we have some conversation to chat
  if (conversations.length > 0)
    for(let i = 0; i < messageForm.elements.length; i++) 
      messageForm.elements[i].readOnly = false;
}

/**
 * Adds a new conversation in HTML code (locally)
 * @param {string} peerName A username of another different user
 */
function addNewConversationHTML(peerName) {
  const li = document.createElement('li');
  const conversationButton = document.createElement('button');
  conversationButton.className = 'btn btn-dark w-100';
  conversationButton.innerHTML = peerName;
  conversationButton.peerName = peerName;
  conversationButton.addEventListener('click', (event) => resetMessageList(event.target.peerName));
  li.appendChild(conversationButton);
  userList.appendChild(li);
}

/**
 * Adds a new conversation between us and the peerName user
 * @param {string} peerName A username of another different user
 * @param {string} token A unique token to contact with the server
 */
async function addNewConversation(peerName, token) {
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

/**
 * Retrieves all of our conversations from the server to display locally
 * @param {string} username Our username
 * @param {string} token A unique token to contact with the server
 */
async function getInitialDataFromServer(username, token) {
  fetch('/api/conversation', {
    method: 'GET',
    headers: {
      'Authorization': token
    }
  }).then((res) => res.json())
    .then((res) => {
      let resObj = JSON.parse(res);
      // console.log(resObj);
      for(let i = 0; i < resObj.length; i++) {
        const messages = [];
        const peerName = (resObj[i].convUser_1.username === username ? resObj[i].convUser_2.username : resObj[i].convUser_1.username);
        for(let j = 0; j < resObj[i]['messages'].length; j++)
          messages.push(resObj[i]['messages'][j].content);
        conversations.push({
          peerName: peerName,
          messages: messages
        });
        addNewConversationHTML(peerName);
      }
      if (conversations.length > 0)
        for(let i = 0; i < messageForm.elements.length; i++) 
          messageForm.elements[i].readOnly = false;
    });
}

/**
 * Processes an incoming message, given the message itself and the involved user
 * @param {string} currentPeerName Username of the current user we're chatting with
 * @param {string} peerName Username of the user involving in the given message
 * @param {string} message The message to be processed
 */
function processMessage(currentPeerName, peerName, message) {
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

/**
 * Sends a message to the server
 * @param {string} receiver Receiver's username
 * @param {string} message The given message
 * @param {string} token A unique token to contact with the server
 */
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

/**
 * Checks if the username is taken on the server or not
 * @param {string} username A username to be checked
 * @returns {boolean} true if taken; otherwise, false
 */
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
  }).catch((err) => {
    console.log('checkUsername: ', err);
  });
  return isTaken;
}

/**
 * Makes an attempt to login a user
 * @param {string} username
 * @param {string} password 
 * @returns {Object} Includes: isSuccessful (true if login successfully) and a unique token to contact with the server
 */
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
    // console.log(res.status);
    if (res.status === 404 || res.status === 409) 
      isSuccessful = false;
    else 
      token = res.jwtToken;
  });
  return { isSuccessful, token };
}

/**
 * Makes an attempt to register a user
 * @param {string} username 
 * @param {string} password 
 * @returns {boolean} true if register successfully; otherwise, false
 */
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

/**
 * Freezes the message form in HTML code so that the user is not allowed to chat
 * Note: Should be improved in implementation
 * @param {Element} messageForm 
 */
function disableTextMode(messageForm) {
  for(let i = 0; i < messageForm.elements.length; i++) 
    messageForm.elements[i].readOnly = true;
}
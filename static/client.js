const messageForm = document.querySelector('#messageForm');
const userForm = document.querySelector('#userForm');
const messageInput = document.querySelector('#messageInput'); 
const userInput = document.querySelector('#userInput'); 
const userList = document.querySelector('#user-list');
const currentConversation = document.querySelector('.messages'); 

let currentPeerName = '';
/**
 * {
 *   peerName: string
 *   messages: [...content]
 * }
 */
const conversations = [];

disableTextMode(messageForm);

askUser()
  .then(async ({username, token}) => {
    const socket = io();

    await getInitialDataFromServer(username, token);

    userForm.addEventListener('submit', async (event) => {
      console.log('dkfkf');
      event.preventDefault();
      if (searchForConversation(userInput.value) === false)  {
        let isSuccessful = await addNewConversation(userInput.value, token);
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

    socket.emit('join', username);
    
    socket.on('message-new', (sender, data) => processMessage(currentPeerName, sender, data));
    socket.on('conversation-new', async (sender) => {
      let isSuccessful = await addNewConversation(sender, token);
      if (!isSuccessful)
        alert('Cannot create a new conversation');
    });
  });

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
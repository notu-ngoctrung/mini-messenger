import express from 'express';
import UserController from './controller/userController';
import ConversationController from './controller/conversationController';

const route = express.Router();

route.post('/api/register', UserController.registerUser);

route.post('/api/login', UserController.login);

route.post('/api/conversation', ConversationController.createOneConversation);

route.get('/api/conversation', ConversationController.getAllConversations);

route.put('/api/conversation/delete', ConversationController.deleteOneConversation);

route.post('/api/conversation/message', ConversationController.sendOneMessage);

route.get('/api/user/:username', UserController.searchForUsername);

export default route;

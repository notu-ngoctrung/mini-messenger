import express from 'express';
import UserController from '../controllers/userController';
import ConversationController from '../controllers/conversationController';
import verifyRequest from '../middleware/authentication';

const router = express.Router();

/**
 * Registers a user if not exists
 * Request: {
 *    method: POST,
 *    headers: {Content-Type},
 *    body: {username, password}
 * }
 * Response: {
 *    status: 200/409 (with an error message),
 *    json: {username, token}
 * }
 */
router.post('/api/register', UserController.registerUser);

/**
 * Logins a user to the system
 * Request: {
 *    method: POST,
 *    headers: {Content-Type},
 *    body: {username, password}
 * }
 * Response: {
 *    status: 200/404/409 (with an error message),
 *    json: {username, token}
 * }
 */
router.post('/api/login', UserController.login);

/**
 * Creates a conversation between two users if not exists
 * Request: {
 *    method: POST,
 *    headers: {Content-Type, Authorization},
 *    body: {peerName}
 * }
 * Response: {
 *    status: 200/400/404 (with an error message)
 * }
 */
router.post('/api/conversation', verifyRequest, ConversationController.createOneConversation);

/**
 * Get all conversations in which a given user is involved
 * Request: {
 *    method: POST,
 *    headers: {Content-Type, Authorization}
 * }
 * Response: {[
 *    {
 *      createdAt,
 *      messages: [{content}...],
 *      convUser_1: {username}
 *      convUser_2: {username}
 *    }...
 * ]}
 */
router.get('/api/conversation', verifyRequest, ConversationController.getAllConversations);

/**
 * Delete a conversation of two users
 * Request: {
 *    method: PUT,
 *    headers: {Content-Type, Authorization},
 *    body: {peerName}
 * }
 * Response: {
 *    status: 200/400 (with an error message)
 * }
 */
router.put('/api/conversation/delete', verifyRequest, ConversationController.deleteOneConversation);

/**
 * Sends a message from a user to another
 * Request: {
 *    method: POST,
 *    headers: {Content-Type, Authorization},
 *    body: {receiver, content}
 * }
 * Response: {
 *    status: 200/400 (with an error message)
 * }
 */
router.post('/api/conversation/message', verifyRequest, ConversationController.sendOneMessage);

/**
 * Searchs for a user based on its username
 * Request: {
 *    method: GET,
 *    params: {username}
 * }
 * Response: {
 *    status: 200/404/400 (with an error message)
 * }
 */
router.get('/api/user/:username', UserController.searchForUsername);

export default router;

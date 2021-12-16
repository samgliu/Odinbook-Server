const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const postController = require('../controllers/PostController');
const commentController = require('../controllers/CommentController');
const authMiddleware = require('../middleware/auth');
/* GET home page. */
router.get('/', authMiddleware.verifyToken, userController.index_get);

/* refresh new accessToken */
router.get('/refreshNewAccessToken', userController.refreshNewAccessToken_get);

/* User Routes */
router.get('/signup', userController.signup_get);
router.post('/signup', userController.signup_post);
router.get('/signin', userController.signin_get);
router.post('/signin', userController.signin_post);

module.exports = router;

const express = require('express');
const { body, check, validationResult } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/UserController');
const postController = require('../controllers/PostController');
const commentController = require('../controllers/CommentController');
const authMiddleware = require('../middleware/auth');
const getUserMiddleware = require('../middleware/getUser');
const postAuthValidatorMiddleware = require('../middleware/postAuthValidator');
const cmtAuthValidatorMiddlerware = require('../middleware/cmtAuthValidator');
/* GET home page. */
router.get(
    '/',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.index_get
);

/* refresh new accessToken */
router.get('/refreshNewAccessToken', userController.refreshNewAccessToken_get);

/* User Routes */
router.get('/signup', userController.signup_get);
router.post('/signup', userController.signup_post);
router.get('/signin', userController.signin_get);
router.post(
    '/signin',
    [
        body('email', 'Email required').isLength({ min: 3 }).escape(),
        body('password', 'Password required').isLength({ min: 5 }).escape(),
    ],
    userController.signin_post
);
router.get('/logout', userController.logout_get);
router.get(
    '/user-search',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.user_search_get
);
router.put(
    // make friend with target id
    '/:tid/request-friend',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.friend_request_put
);
router.put(
    // accept friend with target id
    '/:tid/accept-friend',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.friend_accept_put
);
router.put(
    '/update',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.update_put
);
router.post(
    '/upload',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.upload_post
);

/* Post Routes */
router.get(
    '/create-post',
    authMiddleware.verifyToken,
    postController.create_post_get
);
router.post(
    '/create-post',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postController.create_post_post
);
router.get(
    '/:id',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postController.post_get
);
router.delete(
    '/:id/delete',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postAuthValidatorMiddleware.postAuthValidator,
    postController.post_delete
);
/* post like put */
router.put(
    '/:id/like',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postController.like_put
);
router.put(
    '/:id/unlike',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postController.unlike_put
);

/* Comment Routes */
router.post(
    '/:id/comment-create',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    commentController.create_comment_post
);
router.delete(
    '/:id/comment/:cid/delete',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    cmtAuthValidatorMiddlerware.cmtAuthValidator,
    commentController.delete_comment_delete
);
/* comment like put */
router.put(
    '/:cid/cmt-like',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    commentController.cmt_like_put
);
router.put(
    '/:cid/cmt-unlike',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    commentController.cmt_unlike_put
);

module.exports = router;

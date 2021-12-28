const express = require('express');
const { body, check, validationResult } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/UserController');
const postController = require('../controllers/PostController');
const commentController = require('../controllers/CommentController');
const authMiddleware = require('../middleware/auth');
const refreshAuthMiddleware = require('../middleware/refreshTokenAuth');
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
router.get(
    '/refreshNewAccessToken',
    refreshAuthMiddleware.refreshTokenAuth,
    userController.refreshNewAccessToken_get
);

/* User Routes */
/* GET profile page. */
router.get(
    '/:username/profile',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.profile_get
);
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
router.get(
    // make friend with target id
    '/:tid/request-friend',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.friend_request_get
);
router.get(
    // make friend with target id
    '/:tid/unfriend',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.unfriend_get
);
router.get(
    // accept friend with target id
    '/:tid/accept-friend',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.friend_accept_get
);
router.get(
    // accept friend with target id
    '/:tid/reject-friend',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.friend_reject_get
);
// update profile data
router.put(
    '/update',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.update_put
);
// file upload
router.post(
    '/upload',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.upload_post,
    userController.upload_avatar_post
);
// file upload for new post
router.post(
    '/upload-post',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    userController.upload_post,
    userController.upload_posts_post
);

/* Post Routes */
router.get(
    '/posts',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postController.posts_get
);
router.get(
    '/create-post',
    authMiddleware.verifyToken,
    postController.create_post_get
);
router.post(
    '/create-post-self',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postController.create_post_self_post
);
router.post(
    '/:targetUsername/create-post',
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
// only for homepage post verification
router.get(
    '/:id/auth',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postAuthValidatorMiddleware.postAuthValidator,
    postController.post_auth_get
);
router.delete(
    '/:id/delete',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postAuthValidatorMiddleware.postAuthValidator,
    postController.post_delete
);
// only for profile post verification
router.get(
    '/:username/:id/profile-post-auth',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    getUserMiddleware.getTargetUser,
    postAuthValidatorMiddleware.profilePostAuthValidator,
    postController.post_auth_get
);
router.delete(
    '/:username/:id/profile-post-delete',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    getUserMiddleware.getTargetUser,
    postAuthValidatorMiddleware.profilePostAuthValidator,
    postController.post_delete
);
/* post like put */
router.get(
    '/:id/like',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postController.like_get
);
router.get(
    '/:id/unlike',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    postController.unlike_get
);

/* Comment Routes */
router.post(
    '/:id/comment-create',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    commentController.create_comment_post
);

// only for homepage post's comment verification and deletion
router.get(
    '/:id/comment/:cid/cmt-auth',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    cmtAuthValidatorMiddlerware.cmtAuthValidator,
    commentController.comment_auth_get
);
router.delete(
    '/:id/comment/:cid/delete',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    cmtAuthValidatorMiddlerware.cmtAuthValidator,
    commentController.delete_comment_delete
);
// only for profile page post's comment verification and deletion
router.get(
    '/:username/:id/comment/:cid/profile-cmt-auth',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    cmtAuthValidatorMiddlerware.cmtAuthValidator,
    commentController.profile_comment_auth_get
);
router.delete(
    '/:username/:id/comment/:cid/profile-delete',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    cmtAuthValidatorMiddlerware.cmtAuthValidator,
    commentController.profile_delete_comment_delete
);

/* comment like put */
router.get(
    '/:cid/cmt-like',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    commentController.cmt_like_get
);
router.get(
    '/:cid/cmt-unlike',
    authMiddleware.verifyToken,
    getUserMiddleware.getUser,
    commentController.cmt_unlike_get
);

module.exports = router;

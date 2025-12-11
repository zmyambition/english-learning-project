const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/list', blogController.getAllBlogs);
router.post('/create', blogController.createBlog);
router.delete('/delete', blogController.deleteBlog);
router.post('/comment', blogController.createComment);
router.delete('/comment', blogController.deleteComment);

module.exports = router;
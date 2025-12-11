const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

router.get('/list', articleController.getArticleList);
router.get('/detail', articleController.getArticleDetail);

module.exports = router;
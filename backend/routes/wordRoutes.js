const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

router.get('/search', wordController.searchWord);
router.post('/notebook', wordController.addToNotebook);

router.get('/notebook', wordController.getNotebook);
router.delete('/notebook', wordController.deleteFromNotebook);

router.get('/library', wordController.getWordLibrary);

router.get('/test-generate', wordController.getTestWords);

module.exports = router;
const express = require('express');

const router = express.Router();

const MainController = require('../controllers/mainC');

router.get('/', MainController.getIndex);

router.get('/chat', MainController.getChat);

module.exports = router;

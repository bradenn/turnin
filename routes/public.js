let express = require('express');
let router = express.Router();

router.use('/login', require('./login.js'));
router.use('/register', require('./register.js'));

module.exports = router;

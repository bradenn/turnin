let express = require('express');
let router = express.Router();
let utils = require('../services/utils');
let User = require('../models/user');
let Course = require('../models/course');

router.get('/', async (req, res, next) => {
    res.render("profile", {
    });
});


module.exports = router;
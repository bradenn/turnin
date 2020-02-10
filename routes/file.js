let express = require('express');
router = express.Router();
let User = require('../models/user');
let Course = require('../models/course');
let Test = require('../models/test');
let Assignment = require('../models/assignment');
let Output = require('../models/output');
let File = require('../models/file');
let utils = require('../services/utils');

router.get('/:file', async (req, res, next) => {
    let file = await File.findById(req.params.file).exec();
    res.render("file", {user: req.user, file: file, back: req.back})
});


module.exports = router;

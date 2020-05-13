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

let {Plagiarism, CompareTokens} = require('../services/plagarism')
let performance = require('performance-now');
router.get('/scan/:file', async (req, res, next) => {
    let file = await File.findById(req.params.file).exec();
    let file2 = await File.find({name: file.name}).exec();
    const start = performance();
    let check = new Plagiarism(file.content).tokenize();
    let work = file2.map(val => new CompareTokens(check, new Plagiarism(val.content).tokenize()).compare());
    console.log(work.filter(num => num >= 80).length);
    console.log(performance() - start);
});


module.exports = router;

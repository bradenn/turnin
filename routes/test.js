let router = require('express').Router();
let User = require('../models/user');
let Course = require('../models/course');
let Test = require('../models/test');

router.get('/:test', async (req, res, next) => {
    if (!req.user) return res.redirect("/login");
    let test = await Test.findById(req.params.test).exec();
    return res.render("test", {
        user: req.user,
        back: req.back,
        test: test
    });
});

module.exports = router;

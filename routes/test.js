let router = require('express').Router();
let Test = require('../models/test');

router.get('/:test', async (req, res) => {
    let test = await Test.findById(req.params.test).exec();
    return res.render("test", {
        user: req.user,
        back: req.back,
        test: test,
    });
});

module.exports = router;

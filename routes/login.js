let router = require('express').Router();
let User = require('../models/user');

router.get('/', (req, res, next) => {
    if (req.user != null) res.redirect("/");
    return res.render("login", {
        title: "Login",
        user: req.user
    });
});

router.post('/', async (req, res, next) => {
    if (req.body.logUser && req.body.logPassword) {
        await User.authenticate(req.body.logUser, req.body.logPassword).then((user) => {
            req.session.userId = user._id;
            res.redirect('/');
        }).catch((error) => {
            console.log(error);
        });
    }
});


module.exports = router;

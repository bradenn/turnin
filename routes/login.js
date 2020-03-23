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
        await User.authenticate(req.body.logUser, req.body.logPassword).then((data) => {
            if(data.err){
                return res.render("login", {
                    err: data.err
                });
            }else{
                req.session.userId = data.user._id;
                return res.redirect('/');
            }
        }).catch((error) => {
            console.log(error);
        });
    }
});


module.exports = router;

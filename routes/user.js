let express = require('express');
let User = require('../models/user');
let router = express.Router();

router.post('/:user/edit', async (req, res, next) => {
    let target = await User.findById(req.params.user).exec();
    if (req.user._id.toString() === target._id.toString()) {
        if (req.body.password !== "" && req.body.passwordConf !== "") {
            if (req.body.password === req.body.passwordConf) {
                target.password = req.body.password;
            } else {
                return res.render("profile", {error: "Passwords do not match"});
            }
        }
        target.firstname = (req.body.firstname !== target.firstname) ? req.body.firstname : target.firstname;
        target.lastname = (req.body.lastname !== target.lastname) ? req.body.lastname : target.lastname;
        target.email = (req.body.email !== target.email) ? req.body.email : target.email;
        target.github = (req.body.github !== target.github) ? req.body.github : target.github;
        target.save((err, tar) => {
            res.redirect('/');
        });
    } else {
        next(new Error("You are not authorized to modify this content. This encounter has been logged; you're account will be reviewed."));
    }

});


module.exports = router;
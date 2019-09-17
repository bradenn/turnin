var router = require('express').Router();
let User = require('../models/user');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    return res.render("home");
  });
});

module.exports = router;

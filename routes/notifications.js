var router = require('express').Router();
var User = require('../models/user');


router.get('/clear', function(req, res) {
  User.findById(req.session.userId, function(err, user) {
    user.notifications = [];
    user.save(function(err) {
      res.redirect(req.get('referer'));
    });
  });
});

module.exports = router;

var router = require('express').Router();
let User = require('../models/user');
let Post = require('../models/post');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    Post.findOne({
      owner: user._id
    }, function(err, post) {
      return res.render("post", {
        title: "Post",
        user: user,
        post: post
      });
    });
  });
});

module.exports = router;

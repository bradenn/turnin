var router = require('express').Router();
let User = require('../models/user');
let Blog = require('../models/blog');

router.get('/:id', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    Blog.findById(req.params.id, function(err, blog) {
      return res.render("blog", {
        title: "Blog",
        user: user,
        blog: blog
      });
    });
  });
});

module.exports = router;

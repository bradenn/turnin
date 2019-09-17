var router = require('express').Router();
let User = require('../models/user');
let Message = require('../models/message');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    if (user != null) {
      Message.find({
          $or: [{
              to: user._id,
              from: req.query.to
            },
            {
              from: user._id,
              to: req.query.to
            },
          ]
        },
        function(err, messages) {
          //console.log(messages);
          User.findById(req.query.to, function(err, target) {
            return res.render("messages", {
              title: "Messages",
              user: user,
              messages: messages,
              query: req.query.to,
              target: target
            });
          });
        });

    } else {
      return res.redirect("/login");
    }
  });
});

router.post("/send/:id", function(req, res, next) {
  var userData = {
    to: req.params.id,
    from: req.session.userId,
    text: req.body.text,
    date: new Date()
  }
  Message.create(userData, function(error, user) {
    if (error) {
      res.redirect(req.get('referer'));
    } else {
      res.redirect(req.get('referer'));
    }
  });
});

module.exports = router;

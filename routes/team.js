var router = require('express').Router();
let User = require('../models/user');
let Team = require('../models/team');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user){
    return res.render("team", {
      title: "Teams",
      user: user
    });
  });

});

router.get('/:team', function(req, res, next) {
  User.findById(req.session.userId, function(err, user){
    Team.findById(req.params.team, function(err, team){
      return res.render("team", {
        title: "Teams",
        user: user,
        team: team
      });
    });
  });

});

module.exports = router;

var router = require('express').Router();
let User = require('../models/user');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    return res.render("profile", {
      title: "Profile",
      user: user
    });
  });

});

router.get('/edit/theme/:mode', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    user.theme = req.params.mode;
    user.save(function(err){
      res.redirect(req.get('referer'));
    });
  });

});


router.post('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    console.log(req.body);
    let postData = {
      gender: req.body.gender,
      sexuality: req.body.sexuality,
      gender_preference: req.body.gender_preference,
      interest: req.body.interest
    };
  /*  Profile.findById(user.profile._id, function(err, profile) {
        profile.gender = req.body.gender;
        profile.sexuality = req.body.sexuality;
        profile.gender_preference = req.body.gender_preference;
        profile.interest = req.body.interest;
        profile.save(function(err){
            res.redirect(req.get('referer'));
        });
    });*/
  });
});

module.exports = router;

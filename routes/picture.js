var router = require('express').Router();
var User = require('../models/user');

const upload = require('../services/aws-upload');
const singleUpload = upload.single('image');

router.post('/image-upload', function(req, res) {
  singleUpload(req, res, function(err) {
    if (err) {
      return res.status(422).send({
        errors: [{
          title: 'Image Upload Error',
          detail: err.message
        }]
      });
    }
    User.findOne({
      _id: req.session.userId
    }, function(err, user) {
      user.picture = req.file.location;
      user.save(function(err) {
        if (err) {
          console.log(err);
        }
        res.redirect(req.get('referer'));
      })

    });

  });
});

module.exports = router;

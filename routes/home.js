var router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/class');
let Assignments = require('../models/assignment');

// Handle root requests
router.get('/', function(req, res, next) {
  // Query for USER and CLASS
  User.findById(req.session.userId, function(userError, user) {
    // Define query for getting all classes
    Class.find({}, function(classError, allClasses) {
      // Check if user is not null (not logged in)
      if (user != null) {
        // Render home page with data
        
        return res.render("home", {
          user: user,
          classes: user.classes,
          allClasses: allClasses
        });
      } else {
        // Send user to login if not logged in
        return res.redirect("/login");
      }
    });
  });
});

// Add user to class
router.post('/join', function(req, res, next) {
  // Query for USER and CLASS
  User.findById(req.session.userId, function(userError, user) {
    Class.findById(req.body.classInput, function(classError, classSelection) {
      // Add student to class
      classSelection.students.push(user._id);
      // Save change
      classSelection.save(function(classSelectionOutput) {
        // Add class to user 'classes' array
        user.classes.push(classSelection._id);
        // Save change
        user.save(function(userOutput) {
          // Go back to form
          res.redirect(req.get('referer'));
        });
      })
    });
  });
});

module.exports = router;

var router = require('express').Router();
let User = require('../models/user');
let Class = require('../models/class');
let Assignment = require('../models/assignment');


// Handle /assignments requests
router.get('/', function(req, res, next) {
  // Query USER, CLASS, and ASSIGNMENTS
  User.findById(req.session.userId, function(userError, user) {
    Class.find({
      instructor: req.session.userId
    }, function(classError, classes) {
      // Check user status
      if (user != null && user.type == "instructor") {
        // Render assignments page
        return res.render("assignments", {
          user: user,
          classes: classes
        });
      } else {
        // Return to login if user isnt logged in or allowed
        return res.redirect("/login");
      }
    });
  });
});

// Handle requests for creating a new assignment
router.get('/new', function(req, res, next) {
  // Query USER primaily to check permissions
  User.findById(req.session.userId, function(userError, user) {
    // Query for all classes taught by said instructor
    Class.find({
      instructor: req.session.userId
    }, function(classError, classes) {
      // Check to see if the user is allowed to make a new assignment
      if (user != null && user.type == "instructor") {
        // Render new assignment page with relivant data
        return res.render("newassignment", {
          user: user,
          classes: classes
        });
      } else {
        // Return to login if not logged in or allowed
        return res.redirect("/login");
      }
    });
  });
});

// Handle post requests for creating a new assignment
router.post('/new', function(req, res, next) {
  // Query USER primaily to check permissions
  User.findById(req.session.userId, function(userError, user) {
    // Query for all classes taught by said instructor
    Class.findById(req.body.assignmentClass, function(classError, classes) {
      // Check to see if the user is allowed to make a new assignment
      if (user != null && user.type == "instructor") {
        let e = {
          name: req.body.assignmentName,
          checks: String,
          files: req.body.assignmentFiles.split(", "),
          duedate: req.body.assignmentDueDate,
          date: new Date()
        }
        Assignment.create(e, (error, assignment) => {
          classes.assignments.push(assignment);
          classes.save((err, classes) => {
            res.redirect(req.get('referer'));
          });

        });
      } else {
        // Return to login if not logged in or allowed
        return res.redirect("/login");
      }
    });
  });
});



module.exports = router;

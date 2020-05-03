let router = require('express').Router();
let File = require('../models/file');
let Course = require('../models/course');
let Workspace = require('../models/workspace');
let Assignment = require('../models/assignment');
let rest = require('../services/rest');
let submission = require('../services/submission');

router.get('/', async (req, res, next) => {
    let courses = await Course.find({_id: {$in: req.user.courses}}).exec();
    let workspaces = await Workspace.find({student: req.user._id}).exec();
    return res.render("workspace", {
        user: req.user,
        courses: courses,
        workspaces: workspaces
    });
});

router.get('/:workspace/compile', async (req, res, next) => {
    let workspace = await Workspace.findOne({_id: req.params.workspace}).populate('assignment', ['tests', 'name']).exec();
    const results = await submission.evaluateFromWorkspace(workspace._id);
    res.json({notes: "have fun", results});
});

router.get('/:id', async (req, res, next) => {
    let workspace = await Workspace.findOne({_id: req.params.id}).populate('files').populate('assignment').exec();
    res.render("editor", {
        workspace: workspace
    });
});

router.post('/:workspace/save', async (req, res) => {
    let workspace = await Workspace.findOne({_id: req.params.workspace}).exec();
    if (req.body.files) {
        req.body.files.forEach(file => {
            File.findOneAndUpdate({_id: file._id}, {content: file.content}).exec();
        });
        res.send({success: true, err: null})
    }
});

router.get('/create/:assignment', async (req, res) => {
    let assignment = await Assignment.findOne({_id: req.params.assignment}).exec();
    let files = [];
    for (const file of assignment.files) {
        files.push(await File.create({name: file, student: req.user._id, date: new Date()}));
    }
    let workspace = await Workspace.create({assignment: assignment._id, student: req.user._id, files: files});
    res.redirect(`/workspace/${workspace._id}`);
});


module.exports = router;

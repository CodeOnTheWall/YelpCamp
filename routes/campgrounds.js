const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary')
// dont need to do /index.js since node auto looks for an index.js file
const upload = multer({ storage });

const Campground = require('../models/campground');

router.route('/')
    .get(catchAsync(campgrounds.index))
    // catchAsync will see if an error needs to be caught before the function is ran, and send it to next error middleware
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

// in order to parse multipart/form-data - upload photos , we need a middleware - or the req.body will return empty as its not parsed
// middleware Multer will add a body object and a file/files object to the req object, this file object will contain the files uploaded via the form

router.get('/new', isLoggedIn, campgrounds.renderNewForm)
// this has to be above /campgrounds/:id, or it will keep trying to find an id of something
// renders our new.ejs file - nothing needs to be passed through as we arent rendering any of the Campground schema information

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //    check to see if youre logged in first, then check to see if youre the author, then we will upload an array of images 
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;









































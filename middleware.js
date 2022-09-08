const { CampgroundSchema, ReviewSchema } = require('./backEndSchemas.js');
// this is our Joi schema - back end validation - validating data from req.body
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

// Middleware: isLoggedIn (we named it this to use in our routes files)
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next()
}

// if user isnt logged in, save the originalUrl (what the person tried to click last) to the returnTo, where we will returnTo once we are logged in

// req.user - .user a method provided by passport
// this is req.user once we are signed in:
// REQ.USER... {
//     _id: new ObjectId("630d3f6ad22b3019ef468aae"),
//     email: 'tim@tim.com',
//     username: 'tim',
//     __v: 0
//   }

// this is stored in the current session (after we log in)
// req.isAuthenticated() method tells us if someone is logged in, whereas req.user tells us who is loggin in

// Middleware: validateCampground - server side validation
module.exports.validateCampground = (req, res, next) => {
    const { error } = CampgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(element => element.message).join(',')
        throw new ExpressError(msg, 400)
        // this msg will get thrown and caught in the bottom error middleware handler
    } else {
        next()
    }
}

// .validate comes from Joi - and it checks if the object properties match the Joi schema created

// this is our server side validation middleware
// we are validating to see if req.body.campground is there, as well as title, price etc
// if theres an error (missing things from CampgroundSchema) we will map over the errors.details and join them to make a single string message, then take that string message and pass it through to new ExpressError

// Middleware: isAuthor - so someone can edit or change things of other person
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
        // returning so that if this gets ran, the below code for sure wont run
    }
    next();
}

// if the author doesnt equal the current user id, then we flash error

// Middleware: isReviewAuthor
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
        // returning so that if this gets ran, the below code for sure wont run
    }
    next();
}

// im going to redirect you to campground id, but use review id to find that review and see if you own it

module.exports.validateReview = (req, res, next) => {
    const { error } = ReviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(element => element.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}










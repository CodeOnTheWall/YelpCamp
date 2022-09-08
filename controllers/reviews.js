const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${campground._id}`);
}

// push the new Review onto that campground, save the review and save the campground

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // we are going to pull (this is an operator) from the reviews array where we have reviewID
    // remove from array mongo, pull is recommended solution
    // it will take the reviewId, and pull it out of reviews - which is an array of id's
    await Review.findByIdAndDelete(reviewId);
    // once we find that reviewId then we delete it
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}
















const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})
// this is referring to the User Model

module.exports = mongoose.model('Review', ReviewSchema);
// wre are going to connect a review to a campground which is a one-to-many relationship

































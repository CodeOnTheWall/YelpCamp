const mongoose = require('mongoose');
// we use mongoose to create schemas, as mongodb by itself doesnt use schemas
const Review = require('./review');
const Schema = mongoose.Schema;

// reminder for structure that in our model dir, this is where we create our schema and set up our mongoose stuff

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// https://res.cloudinary.com/dd5rthmf7/image/upload/v1662161090/YelpCamp/gjlm7fb4lmoji9pqldbx.jpg
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});
// this refers to the particular image
// replacing wehere we have /upload in the url to /upload/w_200, w_200 is a width property
// the reason we use virtual is because we dont need to store this on our Model or in the database because its just derived from the information we are already storing

const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
        // from the User Model, on this author object we wil also have username and password that is auto created from - UserSchema.plugin(passportLocalMongoose);
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
            // it is an object Id from the Review Model
        }
    ]

}, opts);
// now when my campgrounds are stringified they include properties because of the virtual property
// these reviews will be a one to many relationship, and we should see the reviews under a campsite

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        // if we find doc
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
// what this does is delete all the reviews of a campground with the deletion of a campground

module.exports = mongoose.model('Campground', CampgroundSchema)
// we are allowing this data to be exported and used in other files
// Campground is the collection name, mongoose auto pluralizes it and lowercase to campgrounds
// so in mongosh our collection is called campgrounds






















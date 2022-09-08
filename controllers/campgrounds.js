const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

// finding all {} campgrounds
// renders our index.ejs - and we pass through {campgrounds} so that our index.ejs file can use the Campground schema (i.e. campground.image, campground.title etc)
// '/' is /campgrounds, but we used express.Router to eliminate the campgrounds in /campgrounds to shorten our routes

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        // first we are getting the coordinates from some string - geo api
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    // we make our campground with eeverything in the req.body.campground
    campground.geometry = geoData.body.features[0].geometry;
    // then we add on geometry which is coming from our geocoding API
    // features itself is an array, so in order to target geometry.coordinates, we need to put[0]
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // map over the array thats been added to req.files - thanks to multer - take path and file name, and make new object for each one, and put that into an array, then add that onto Campground
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
    // this will take us to the newly created campground in show.ejs, after we save it
    // and this new campground will be posted to /campgrounds
}

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
        // populate all the reviews from the reviews array on the one campground we are finding, then populate the author on each of those reviews
    }).populate('author');
    // then seperately populate the 1 author of this individual campground
    // .populate comes from mongoose - populate lets us reference documents in other collections - so in our show.ejs i can use review.rating and review.body
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}

// we need to look up the exact Campground using :id - then we pass through {campground} so that we can use i.e. campground.title and campground[title] in our edit.ejs

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // ... is the spread operator - passing through a copy of the object.array instead of the original
    campground.images.push(...imgs);
    // we are pushing an array onto an existing array and this we have to fix
    // we fix by passing in the information of the array, and not the array itself (spread operator)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
            // looping over all the deleteImages, and deleting them from cloudinary
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    //    pull operator to pull elements out of an array, in this case we are pulling out the images array
    // we want to pull out of images array where filename is in req.body.deleteImages
    await campground.save()
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
    // this .put is for editing
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}





















const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')
// two .. because it is 2 places back in our directory

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];
// to pick a random element from an array
// we are passing in the array, and then we return a random element from that array

const seedDB = async () => {
    await Campground.deleteMany({});
    // we are going to await our Campground Model and delete everything there
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //    YOUR USER ID
            author: '630e3fe7d420812ca928cdcd',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // the sample function returns a random number from the array, so it will put i.e. descriptor of 1 and places of 2
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deserunt, voluptates deleniti? Possimus eaque cum reprehenderit aspernatur. Sunt fugiat sed beatae. Pariatur molestiae facilis ducimus, fugit iusto incidunt officia ipsa. Sunt!',
            price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude,
                cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dd5rthmf7/image/upload/v1662495823/YelpCamp/tfnprwpkmcp9tlnwigdc.jpg',
                    filename: 'YelpCamp/tfnprwpkmcp9tlnwigdc',
                },
                {
                    url: 'https://res.cloudinary.com/dd5rthmf7/image/upload/v1662495823/YelpCamp/wueudi2ocdqznyhnfejh.jpg',
                    filename: 'YelpCamp/wueudi2ocdqznyhnfejh',
                }
            ]
        })
        await camp.save();
        // if we check mongosh now after running nodemon seeds/index, we now have img and description as well
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
// after running index.js, the server will close






















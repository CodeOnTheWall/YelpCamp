if (process.env.NODE_ENV !== "production") {
  // if we are not in production mode then load env variables here
  // other wise in prod, env variables will be set on server
  require("dotenv").config();
}

// npm init-y
// npm i express mongoose ejs nodemon method-override morgan joi cookie-parser express-session connect-flash (bcrypt) passport passport-local passport-local-mongoose multer dotenv
// cloudinary multer-storage-cloudinary @mapbox/mapbox-sdk express-mongo-sanitize sanitize-html helmet connect-mongo

// req.body is generally used in post/put req - thr request that comes back
// req.query is generally used for searching/sorting/filtering
// i.e. only want data from page 10, animals?page=10 - this is our query string
// req.params is attatched to the url via :, i.d. farms/id:63838hquidhquiwh will show that id only - (parameters)

const express = require("express");
// makes this an express app

const path = require("path");
// this is a node.js global function that allows us to extract contents from module.exports object inside some file
// provides a way of working with directories and file paths

const mongoose = require("mongoose");
// this is to create our Schema, it works on top of mongodb

const ejsMate = require("ejs-mate");
// we use <% layout('layouts/boilerplate') % so that the boilerplate can be used in our ejs files>
const session = require("express-session");
// this is to see our cookie
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const MongoDBStore = require("connect-mongo");
// 'mongodb://localhost:27017/yelp-camp'
// for development
// process.env.DB_URL
// for production
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
// this line puts us in production, so when we want to go to developement, comment this line out
mongoose.connect(dbUrl);
// data base name is yelp-camp aka 'use yelp-camp' in mongosh
// but we use db.campgrounds.find as our collection

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});
// when we successfully connect to mongodb, the once callback will run

const app = express();
// app, req, res, are express methods on the express website documentation, express() this created an express application

app.engine("ejs", ejsMate);
// similar to below, choosing our view engine, we are choosing another engine to use
app.set("view engine", "ejs");
// this will allow us to view and use .ejs files
// check express docs for refresher - this sets the default engine extension to .ejs
app.set("views", path.join(__dirname, "views"));
// __dirname is the directory we are currently in, then we add /views, so that our files in there can automatically be used

app.use(express.urlencoded({ extended: true }));
// this is the default body parser, the Multer middleware will also parse the body if there are files on the req.body
// allows us to parse incoming req object as strings or arrays so we can see them in client side via .post/.put - built in Express Middleware - extended: true uses the qs library instead of the default queryString Library
// every form we have done so far is a x-www=form-urlencoded form, which we are parsing the body with this .urlencoded
app.use(methodOverride("_method"));
// we need to pass in a string that we want to use for our query string
// we add this query string to our form to override it, since normally forms cant do anything besides get and post requests
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());
// this stops specific things being added in the query string, for security purposes

const secret = process.env.SECRET || "supersecret";

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
  // seconds
});

store.on("error", function (error) {
  console.log("SESSION STORE ERROR", error);
});

const sessionConfig = {
  store,
  // now our session has the object being passed in called store, from our MongoStore
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    // milaseconds
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
// now we can use flash which depends on session
// this has to be above passport.session
app.use(flash());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    // ...
  })
);

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];

const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dd5rthmf7/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// passport, we would like you to use the LocalStrategy, and the authentification method will be located on our User Model
passport.serializeUser(User.serializeUser());
// this is telling passport how to serialize a user - how do we store a User in the session
passport.deserializeUser(User.deserializeUser());
// the opposite, how do we get a User out of the session - both above methods coming from Passport package

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
// now our .post in campgrounds will have that flash message
// because of Express, anything we attatch to res.locals will automatically be passed to all EJS files, as well since app.use gets ran on every route
// req.user is what Passport gives us when a user is logged in, and we are naming this currentUser

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
// everything starts with /camprounds (so we can remove /campgrounds in our routes folder), and use the campgrounds route
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not Found", 404));
});
// for every single request, * is for every path, and for every single path we are going to call this call  back
// the below err, will be the above ExpressError, since in the above, we are passing it into next

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
  // we are setting statusCode in the response, and sending the message
  // if i do i.e. a invalid id campgrounds/qwjdnqnwdff
  // i will get this : Cast to ObjectId failed for value "62f93570296d2e7f6ad99d4aqwdqwa" (type string) at path "_id" for model "Campground"
  // this .render('error') is from our error.ejs under views, and we are giving it access to use err
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
// starting server up nodemon app.js

// The export statement is used in Javascript modules to export functions, objects, or primitive values from one module so that they can be used in other programs (using the ‘import’ statement).
// Module exports are the instructions that tell Node.js which bits of code (functions, objects, strings, etc.) to export from a given file so that other files are allowed to access the exported code.
// i.e. we can make a const or a function in one file, and then require that file in a different file to use

// express middle ware parses alot of information to make it accessible for us
// when a request comes in, the middle ware can send back a response or, it can be one chain in a link of middleware and call other middlewars
// an express app is essentially a series of middleware functions

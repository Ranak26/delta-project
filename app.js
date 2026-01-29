if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Listing = require('./models/listing'); // ✅ Adjust the path if needed

const express = require("express");
const app = express();
const mongoose = require("mongoose");
let port = process.env.PORT || 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const Mongostore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbURL= process.env.ATLASDB_URL
//console.log("Connecting to MongoDB using:", dbURL);

async function main() {
  await mongoose.connect(dbURL);
}

main()
  .then(() => {
    console.log("Connected to WANDERLUST database");
  })
  .catch((err) => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "public")));

const store = Mongostore.create({
  mongoUrl: dbURL,
  crypto: {
      secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // time in seconds
});

store.on("error", ()=>{
  console.log("ERROR in session store",err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    let allListings;
    if (category) {
      allListings = await Listing.find({ category });
    } else {
      allListings = await Listing.find({});
    }

    res.render("listings/index", { allListings });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


app.get("/search", async (req, res) => {
  const { q } = req.query; // search term

  // Case-insensitive search by title, location, or country
  const allListings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } }
    ]
  });

  res.render("listings/index", { 
    allListings, 
    currentCategory: 'All', // default
    searchQuery: q // to keep the input value
  });
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "student",
//   });
//   let registerdUser= await User.register(fakeUser,"password");
//   res.send(registerdUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong!!!" } = err;
  //res.status(statusCode).send(message);
  res.render("error.ejs", { message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

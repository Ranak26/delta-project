const Listing = require("../models/listing");
const { listingSchema } = require("../schema.js");

module.exports.index = async (req, res) => {
  const { category } = req.query;
  let allListings;

  if (category === "cheaper") {
    allListings = await Listing.find({ price: { $lt: 1000 } });
  } else if (category === "favourite") {
    if (!req.user) {
      req.flash("error", "Please login to see your favourites");
      return res.redirect("/login");
    }
    // Only show listings favourited by the logged-in user
    allListings = await Listing.find({ favourites: req.user._id });
  } else if (category) {
    allListings = await Listing.find({ category: category });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "listing doesnot exist !!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created !!");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "listing doesnot exist !!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "Edit Permission Denied!!");
    return res.redirect(`/listings/${id}`);
  }
   await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {
      url,
      filename,
    };
    await listing.save();
  }

  req.flash("success", " Listing Updated !!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", " Listing Deleted !!");

  res.redirect("/listings");
};

module.exports.toggleFavourite = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash('error', 'Listing not found!');
    return res.redirect('/listings');
  }

  const userId = req.user._id;
  // Ensure favourites array exists
  listing.favourites = listing.favourites || [];

  if (listing.favourites.includes(userId)) {
    // Remove from favourites
    listing.favourites.pull(userId);
    req.flash('success', 'Removed from favourites!');
  } else {
    // Add to favourites
    listing.favourites.push(userId);
    req.flash('success', 'Added to favourites!');
  }

  await listing.save();
  res.redirect('/listings'); // Redirect back to listings
};

const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// =====================
// Listing Routes
// =====================

// INDEX & CREATE
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"), // Handles file upload
    validateListing,
    wrapAsync(listingController.createListing)
  );

// NEW Listing Form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// SHOW, UPDATE, DELETE
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"), 
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// EDIT Form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

// =====================
// Favourite Route
// =====================
router.post(
  "/:id/favourite",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const userId = req.user._id;
    listing.favourites = listing.favourites || [];

    if (listing.favourites.includes(userId)) {
      // Remove from favourites
      listing.favourites.pull(userId);
      req.flash("success", "Removed from favourites!");
    } else {
      // Add to favourites
      listing.favourites.push(userId);
      req.flash("success", "Added to favourites!");
    }

    await listing.save();
    res.redirect("/listings"); // go back to previous page
  })
);

module.exports = router;

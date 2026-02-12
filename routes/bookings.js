const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const { isLoggedIn } = require("../middleware");

// SHOW ALL BOOKINGS OF CURRENT USER
router.get("/my", isLoggedIn, async (req, res) => {
  console.log("USER:", req.user);
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing");
  console.log("BOOKINGS:", bookings);
  res.render("bookings/index", { bookings });
});

router.delete("/:id", isLoggedIn, async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);

  req.flash("success", "Booking cancelled successfully");
  res.redirect("/bookings/my");
});



module.exports = router;

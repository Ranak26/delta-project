const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  image: {
    url: String,
    filename: String,
  },

  country: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
    enum: [
      "rooms",
      "pools",
      "castles",
      "trending",
      "cheaper",
      "city",
      "camping",
      "beach",
      "favourite"
    ],
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  favourites: [
  {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

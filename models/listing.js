const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"], // Email validation
  },
  contactPhone: {
    type: String,
    required: true,
    match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"], // Phone number validation (E.164 format)
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String, // This must be 'Point'
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

// Middleware to delete all reviews related to the listing upon deletion of a listing
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

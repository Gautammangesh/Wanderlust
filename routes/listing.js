const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Route to list all listings
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// Search Route
router.get(
  "/search",
  wrapAsync(async (req, res) => {
    const { query } = req.query;

    console.log("Search Query:", query);

    if (!query) {
      return res.redirect("/listings"); // Redirect if no query is present
    }

    const listings = await Listing.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } },
      ],
    });

    res.render("listings/searchResults", { listings, query });
  })
);

// New Listing Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show, Update, and Delete Routes
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(async (req, res) => {
      await listingController.updateListing(req, res);
      req.flash("success", "Listing updated successfully!"); // Flash message for update
      res.redirect(`/listings/${req.params.id}`);
    })
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {
      await listingController.destroyListing(req, res);
      req.flash("success", "Listing deleted successfully!"); // Flash message for delete
      res.redirect("/listings");
    })
  );

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// Booking Route
router.post(
  "/:id/book",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    // Implement your booking logic here
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Cannot find that listing to book!");
      return res.redirect("/listings");
    }

    // Assuming you have a Booking model or logic to save bookings
    // Example booking logic (adjust according to your implementation)
    // const booking = new Booking({ ...req.body, listingId: listing._id });
    // await booking.save();

    req.flash("success", `Successfully booked listing "${listing.title}"!`);
    res.redirect(`/listings/${listing._id}`);
  })
);

module.exports = router;

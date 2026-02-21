const Listing = require('./models/listing');
const Review = require('./models/review');
const { listingSchema, reviewsSchema } = require('./schema.js');
const ExpressError = require('./util/ExpressError.js');

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

module.exports.validateReviews = (req, res, next) => {
  let { error } = reviewsSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash('error', 'Please login to continue');
    return res.redirect('/login');
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  // If listing not found, handle gracefully
  if (!listing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listings');
  }

  // Check if current user matches owner
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash('error', "You don't have permission to edit this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash('error', 'You did not create this review');
    return res.redirect(`/listings/${id}`);
  }
  next();
};

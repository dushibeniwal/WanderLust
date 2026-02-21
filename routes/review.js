const express = require('express');
const router = express.Router({ mergeParams: true });

const Listing = require('../models/listing.js');
const wrapAsync = require('../util/wrapAsync.js');
const Review = require('../models/review.js');
const { validateReviews, isLoggedIn, isOwner, isReviewAuthor } = require('../middleware.js');
const reviewController = require('../controllers/reviews.js');

//Post review route
router.post('/', isLoggedIn, validateReviews, wrapAsync(reviewController.createReview));

//reviews delete route
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;

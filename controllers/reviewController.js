const reviewModel = require("../models/review-model");
const utilities = require("../utilities");

async function addReview(req, res) {
  const { inv_id, review_text } = req.body;
  const account_id = res.locals.accountData.account_id;
  try {
    await reviewModel.addReview(inv_id, account_id, review_text);
    req.flash("notice", "Review added!");
  } catch (error) {
    req.flash("notice", "Error adding review.");
  }
  res.redirect(`/inv/detail/${inv_id}`);
}

module.exports = { addReview };
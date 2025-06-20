const pool = require("../database");

// Add a review
async function addReview(inv_id, account_id, review_text) {
  const sql = `
    INSERT INTO reviews (inv_id, account_id, review_text)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(sql, [inv_id, account_id, review_text]);
  return result.rows[0];
}

// Get reviews for a vehicle
async function getReviewsByInvId(inv_id) {
  const sql = `
    SELECT r.review_text, r.review_date, a.account_firstname, a.account_lastname
    FROM reviews r
    JOIN account a ON r.account_id = a.account_id
    WHERE r.inv_id = $1
    ORDER BY r.review_date DESC;
  `;
  const result = await pool.query(sql, [inv_id]);
  return result.rows;
}

module.exports = { addReview, getReviewsByInvId };
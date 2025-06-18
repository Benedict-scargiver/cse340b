const { body, validationResult } = require("express-validator")

const classificationRules = () => [
  body("classification_name")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Classification name is required and must be less than 30 characters.")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("No spaces or special characters allowed.")
]

const checkClassificationData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.errors = errors.array()
  }
  next()
}

const inventoryRules = () => [
  body("classification_id").notEmpty().withMessage("Classification is required."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_year").isInt({ min: 1900, max: 2100 }).withMessage("Year must be valid."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive integer."),
  body("inv_color").trim().notEmpty().withMessage("Color is required.")
]

const checkInventoryData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.errors = errors.array()
  }
  next()
}

//reflect that errors will be directed back to the edit view

const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Extract variables from req.body, including inv_id
    const { inv_id, classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body

    // Render the "edit" view for inventory items
    return res.render("inventory/edit", {
      title: "Edit " + inv_make + " " + inv_model, // Matches inventory controller edit view title
      errors: errors.array(),
      inv_id, // Add inv_id to the data object
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    })
  }
  next()
}

const newInventoryRules = () => [
  body("classification_id").notEmpty().withMessage("Classification is required."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_year").isInt({ min: 1900, max: 2100 }).withMessage("Year must be valid."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive integer."),
  body("inv_color").trim().notEmpty().withMessage("Color is required.")
]


module.exports = { 
  classificationRules, 
  checkClassificationData, 
  inventoryRules, 
  checkInventoryData, 
  newInventoryRules, 
  checkUpdateData  }
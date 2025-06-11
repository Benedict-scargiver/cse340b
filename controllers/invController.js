const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


/* ***************************
 *  Build management View
 * ************************** */
async function buildManagement(req, res) {
  const nav = await utilities.getNav()
  // Generate classSelect as needed for your dropdown
  const classSelect = "" // Replace with your actual logic
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classSelect,
    errors: null
  })
}

async function buildByClassificationId(req, res) {
  res.send("buildByClassificationId placeholder: This route is working!")

}

/* ***************************
 *  Inventory Controller
 * ************************** */
async function showAddClassification(req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    messages: req.flash("info"),
    errors: [],
    classification_name: ""
  })
}

async function addClassification(req, res) {
  const { classification_name } = req.body
  const nav = await utilities.getNav()
  const errors = req.errors || []
  if (errors.length > 0) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: [],
      errors,
      classification_name
    })
  }
  try {
    const result = await inventoryModel.insertClassification(classification_name)
    if (result) {
      req.flash("info", "Classification added successfully!")
      // Rebuild nav to include new classification
      const nav = await utilities.getNav()
      // Optionally, fetch updated data for management view
      return res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash("info"),
        errors: []
      })
    }
    throw new Error("Insert failed")
  } catch (err) {
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: [],
      errors: [{ msg: "Failed to add classification. Please try again." }],
      classification_name
    })
  }
}

async function showAddInventory(req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    messages: req.flash("info"),
    errors: [],
    ...req.body // sticky fields
  })
}

async function addInventory(req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)
  const errors = req.errors || []
  if (errors.length > 0) {
    return res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      messages: [],
      errors,
      ...req.body
    })
  }
  try {
    const result = await inventoryModel.insertInventory(req.body)
    if (result) {
      req.flash("info", "Vehicle added successfully!")
      return res.redirect("/inv") // management view
    }
    throw new Error("Insert failed")
  } catch (err) {
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      messages: [],
      errors: [{ msg: "Failed to add vehicle. Please try again." }],
      ...req.body
    })
  }
}

module.exports = {
  buildManagement,
  buildByClassificationId,
  showAddClassification,
  showAddInventory,
  addClassification,
  addInventory, 
  invCont
}
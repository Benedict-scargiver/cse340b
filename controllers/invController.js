const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// Build inventory by classification view
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

// Build detail view
invCont.buildDetailView = async function (req, res, next) {
  const invId = req.params.invId;
  const nav = await utilities.getNav();
  try {
    const vehicle = await invModel.getInventoryById(invId);
    if (!vehicle) {
      return res.status(404).render("inventory/detail", {
        title: "Vehicle Not Found",
        nav,
        vehicleHtml: "<p>Vehicle not found.</p>"
      });
    }
    const vehicleHtml = utilities.buildDetailHtml(vehicle);
    res.render("inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml
    });
  } catch (err) {
    next(err);
  }
};

// Build management view
invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()
  const classSelect = "" 
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classSelect,
    errors: null
  })
}

// Show add-classification form
invCont.showAddClassification = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    messages: req.flash("info"),
    errors: [],
    classification_name: ""
  })
}

// Add classification
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body || {};
  const nav = await utilities.getNav();
  const errors = req.errors || [];
  if (errors.length > 0) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: [],
      errors,
      classification_name
    });
  }
  try {
    console.log("classification_name:", classification_name); // Debug
    const result = await invModel.insertClassification(classification_name);
    console.log("insertClassification result:", result); // Debug
    if (result) {
      req.flash("info", "Classification added successfully!");
      return res.redirect("/inv");
    }
    throw new Error("Insert failed");
  } catch (err) {
    console.error("Insert classification error:", err); // Debug
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: [],
      errors: [{ msg: "Failed to add classification. Please try again." }],
      classification_name
    });
  }
}

// Show add-inventory form
invCont.showAddInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body?.classification_id || null)
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    messages: req.flash("info"),
    errors: [],
    ...req.body // sticky fields
  })
}

// Add inventory
invCont.addInventory = async function (req, res) {
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
    const result = await invModel.insertInventory(req.body)
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

module.exports = invCont;
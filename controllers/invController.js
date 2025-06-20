const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const reviewModel = require("../models/review-model");

const invCont = {}


invCont.brokenRoute = async function (req, res, next) {
  // Intentionally throw an error
  throw new Error("Intentional 500 error for demonstration purposes.");
};


// Build inventory by classification view
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  let nav = await utilities.getNav()
  let className = "No Vehicles Found"
  let grid = ""
  if (data && data.length > 0) {
    className = data[0].classification_name
    grid = await utilities.buildClassificationGrid(data)
  } else {
    grid = "<p class='notice'>No vehicles found for this classification.</p>"
  }
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
        vehicleHtml: "<p>Vehicle not found.</p>",
        reviews: [],
        invId
      });
    }
    const vehicleHtml = utilities.buildDetailHtml(vehicle);

    const reviews = await reviewModel.getReviewsByInvId(invId);

    res.render("inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml,
      reviews, 
      invId    
    });
  } catch (err) {
    next(err);
  }
};

// Build management view
invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()
  const classSelect = "" 
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classSelect,
    errors: null,
    classificationSelect
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
/*invCont.addInventory = async function (req, res) {
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
}*/

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
    console.log("Add Inventory req.body:", req.body)
    const result = await invModel.insertInventory(req.body)
    console.log("Insert result:", result)
    if (result) {
      req.flash("info", "Vehicle added successfully!")
      return res.redirect("/inv") // management view
    }
    throw new Error("Insert failed")
  } catch (err) {
    console.error("Insert error:", err)
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


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */

invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}



/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.invId); // Use 'invId' to match your route
    let nav = await utilities.getNav();

    // Get the inventory item data from the model
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      req.flash("notice", "Inventory item not found.");
      return res.redirect("/inv");
    }
    // Build the classification select list
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    // Create a name variable for Make and Model
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      messages: req.flash("notice"),
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    next(error);
  }
};

invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )
  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }
}

/* ***************************
 *  Deliver deleteconfirm view with vehicle data
 * ************************** */
invCont.buildVehicleDeleteConfirm = async function (req, res, next) {
  let nav = await utilities.getNav();
  const inv_id = parseInt(req.params.inv_id);
  let invData = await invModel.getInventoryByInvId(inv_id); // <-- removed [0]
  if (!invData) {
    req.flash("notice", "Inventory item not found.");
    return res.redirect("/inv");
  }
  let name = `${invData.inv_make} ${invData.inv_model}`;
  res.render("inventory/delete-confirm", {
    title: `Delete ${name}`,
    messages: req.flash("notice"),
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_price: invData.inv_price,
    inv_id: invData.inv_id,
    nav,
    errors: null,
  });
};

/* ****************************************
 *  Confirm and process vehicle deletion
 * *************************************** */
invCont.deleteVehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classSelect = await utilities.buildClassificationList();
  const { inv_make, inv_model, inv_year, inv_id } = req.body;
  const name = `${inv_make} ${inv_model}`;
  const deleteResult = await invModel.deleteVehicle(inv_id);

  if (deleteResult) {
    // const name = `${inv_make} ${inv_model}`
    req.flash("success", `${name} was successfully deleted`);
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classSelect,
    });
  } else {
    // const name = `${inv_make} ${inv_model}`
    req.flash("error", "Sorry, the deletion failed.");
    res.status(501).render("inventory/delete-confirm", {
      title: `Delete ${name}`,
      nav,
      errors: null,
      inv_make,
      inv_model,
      inv_year,
      inv_id,
    });
  }
};




module.exports =  invCont;
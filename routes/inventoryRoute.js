// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities");
const invController = require("../controllers/invController")
const invValidation = require("../utilities/inventory-validation")
const { handleErrors } = require("../utilities");

// Intentional error route
router.get("/broken", utilities.handleErrors(invController.brokenRoute));

// Management view
router.get("/", handleErrors(invController.buildManagement));

// Inventory by classification view
router.get("/type/:classificationId", handleErrors(invController.buildByClassificationId));

// Vehicle detail view
router.get("/detail/:invId", handleErrors(invController.buildDetailView));

// Show add-classification form (admin only)
router.get("/add-classification", utilities.inventoryAdminOnly, handleErrors(invController.showAddClassification));

// Add classification (admin only)
router.post(
  "/add-classification",
  utilities.inventoryAdminOnly,
  invValidation.classificationRules(),
  invValidation.checkClassificationData,
  handleErrors(invController.addClassification)
);

// Show add-inventory form (admin only)
router.get("/add-inventory", utilities.inventoryAdminOnly, handleErrors(invController.showAddInventory));

// Add inventory (admin only)
router.post(
  "/add-inventory",
  utilities.inventoryAdminOnly,
  invValidation.newInventoryRules(),
  invValidation.checkInventoryData,
  handleErrors(invController.addInventory)
);

// Edit inventory view (admin only)
router.get("/edit/:invId", utilities.inventoryAdminOnly, handleErrors(invController.editInventoryView));

// Update inventory (admin only)
router.post(
  "/update",
  utilities.inventoryAdminOnly,
  invValidation.newInventoryRules(),
  invValidation.checkUpdateData,
  handleErrors(invController.updateInventory)
);

// Get inventory JSON for classification (AJAX)
router.get(
  "/getInventory/:classification_id",
  handleErrors(invController.getInventoryJSON)
);

// Delete vehicle confirmation (admin only)
router.get("/delete/:inv_id", utilities.inventoryAdminOnly, handleErrors(invController.buildVehicleDeleteConfirm));

// Delete vehicle (admin only)
router.post("/delete", utilities.inventoryAdminOnly, handleErrors(invController.deleteVehicle));

module.exports = router;
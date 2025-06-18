// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities");
const invController = require("../controllers/invController")
const invValidation = require("../utilities/inventory-validation")
const { handleErrors } = require("../utilities");


// Intentional error route
router.get("/broken", utilities.handleErrors(invController.brokenRoute));

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build the management view
router.get("/", invController.buildManagement);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for vehicle detail view
router.get("/detail/:invId", invController.buildDetailView);

// Show add-classification form
router.get("/add-classification", invController.showAddClassification);


router.get("/add-inventory", invController.showAddInventory)

// Route for editing a vehicle by inventory ID
router.get("/edit/:invId", invController.editInventoryView);

// Handle form submission
router.post(
  "/add-classification",
  invValidation.classificationRules(),
  invValidation.checkClassificationData,
  invController.addClassification
)

router.post(
  "/add-inventory",
  invValidation.inventoryRules(),
  invValidation.checkInventoryData,
  invController.addInventory,
  invController.showAddInventory
)

router.get(
  "/getInventory/:classification_id",
  handleErrors(invController.getInventoryJSON)
)


router.post(
  "/update",
  invValidation.newInventoryRules(),
  invValidation.checkUpdateData,
  invController.updateInventory
)

router.get("/delete/:inv_id", utilities.checkLogin, utilities.handleErrors(invController.buildVehicleDeleteConfirm));
router.post("/delete", utilities.checkLogin, utilities.handleErrors(invController.deleteVehicle));

module.exports = router;
// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidation = require("../utilities/inventory-validation")
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build the management view
router.get("/", invController.buildManagement)

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Show add-classification form
router.get("/add-classification", invController.showAddClassification)

// Show add-inventory form
router.get("/add-inventory", invController.showAddInventory)

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
  invController.addInventory
)

module.exports = router;
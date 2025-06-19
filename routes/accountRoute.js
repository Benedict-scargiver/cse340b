const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')




router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount));




router.get("/login", accountController.buildLogin)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// GET route for registration
router.get("/register", accountController.buildRegister);

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Error handling middleware
/*router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});*/

exports.accountManagement = (req, res) => {
  res.send("You're logged in");
};


// GET: Deliver the account update view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate))

// POST: Process account info update (first name, last name, email)
router.post(
  "/accountupdate",
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.accountUpdate)
)

// POST: Process password update
router.post(
  "/changepassword",
  utilities.checkLogin,
  regValidate.passwordUpdateRules(),
  regValidate.checkPasswordUpdateData,
  utilities.handleErrors(accountController.passwordUpdate)
)


router.get("/logout", utilities.handleErrors(accountController.logoutAccount));



module.exports = router
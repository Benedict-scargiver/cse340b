const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcrypt");


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null 
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(account_password, 10);

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword // Use the hashed password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/account", {
    title: "Account",
    nav,
    errors: null,
  });
}
/* ****************************************
 *  Process login request
 * ************************************ */
/*async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}*/

async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  console.log("Login attempt for:", account_email);

  const accountData = await accountModel.getAccountByEmail(account_email)
  console.log("Account data from DB:", accountData);

  if (!accountData) {
    console.log("No account found for email:", account_email);
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    console.log("Comparing passwords...");
    const match = await bcrypt.compare(account_password, accountData.account_password);
    console.log("Password match result:", match);
    
    if (match) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      console.log("JWT generated:", accessToken.slice(-10)); // Show last 10 chars for reference
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      // Redirect based on account type
      if (
        accountData.account_type === "Employee" ||
        accountData.account_type === "Admin"
      ) {
        return res.redirect("/account/");
      }
    }

    else {
      console.log("Password did not match for:", account_email);
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.log("Error during login:", error);
    throw new Error('Access Forbidden')
  }
}
// Build the Classification List


async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  let classSelect = await utilities.buildClassificationList(); // returns <option>...</option>
  res.render("account/management", {
    title: "Account Management",
    nav,
    classSelect, // Pass to the view
    errors: null,
    messages: () => req.flash("notice")
  });
}


/**
 * Deliver the account update view
 */

async function buildAccountUpdate(req, res) {
  let nav = await utilities.getNav();
  // Use account data from JWT middleware (res.locals.accountData)
  const accountData = res.locals.accountData;
  res.render("account/editaccount", {
    title: "Edit Account",
    nav,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
    messages: req.flash("notice"),
    errors: null
  });
}

/**
 * Process account update
 */
async function accountUpdate(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  // Attempt to update the account in the database
  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  if (updateResult) {
    // Success: get the updated account data
    const updatedAccount = await accountModel.getAccountById(account_id);
    req.flash("notice", "Account information updated successfully.");
    // Optionally, update JWT cookie here if you want the new info in the token
    res.render("account/management", {
      title: "Account Management",
      nav,
      classSelect: await utilities.buildClassificationList(),
      messages: () => req.flash("notice"),
      errors: null,
      account_firstname: updatedAccount.account_firstname,
      account_lastname: updatedAccount.account_lastname,
      account_email: updatedAccount.account_email,
      account_id: updatedAccount.account_id,
      accountData: updatedAccount
    });
  } else {
    // Failure: return to update view with error and entered data
    req.flash("notice", "Sorry, the update failed. Please try again.");
    res.render("account/editaccount", {
      title: "Edit Account",
      nav,
      errors: null,
      messages: req.flash("notice"),
      account_firstname,
      account_lastname,
      account_email,
      account_id
    });
  }
}

async function passwordUpdate(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;

  // Validate password (should already be validated by middleware, but double-check)
  if (!account_password || account_password.length < 12) {
    req.flash("notice", "Password does not meet requirements.");
    return res.render("account/editaccount", {
      title: "Edit Account",
      nav,
      errors: null,
      messages: req.flash("notice"),
      account_id
    });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10);

    // Update password in the database
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
      // Get updated account data
      const updatedAccount = await accountModel.getAccountById(account_id);
      return res.render("account/management", {
        title: "Account Management",
        nav,
        classSelect: await utilities.buildClassificationList(),
        messages: () => req.flash("notice"),
        errors: null,
        account_firstname: updatedAccount.account_firstname,
        account_lastname: updatedAccount.account_lastname,
        account_email: updatedAccount.account_email,
        account_id: updatedAccount.account_id,
        accountData: updatedAccount
      });
    } else {
      req.flash("notice", "Sorry, password update failed. Please try again.");
      return res.render("account/editaccount", {
        title: "Edit Account",
        nav,
        errors: null,
        messages: req.flash("notice"),
        account_id
      });
    }
  } catch (error) {
    req.flash("notice", "An error occurred. Please try again.");
    return res.render("account/editaccount", {
      title: "Edit Account",
      nav,
      errors: null,
      messages: req.flash("notice"),
      account_id
    });
  }
}

async function logoutAccount(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}


module.exports = { 
  buildLogin,
  buildRegister, 
  registerAccount, 
  accountLogin, 
  logoutAccount, 
  buildAccount,
  passwordUpdate,
  accountUpdate,
  buildAccountUpdate 
};


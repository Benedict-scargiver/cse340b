/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const expressLayouts = require("express-ejs-layouts")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const inventoryRoute = require("./routes/inventoryRoute")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute");
const bodyParser = require("body-parser")
const flash = require("connect-flash")
const cookieParser = require("cookie-parser")
 

/* ***********************
 * Middleware
 * ************************/

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
//login middleware
app.use(cookieParser())

// Middleware to check JWT token validity
app.use(utilities.checkJWTToken)
 


// Flash middleware
app.use(flash())

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)
//index route
app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)

// Use the Account Route
app.use("/account", accountRoute);


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

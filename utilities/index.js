const invModel = require("../models/inventory-model")
const Util = {}


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}



function buildDetailHtml(vehicle) {
  if (!vehicle) return "<p>Vehicle not found.</p>";
  // Format price and miles
  const price = Number(vehicle.inv_price).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const miles = Number(vehicle.inv_miles).toLocaleString("en-US");
  return `
    <div class="vehicle-detail-container">
      <div class="vehicle-detail-image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-detail-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <div class="vehicle-detail-section">
          <strong>Price:</strong> ${price}
        </div>
        <div class="vehicle-detail-section">
          <strong>Description:</strong> ${vehicle.inv_description}
        </div>
        <div class="vehicle-detail-section">
          <strong>Color:</strong> ${vehicle.inv_color}
        </div>
        <div class="vehicle-detail-section">
          <strong>Miles:</strong> ${miles}
        </div>
      </div>
    </div>
  `;
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

function handleErrors(fn) {
  return function(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}


module.exports = {
  ...Util,
  handleErrors,
  buildDetailHtml,
};
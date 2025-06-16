const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


async function getInventoryById(invId) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [invId]);
    return data.rows[0];
  } catch (error) {
    throw error;
  }
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


async function insertClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    throw error
  }
}

async function insertInventory(data) {
  try {
    const sql = `
      INSERT INTO inventory (
        classification_id, inv_make, inv_model, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`
    const values = [
      data.classification_id,
      data.inv_make,
      data.inv_model,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_year,
      data.inv_miles,
      data.inv_color
    ]
    const result = await pool.query(sql, values)
    return result.rows[0]
  } catch (error) {
    throw error
  }
}


async function getClassificationOptions(selectedId = null) {
  let data = await invModel.getClassifications();
  let options = '<option value="">-- Select a classification --</option>';
  data.rows.forEach((row) => {
    options += `<option value="${row.classification_id}"${selectedId == row.classification_id ? " selected" : ""}>${row.classification_name}</option>`;
  });
  return options;
}

// Export the function
module.exports = {getClassifications, getInventoryById, getInventoryByClassificationId, insertClassification, insertInventory, getClassificationOptions};
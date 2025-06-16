let classificationList = document.querySelector("#classificationList");
classificationList.addEventListener("change", function () {
  let classification_id = classificationList.value;  

  let classIdURL = "/inv/getInventory/" + classification_id;
  fetch(classIdURL)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw Error("Network response was not OK");
    })
    .then(function (data) {      
      buildInventoryList(data);
    })
    .catch(function (error) {
      console.log("An error occured: ", error.message);
    });
});

function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");
  // Setting up the table
  let dataTable = "<thead>";
  dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>";
  dataTable += "</thead>";  
  dataTable += "<tbody>";  
  data.forEach(function (element) {    
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>MODIFY</a></td>`;
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>DELETE</a></td></tr>`;
  });
  dataTable += "</tbody>";  
  inventoryDisplay.innerHTML = dataTable;
}

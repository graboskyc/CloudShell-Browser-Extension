function getUrlVal(key){
  var url = new URL(window.location);
  //edge doesn't yet support
  // url.searchParams.get
  var retVal = null;
  var qsArray = url.search.replace("?","").split("&");
  qsArray.forEach(function(kvp){
    if(kvp.indexOf(key) !== -1) {
      retVal = kvp.split("=")[1];
    }
  });
  return decodeURIComponent(retVal);
} //end getUrlVal

function sboxDetails(response){
  console.log(response);
  // remove loading gif from div and create an unordered list
  var popupDiv = document.getElementById('div_sboxlist');
  popupDiv.innerHTML = "";

  var tbl = popupDiv.appendChild(document.createElement('table'));
  tbl.classList.add("table");
  tbl.classList.add("table-hover");
  var thead = tbl.appendChild(document.createElement('thead'));
  thead.innerHTML = "<tr><th>Component</th><th>Info</th></tr>";
  var tbody = tbl.appendChild(document.createElement('tbody'));

  var sbObj = JSON.parse(response); 
  var sboxname = getUrlVal('name');
  document.getElementById('jtitle').innerText = sboxname;

  sbObj.forEach(function(c) {
    if ((c.component_type.toLowerCase().indexOf("port") == -1) && (c.component_type.toLowerCase().indexOf("chassis") == -1) && (c.component_type.toLowerCase().indexOf("module") == -1)) {
      var row = tbody.appendChild(document.createElement("tr"));
      var cell1 = row.appendChild(document.createElement("td"));
      var cell2 = row.appendChild(document.createElement("td")); 

      cell1.innerText = c.name;
    }
  });

} // end sboxDetails

// make another callback with token to get more details on individual sandboxes
function getSbox(authToken, uriroot) {
  var sboxid = getUrlVal('id');
  var xhr = new XMLHttpRequest();
  xhr.open("GET", uriroot+"/api/v2/sandboxes/"+sboxid+"/components", true);
  xhr.setRequestHeader("Content-Type","application/json");
  xhr.setRequestHeader("Authorization","Basic " + authToken);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      sboxDetails(xhr.responseText);
    }
  }
  xhr.send();
} // end getSbox

// main on load event
// get local storage for credentials and 
// add click handler for logout and external link to open blueprints page in chrome tab
chrome.storage.local.get(null, function (result) {
  document.getElementById("btn_branding").addEventListener('click', function() {
    chrome.tabs.create({ url: "https://www.quali.com" });
  });

  var token = getUrlVal('token');
  getSbox(token, result["csuri"]);
});
// Event listener for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.
function onAnchorClick(event) {
  chrome.tabs.create({ url: event.srcElement.href });
  return false;
}

function updateSboxCell(resp, cell) {
  var obj = JSON.parse(resp);
  var localEnd = new Date(obj.end_time).toLocaleString();
  document.getElementById(cell).innerHTML = localEnd;
}

// make another callback with token to get more details on individual sandboxes
function getSboxDetail(sboxid, uriroot, cell, authToken) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", uriroot+"/api/v2/sandboxes/"+sboxid, true);
  xhr.setRequestHeader("Content-Type","application/json");
  xhr.setRequestHeader("Authorization","Basic " + authToken);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      updateSboxCell(xhr.responseText, cell);
    }
  }
  xhr.send();
} // end getSboxDetail

// takes sandbox response json and builds UI
function parseSboxList(resp, uriroot, portaluri, authToken) {

  // remove loading gif from div and create an unordered list
  var popupDiv = document.getElementById('div_sboxlist');
  popupDiv.innerHTML = "";

  var tbl = popupDiv.appendChild(document.createElement('table'));
  tbl.classList.add("table");
  tbl.classList.add("table-hover");
  var thead = tbl.appendChild(document.createElement('thead'));
  thead.innerHTML = "<tr><th>Sandbox Name</th><th>Info</th><th>End Date</th><th>Status</th></tr>";
  var tbody = tbl.appendChild(document.createElement('tbody'));

  var sbArray = JSON.parse(resp); 

  if (sbArray.length > 0) {
    var ct = 0;
    sbArray.forEach(function(sb) {
      ct++;
      // every sandbox gets a list item (li) which is a link
      // inside that is a badge on the right with sandbox status
      var row = tbody.appendChild(document.createElement('tr'));
      var cell1 = row.appendChild(document.createElement('td'));
      var cellinfo = row.appendChild(document.createElement('td'));
      var cell2 = row.appendChild(document.createElement('td'));
      cell2.id = "cell2_"+ct;
      var cell3 = row.appendChild(document.createElement('td'));

      // set link
      cell1.innerText = sb.name;
      var btnl = cellinfo.appendChild(document.createElement('button'));
      var btnd = cellinfo.appendChild(document.createElement('button'));
      var btnls = btnl.appendChild(document.createElement('span'));
      var btnds = btnd.appendChild(document.createElement('span'));
      
      btnl.classList.add("btn");
      btnl.classList.add("btn-sm");
      btnl.classList.add('btn-default');
      btnd.classList.add("btn");
      btnd.classList.add("btn-sm");
      btnd.classList.add('btn-default');
      btnls.classList.add("glyphicon");
      btnls.classList.add("glyphicon-link")
      btnds.classList.add("glyphicon");
      btnds.classList.add("glyphicon-search");

      btnl.addEventListener('click', function() {
        chrome.tabs.create({ url: portaluri + "/RM/Diagram/Index/" + sb.id });
        return false;
      });

      btnd.addEventListener('click', function() {
        window.location = 'sbox.html?id='+sb.id+'&name='+sb.name+'&token='+authToken;
      });

      // do the state badge on right
      var s = cell3.appendChild(document.createElement('span'));
      s.classList.add("label");
      if (sb.state == "Ready") {
        s.classList.add("label-success");
      }
      else if (sb.state == "Pending") {
        s.classList.add("label-primary");
      }
      else if (sb.state == "Error") {
        s.classList.add("label-warning");
      }
      else if (sb.state == "Teardown") {
        s.classList.add("label-default");
      }
      else {
        s.classList.add("label-info");
      }
      s.innerHTML = sb.state;

      getSboxDetail(sb.id, uriroot, "cell2_"+ct, authToken);
    });
  }
  else {
    popupDiv.innerHTML = '<div class="alert alert-warning" role="alert"> \
    <p style="font-weight:bold;font-size:20px;">You have no active sandboxes.</p> \
    <p>Press the "Blueprint Catalog" button below to reserve a Blueprint now.</p></div>';
  }
} // end parseSboxList

// makes authenticated rest call to sandbox API
function getSboxes(authToken, uriroot, portaluri) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", uriroot+"/api/v2/sandboxes", true);
  xhr.setRequestHeader("Content-Type","application/json");
  xhr.setRequestHeader("Authorization","Basic " + authToken);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      parseSboxList(xhr.responseText, uriroot, portaluri, authToken);
    }
  }
  xhr.send();
} // end getSboxes

// main on load event
// get local storage for credentials and 
// add click handler for logout and external link to open blueprints page in chrome tab
chrome.storage.local.get(null, function (result) {
  document.getElementById("btn_logout").addEventListener('click', function() {
    chrome.storage.local.clear(function() {
      console.log("Cleared storage");
      window.location = "login.html";
    });
  });
  
  document.getElementById("btn_bps").addEventListener('click', function() {
    chrome.tabs.create({ url: result["csportal"] + "/RM/Topology" });
  });

  document.getElementById("btn_branding").addEventListener('click', function() {
    chrome.tabs.create({ url: "https://www.quali.com" });
  });

  console.log(result);

  // make first REST call to sandbox api to get auth token for future calls
  var auth = '{"username":"'+result["csun"]+'","password":"'+result["cspw"]+'","domain":"'+result["csdom"]+'"}';
  var xhr = new XMLHttpRequest();
  xhr.open("PUT", result["csuri"]+"/api/login", true);
  xhr.setRequestHeader("Content-Type","application/json");
  xhr.onreadystatechange = function() {
    console.log(xhr);
    if (xhr.readyState == 4) {
      // no response from server so API endpoint is misconfigured
      if(xhr.responseText == "") {
        document.getElementById('div_sboxlist').innerHTML = "Something is wrong with the API URL you you supplied. Log out and try again.";
      }
      // got response from server but authentication failed
      else if (xhr.responseText.indexOf("Login failed for user") !== -1) {
        document.getElementById('div_sboxlist').innerHTML = "Your username, password, or domain is wrong. Log out and try again.";
      }
      // everything worked so strip quote and slash chars from return value
      // use that as the basic auth token and make next REST call to get sandboxes
      getSboxes(xhr.responseText.replace(/"/g,"").replace(/\\/g,""), result["csuri"], result["csportal"]);
    }
  }
  xhr.send(auth);
});
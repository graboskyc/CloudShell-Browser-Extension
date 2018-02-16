// Event listener for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.
function onAnchorClick(event) {
  chrome.tabs.create({ url: event.srcElement.href });
  return false;
}

// takes sandbox response json and builds UI
function parseSboxList(resp, portaluri) {

  // remove loading gif from div and create an unordered list
  var popupDiv = document.getElementById('div_sboxlist');
  popupDiv.innerHTML = "";
  var ul = popupDiv.appendChild(document.createElement('ul'));
  ul.classList.add("list-group");

  var sbArray = JSON.parse(resp); 

  if (sbArray.length > 0) {

    sbArray.forEach(function(sb) {
      // every sandbox gets a list item (li) which is a link
      // inside that is a badge on the right with sandbox status
      var li = ul.appendChild(document.createElement('li'));
      li.classList.add("list-group-item");

      // set link
      var a = li.appendChild(document.createElement('a'));
      a.href = portaluri + "/RM/Diagram/Index/" + sb.id;
      a.appendChild(document.createTextNode(sb.name));
      a.addEventListener('click', onAnchorClick);

      // do the state badge on right
      var s = li.appendChild(document.createElement('span'));
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
      s.classList.add("labelright");
      s.innerHTML = sb.state;
    });
  }
  else {
    var li = ul.appendChild(document.createElement('li'));
    var a = li.appendChild(document.createElement('a'));
    a.href = portaluri + "/RM/Topology";
    a.appendChild(document.createTextNode("No active sandboxes for your user. Click here to view Blueprints"));
    a.addEventListener('click', onAnchorClick);
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
      parseSboxList(xhr.responseText, portaluri);
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
// Event listener for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.
function onAnchorClick(event) {
  chrome.tabs.create({ url: event.srcElement.href });
  return false;
}

function parseSboxList(resp, portaluri) {
  var popupDiv = document.getElementById('div_sboxlist');
  var ul = popupDiv.appendChild(document.createElement('ul'));
  ul.classList.add("list-group");

  var sbArray = JSON.parse(resp); 

  if (sbArray.length > 0) {
    sbArray.forEach(function(sb) {
      var li = ul.appendChild(document.createElement('li'));
      li.classList.add("list-group-item");
      var a = li.appendChild(document.createElement('a'));
      a.href = portaluri + "/RM/Diagram/Index/" + sb.id;
      a.appendChild(document.createTextNode(sb.name));
      a.addEventListener('click', onAnchorClick);
      var s = li.appendChild(document.createElement('span'));
      s.classList.add("badge");
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
}

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
}

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
  var auth = '{"username":"'+result["csun"]+'","password":"'+result["cspw"]+'","domain":"'+result["csdom"]+'"}';
  var xhr = new XMLHttpRequest();
  xhr.open("PUT", result["csuri"]+"/api/login", true);
  xhr.setRequestHeader("Content-Type","application/json");
  xhr.onreadystatechange = function() {
    console.log(xhr);
    if (xhr.readyState == 4) {
      if(xhr.responseText == "") {
        document.getElementById('div_sboxlist').innerHTML = "Something is wrong with the API URL you you supplied. Log out and try again.";
      }
      else if (xhr.responseText.indexOf("Login failed for user") !== -1) {
        document.getElementById('div_sboxlist').innerHTML = "Your username, password, or domain is wrong. Log out and try again.";
      }
      getSboxes(xhr.responseText.replace(/"/g,"").replace(/\\/g,""), result["csuri"], result["csportal"]);
    }
  }
  xhr.send(auth);
});
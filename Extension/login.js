chrome.storage.local.get(null, function (result) {
    console.log(result);
    if(result.hasOwnProperty("csun")) {
        window.location = "popup.html";
    }
});

document.getElementById("btn_login").addEventListener('click', function() {
    var csuri = document.getElementById("txt_uri").value;
    var csportal = document.getElementById("txt_portal").value;
    if((csuri.indexOf("http") !== -1) && (csportal.indexOf("http") !== -1)) {
        var csdet = {}
        csdet["csun"] = document.getElementById("txt_un").value;
        csdet["cspw"] = document.getElementById("txt_pw").value;
        csdet["csdom"] = document.getElementById("txt_dom").value;
        csdet["csuri"] = csuri.replace(/\/$/, "");;
        csdet["csportal"] = csportal.replace(/\/$/, "");;
        chrome.storage.local.set(csdet, function() {
            window.location = "popup.html";
        });
    } else {
        alert("Your portal and API URLs must start with http:// or https://")
    }
    return false;
});
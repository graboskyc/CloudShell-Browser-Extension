chrome.storage.local.get(null, function (result) {
    console.log(result);
    if(result.hasOwnProperty("csun")) {
        window.location = "popup.html";
    }
});

document.getElementById("btn_login").addEventListener('click', function() {
    var csdet = {}
    csdet["csun"] = document.getElementById("txt_un").value;
    csdet["cspw"] = document.getElementById("txt_pw").value;
    csdet["csdom"] = document.getElementById("txt_dom").value;
    csdet["csuri"] = document.getElementById("txt_uri").value;
    csdet["csportal"] = document.getElementById("txt_portal").value;
    chrome.storage.local.set(csdet, function() {
        window.location = "popup.html";
    });
});
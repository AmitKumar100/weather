chrome.runtime.onInstalled.addListener(function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updatePosition);
    } else {
        alert("geolocation is not supported in this browser.");
    }
    chrome.storage.sync.set({type: 0});
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == "updateIcon") {
        var icon = msg.icon;
        var temp = Math.floor(msg.temp).toString();
        chrome.browserAction.setIcon({path: "/icons/"+icon+".png"});
        chrome.browserAction.setBadgeText({text: temp+"°"});
        chrome.browserAction.setBadgeBackgroundColor({color: "#008bce"});
    }
});

function updatePosition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    $.post("https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat="+lat+"&lon="+lon, function(result) {
        var data = {
            country: result.address.country,
            country_code: result.address.country_code,
            state: result.address.state,
            village: result.address.village,
            town: result.address.town,
            city: result.address.city
        }
        chrome.storage.sync.set({data: data});
    });
}
setInterval(function() {
    weatherTimelyupdate();
}, 3600000);

function weatherTimelyupdate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updatePosition);

        chrome.storage.sync.get(["data"],function(ret) {
            var user_data = ret.data;
            //Current weather
            $.post("http://api.openweathermap.org/data/2.5/weather?q="+user_data.village+","+user_data.country_code+"&APPID=53e3d051f3fdae0258c5b8b7712a4890&units=metric", function(result) {
                var data = {
                    w_icon: result.weather[0].icon,
                    temp: result.main.temp,
                }
                var icon = data.w_icon;
                var temp = Math.floor(data.temp).toString();
                chrome.browserAction.setIcon({path: "/icons/"+icon+".png"});
                chrome.browserAction.setBadgeText({text: temp+"°"});
                chrome.browserAction.setBadgeBackgroundColor({color: "#008bce"});
            });
        });
    }
}
$(function() {
    
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    chrome.storage.sync.get("type", function(ret) {
        var type = parseInt(ret.type);
        $(".type-div").attr("data-type",type);
        if (type == 0) {
            $(".btn-type[data-type='btnC']").removeClass("btn-outline-primary").addClass("btn-primary");
        } else {
            $(".btn-type[data-type='btnF']").removeClass("btn-outline-primary").addClass("btn-primary");
        }
    });

    $("body").on("click",".btn-type",function() {
        var type = $(this).data("type");
        
        if (type == "btnF") { var type_t = 1; }
        else { type_t = 0; }

        $(".btn-type").removeClass("btn-primary").addClass("btn-outline-primary");
        $(`.btn-type[data-type="${type}"]`).removeClass("btn-outline-primary").addClass("btn-primary");

        if (type == "btnC") 
            $(".type-div").attr("data-type", 0);
        else
            $(".type-div").attr("data-type", 1);

        if (type_t == 0) {
            chrome.storage.sync.set({type: 0});
        } else {
            chrome.storage.sync.set({type: 1});
        }

        window.location.href = "mainpage.html";
    });

    $(".location_input").keyup(function(e) {
        if (e.keyCode == 13) {
            $(".btn_checkLocation").click();
        }
    });

    $("body").on("click",".btn_checkLocation", function() {
        var type = $(".type-div").data("type");
        if (type == 0) { var type_t = "C"; }
        else { var type_t = "F"; }
        var location = $(".location_input").val();
        $.post("http://api.openweathermap.org/data/2.5/weather?q="+location+"&APPID=53e3d051f3fdae0258c5b8b7712a4890&units=metric", function(result) {
            $(".spinner").remove();
            console.log(result);
            var date=new Date();  
            var day=date.getDate();  
            var dayname = date.getDay();
            var month=date.getMonth()+1;  
            var year=date.getFullYear(); 
            var fdate = year +"/"+month +"/"+ day + "  " + days[dayname]; 
            var data = {
                w_icon: result.weather[0].icon,
                humidity: result.main.humidity,
                pressure: result.main.pressure,
                temp: result.main.temp,
                temp_max: result.main.temp_max,
                temp_min: result.main.temp_min,
                sunrise: result.sys.sunrise,
                susnet: result.sys.sunset,
                visibility: result.visibility,
                wind_deg: result.wind.deg,
                wind_speed: result.wind.speed,
                w_main: result.weather[0].main,
                w_desc: result.weather[0].description
            }
            if (type == 1) {
                data.temp = data.temp * 9 / 5 + 32;
                data.temp_max = data.temp_max * 9 / 5 + 32;
                data.temp_min = data.temp_min * 9 / 5 + 32;
            }
            data.temp = data.temp.toFixed(2);
            data.temp_max = data.temp_max.toFixed(2);
            data.temp_min = data.temp_min.toFixed(2);
            var visibility = data.visibility / 1000;
            $(".weather-data").html(`
            <div class="location-details text-light text-capitalize">${location}</div>
            <div class="header-title  text-light py-4">
                <div class="current-temp"><img src="/icons/${data.w_icon}_48.png" />${data.temp}&deg;${type_t}</div>
                <div class="details">${data.w_main} <span>${data.w_desc}</span></div>
            </div>
            <div class="d-flex align-items-center justify-content-between">
                <span class="final-date">${fdate}</span>
                <span class="min-max-temp">Min: ${data.temp_min}&deg;${type_t} | Max: ${data.temp_max}&deg;${type_t}</span>
            </div>
            <div class="weather-details mt-2">
                <div class="card mb-3">
                    <div class="card-header">Details</div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div class="weather-details-item mb-2">Humidity</div>
                            <div class="weather-details-item mb-2">
                                ${data.humidity}%
                            </div>
                        </div>
                        <div class="d-flex justify-content-between">
                            <div class="weather-details-item ">Visibility</div>
                            <div class="weather-details-item">${visibility}km</div>
                        </div>
                    </div>
                </div>                                   
            </div> 
            <div class="weather-details mt-2">
                <div class="card mb-3">
                    <div class="card-header">Forecast</div>
                    <div class="card-body">
                        <div class="forecast row">
                        </div>
                    </div>
                </div>
            </div>                                        
            `);
        }).fail(function(xhr, status, error) {
            alert("Location not found");
            $(".forecast-spinner").remove();
        });
        
        //Forecast
        $(".forecast").append("<div class='w-100 text-center spinner-forecast'><i class='fas fa-spinner fa-spin'></i></div");
        $.post("http://api.openweathermap.org/data/2.5/forecast?q="+location+"&APPID=53e3d051f3fdae0258c5b8b7712a4890&units=metric&cnt=40", function(result) {
            $(".forecast-spinner").remove();
            var list = result.list;
            var today = new Date();
            today = today.getDate();
            console.log(list);
            var lastDate;
            $(list).each(function(index, value) { 
                if (type == 1) {
                    list[index].main.temp_min = list[index].main.temp_min * 9 / 5 + 32
                }
                var a = new Date(list[index].dt * 1000);
                var year = a.getFullYear().toString();
                year = year.slice(-2);
                if (a.getDate() != today) {
                    if (a.getDate() != lastDate) {
                        $(".forecast").append(`
                        
                            <div class="col">
                                <div class="weather-details-item mb-2">
                                    ${a.getDate()}/${year}
                                </div>
                                <div class="weather-details-item mb-2">
                                    ${Math.floor(list[index].main.temp_min)}&deg;${type_t}
                                </div>
                            </div>
                        
                        `);
                    }
                    lastDate = a.getDate();
                }
            });
        });
        
    });




    chrome.storage.sync.get(["data"],function(ret) {
        var user_data = ret.data;
        console.log(user_data);

        var type = $(".type-div").data("type");
        if (type == 0) { var type_t = "C"; }
        else { var type_t = "F"; }

        //Current weathe
        var user_loc = "";
        if (user_data.town) { user_loc = user_data.town; }
        if (user_data.village) { user_loc = user_data.village; }
        if (user_data.city) { user_loc = user_data.city; }
        $.post("http://api.openweathermap.org/data/2.5/weather?q="+user_loc+","+user_data.country_code+"&APPID=53e3d051f3fdae0258c5b8b7712a4890&units=metric", function(result) {
            $(".spinner").remove();
            var date=new Date();  
            var day=date.getDate();  
            var dayname = date.getDay();
            var month=date.getMonth()+1;  
            var year=date.getFullYear(); 
            var fdate = year +"/"+month +"/"+ day + "  " + days[dayname]; 
            var data = {
                w_icon: result.weather[0].icon,
                humidity: result.main.humidity,
                pressure: result.main.pressure,
                temp: result.main.temp,
                temp_max: result.main.temp_max,
                temp_min: result.main.temp_min,
                sunrise: result.sys.sunrise,
                susnet: result.sys.sunset,
                visibility: result.visibility,
                wind_deg: result.wind.deg,
                wind_speed: result.wind.speed,
                w_main: result.weather[0].main,
                w_desc: result.weather[0].description,
                city: user_loc,
                country: user_data.country
            }
            if (type == 1) {
                data.temp = data.temp * 9 / 5 + 32
                data.temp_max = data.temp_max * 9 / 5 + 32;
                data.temp_min = data.temp_min * 9 / 5 + 32;
            }

            data.temp = data.temp.toFixed(2);
            data.temp_max = data.temp_max.toFixed(2);
            data.temp_min = data.temp_min.toFixed(2);
            
            var visibility = data.visibility / 1000;
            chrome.runtime.sendMessage({action: "updateIcon", icon: data.w_icon, temp: data.temp});
            $(".weather-data").html(`
                <div class="location-details text-light">${data.city}, ${data.country}</div>
                <div class="header-title  text-light py-4">
                    <div class="current-temp"><img src="/icons/${data.w_icon}_48.png" />${data.temp}&deg;${type_t}</div>
                    <div class="details">${data.w_main} <span>${data.w_desc}</span></div>
                </div>
                <div class="d-flex align-items-center justify-content-between">
                    <span class="final-date">${fdate}</span>
                    <span class="min-max-temp">Min: ${data.temp_min}&deg;${type_t} | Max: ${data.temp_max}&deg;${type_t}</span>
                </div>
                <div class="weather-details mt-2">
                    <div class="card mb-3">
                        <div class="card-header">Details</div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div class="weather-details-item mb-2">Humidity</div>
                                <div class="weather-details-item mb-2">
                                    ${data.humidity}%
                                </div>
                            </div>
                            <div class="d-flex justify-content-between">
                                <div class="weather-details-item ">Visibility</div>
                                <div class="weather-details-item">${visibility}km</div>
                            </div>
                        </div>
                    </div>                                   
                </div> 
                <div class="weather-details mt-2">
                    <div class="card mb-3">
                        <div class="card-header">Forecast</div>
                        <div class="card-body">
                            <div class="forecast row">
                            </div>
                        </div>
                    </div>
                </div>                               
            `);
        });
        
        //Forecast
        $(".forecast").append("<div class='w-100 text-center spinner-forecast'><i class='fas fa-spinner fa-spin'></i></div");
        $.post("http://api.openweathermap.org/data/2.5/forecast?q="+user_loc+","+user_data.country_code+"&APPID=53e3d051f3fdae0258c5b8b7712a4890&units=metric&cnt=40", function(result) {
            $(".forecast-spinner").remove();
            var list = result.list;
            var today = new Date();
            today = today.getDate();
            console.log(list);
            var lastDate;
            $(list).each(function(index, value) { 
                if (type == 1) {
                    list[index].main.temp_min = list[index].main.temp_min * 9 / 5 + 32;
                }
                var a = new Date(list[index].dt * 1000);
                var year = a.getFullYear().toString();
                year = year.slice(-2);
                if (a.getDate() != today) {
                    if (a.getDate() != lastDate) {
                        $(".forecast").append(`
                            <div class="col">
                                <div class="weather-details-item mb-2">
                                    ${a.getDate()}/${year}
                                </div>
                                <div class="weather-details-item mb-2">
                                    ${Math.floor(list[index].main.temp_min)}&deg;${type_t}
                                </div>
                            </div>
                        `);
                    }
                    lastDate = a.getDate();
                }
            });
        });        
    });
    
});

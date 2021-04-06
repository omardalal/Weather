var express     = require("express");
var request     = require("request");
var bodyParser  = require("body-parser");

var app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("views/stylesheets"));
app.use(express.static("rcs"));

var weatherDay = {
    condition: "N/A",
    city: "N/A",
    temp: 0,
    pressure: 0,
    feel: 0,
    wind: 0,
    humidity: 0,
    img: "clearD",
    country: "US",
    date: "2020-3-10"
};

var weatherNight = {
    condition: "N/A",
    city: "N/A",
    temp: 0,
    pressure: 0,
    feel: 0,
    wind: 0,
    humidity: 0,
    img: "clearD",
    country: "US",
    date: "2020-3-10"
};

var extWeatherData=[];
for (var i=0; i<4; i++) {
    extWeatherData[i] = {
        condition: "N/A",
        city: "N/A",
        temp: 0,
        pressure: 0,
        feel: 0,
        wind: 0,
        humidity: 0,
        img: "clearD",
        country: "US",
        date: "2020-3-10"
    };
}

app.get("/", function(req, res) {
    request("http://api.openweathermap.org/data/2.5/forecast?q=new%20york&appid=c93b5f6bd35a7cc5cbcb634239bc6f36", function(error,response, body) {
        if (!error&&response.statusCode==200) {
            fillUp(body);
        }
    })
    res.render("home", [weatherDayData=weatherDay, weatherNightData=weatherNight, bg=randomBG(), weatherData=extWeatherData]);
});

function fillUp(body) {
    var parsedBody = JSON.parse(body);

    var wd = parsedBody["list"][checkDay(parsedBody["list"])];
    setWeatherData(weatherDay, parsedBody, wd);
    if (weatherDay.img=="clearN") {
        weatherDay.img = "clearD";
    }

    var wn = parsedBody["list"][checkNight(parsedBody["list"])];
    setWeatherData(weatherNight, parsedBody, wn);
    if (weatherNight.img=="clearD") {
        weatherNight.img = "clearN";
    }
    setDaysData(parsedBody);
}

function setWeatherData(target, body, dn) {
    target.city = body["city"]["name"];
    target.country = body["city"]["country"];
    target.condition = dn["weather"][0]["main"];
    target.temp = Math.trunc(dn["main"]["temp"]-273.15);
    target.pressure = dn["main"]["pressure"];
    target.feel = Math.trunc(dn["main"]["feels_like"]-273.15);
    target.wind = dn["wind"]["speed"];
    target.humidity = dn["main"]["humidity"];
    target.img = setIcon(dn["weather"][0]["icon"]);
    target.date = (dn["dt_txt"]).substring(0,11);
}

function setDaysData(body) {
    var list = body["list"];
    var currDay = list[0]["dt_txt"].substring(0,11);
    var i=0;
    for (var j=0; j<list.length; j++) {
        if (currDay!=list[j]["dt_txt"].substring(0,11)) {
            currDay=list[j]["dt_txt"].substring(0,11);
            setWeatherData(weatherData[i], body, list[j]);
            if (weatherData[i].img=="clearN") {
                weatherData[i].img = "clearD";
            }
            i++;
            if (i==4) {
                break;
            }
        }
    }
    
}

function setIcon(iconStr) {
    if (iconStr=="01d") {
        return "clearD";
    } else if (iconStr=="01n") {
        return "clearN";
    } else if (iconStr=="02d" || iconStr=="03d" || iconStr=="04d" || iconStr=="02n" || iconStr=="03n" || iconStr=="04n") {
        return "cloud";
    } else if (iconStr=="09d" || iconStr=="10d" || iconStr=="09n" || iconStr=="10n" ) {
        return "rain";
    } else if (iconStr=="11d" || iconStr=="11n") {
        return "thunder";
    } else if (iconStr=="13d" || iconStr=="13n") {
        return "snow";
    } else {
        return "haze";
    }
}

function checkDay(arr) {
    for (var i=0; i<arr.length; i++) {
        if (arr[i]["dt_txt"].includes("12:00:00")) {
            return i;
        }
    }
}

function checkNight(arr) {
    for (var i=1; i<arr.length; i++) {
        if (arr[i]["dt_txt"].includes("03:00:00")) {
            return i;
        }
    }
}

function randomBG() {
    return Math.ceil(Math.random()*11);
}

app.post("/search", function(req,res) {
    if (req.body.city.trim()!=""&&req.body.city!=null) {
        request("http://api.openweathermap.org/data/2.5/forecast?q="+req.body.city.trim()+"&appid=c93b5f6bd35a7cc5cbcb634239bc6f36", function(error,response, body) {
            var parsedBody = JSON.parse(body);
            if (!error&&res.statusCode==200&&parsedBody["cod"]=="200") {
                fillUp(body);
                res.redirect("/");
            } else {
                res.redirect("/");
            }
        });
    }
});

app.get("*", function(req, res) {
    res.render("home");
});

app.listen(3000, function() {
    console.log("SEVER HAS STARTED ON PORT 3000");
});
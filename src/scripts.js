const apiKey = "242376116803c22adf8d06c51e88d072";

const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const weatherIcon = document.querySelector(".weatherIcon img");

async function checkWeather(city = "London") {

    const apiUrl =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();

        console.log(data);

       
        const today = new Date();

        document.querySelector("#current-date").textContent =  today.toDateString();

      
        document.querySelector("#current-weather-condition").textContent = data.weather[0].main;

        document.querySelector("#current-temperature").textContent = `${Math.round(data.main.temp)}°C`;

      
        document.querySelector(".wind .metric-value").textContent = `${data.wind.speed} km/h`;

        document.querySelector(".humidity .metric-value").textContent = `${data.main.humidity}%`;

        document.querySelector(".rain .metric-value").textContent = `${data.clouds.all}%`;

    
        const weatherCondition = data.weather[0].main;

        weatherIcon.className =  "w-24 h-20 object-contain";

        if (weatherCondition === "Clouds") {
            weatherIcon.src = "/assets/images/Group 34.svg";
        }

        else if (weatherCondition === "Clear") {
            weatherIcon.src = "/assets/images/clear.png";
        }

        else if (weatherCondition === "Rain") {
            weatherIcon.src = "/assets/images/rain.png";
        }

        else if (weatherCondition === "Drizzle") {
            weatherIcon.src = "/assets/images/drizzle.png";
        }

        else if (weatherCondition === "Mist") {
            weatherIcon.src = "/assets/images/mist.png";
        }

        else {
            weatherIcon.src = "/assets/images/Group 34.svg";
        }

    }

    catch (error) {
        alert(error.message);
    }
}

async function getForecast(city = "London", type = "today") {

    const forecastUrl =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try {

        const response = await fetch(forecastUrl);

        const data = await response.json();

        let forecasts = [];

        if (type === "today") {
            forecasts = data.list.slice(0, 4);
        }

        else if (type === "tomorrow") {
            forecasts = data.list.slice(8, 12);
        }

        else if (type === "next3days") {
            forecasts =
                data.list
                    .filter((item, index) => index % 8 === 0)
                    .slice(1, 5);
        }

        const forecastCards =
            document.querySelectorAll(".forecast-card");

        forecastCards.forEach((card, index) => {

            const item = forecasts[index];

            if (!item) return;

            const date = new Date(item.dt_txt);

            let timeLabel = "";

            if (type === "next3days") {
                timeLabel =
                    date.toLocaleDateString("en-US", {
                        weekday: "short",
                    });

            }

            else {
                timeLabel =
                    date.toLocaleTimeString([], {
                        hour: "numeric",
                    });

            }
            const temp = Math.round(item.main.temp);

            card.querySelector(".hourly-forecast").textContent =
                timeLabel;

            card.querySelector(".temperature-display").textContent =
                `${temp}°C`;

            const icon = card.querySelector("img");

            const condition = item.weather[0].main;

            if (condition === "Clouds") {

                icon.src = "/assets/images/Group 34.svg";

            }

            else if (condition === "Clear") {

                icon.src = "/assets/images/clear.png";

            }

            else if (condition === "Rain") {

                icon.src = "/assets/images/rain.png";

            }

            else if (condition === "Drizzle") {

                icon.src = "/assets/images/drizzle.png";

            }

            else if (condition === "Mist") {

                icon.src = "/assets/images/mist.png";

            }

            else {

                icon.src =
                    "/assets/images/cloud-angled-rain-zap.svg";

            }

            icon.className =
                "weather-icon w-10 h-10 object-contain my-2";

        });

    }

    catch (error) {

        console.log(error);

    }
}

checkWeather();
getForecast();

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city !== "") {

        currentCity = city;

        checkWeather(city);

        getForecast(city);

    }

});


cityInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        const city = cityInput.value.trim();

        if (city !== "") {

            currentCity = city;

            checkWeather(city);

            getForecast(city);

        }

    }

});

const themeSwitch =
    document.querySelector("#theme-switch");

themeSwitch.addEventListener("click", () => {

    document.body.classList.toggle("dark-theme");

});

const todayTab =document.querySelector("#today-tab");

const tomorrowTab = document.querySelector("#tomorrow-tab");

const next3DaysTab = document.querySelector("#next3days-tab");

let currentCity = "London";

function setActiveTab(activeTab) {

    [todayTab, tomorrowTab, next3DaysTab] .forEach((tab) => {
            tab.classList.remove("underline");
            tab.classList.add("opacity-60");
        });

    activeTab.classList.add("underline");

    activeTab.classList.remove("opacity-60");

}

todayTab.addEventListener("click", () => {
    setActiveTab(todayTab);
    getForecast(currentCity, "today");

});

tomorrowTab.addEventListener("click", () => {
    setActiveTab(tomorrowTab);
    getForecast(currentCity, "tomorrow");

});

next3DaysTab.addEventListener("click", () => {
    setActiveTab(next3DaysTab);
    getForecast(currentCity, "next3days");

});
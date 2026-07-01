const apiKey = "242376116803c22adf8d06c51e88d072";

const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const weatherIcon = document.querySelector(".weatherIcon img");

const todayTab = document.querySelector("#today-tab");
const tomorrowTab = document.querySelector("#tomorrow-tab");
const next3DaysTab = document.querySelector("#next3days-tab");

let currentCity = "London";
let weatherChartInstance = null;

// OpenWeather icon function
function getWeatherIcon(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// CURRENT WEATHER
async function checkWeather(city = "London") {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();

        const today = new Date();

        document.querySelector("#current-date").textContent =
            today.toDateString();

        document.querySelector("#current-weather-condition").textContent =
            data.weather[0].main;

        document.querySelector("#current-temperature").textContent =
            `${Math.round(data.main.temp)}°C`;

        document.querySelector(".wind .metric-value").textContent =
            `${data.wind.speed} km/h`;

        document.querySelector(".humidity .metric-value").textContent =
            `${data.main.humidity}%`;

        document.querySelector(".rain .metric-value").textContent =
            `${data.clouds.all}%`;

        // WEATHER ICON
        const iconCode = data.weather[0].icon;

        weatherIcon.src = getWeatherIcon(iconCode);

        weatherIcon.className = "w-24 h-20 object-contain";

    } catch (error) {
        alert(error.message);
        console.log(error);
    }
}

// FORECAST
async function getForecast(city = "London", type = "today") {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(forecastUrl);

        if (!response.ok) {
            throw new Error("Forecast not found");
        }

        const data = await response.json();

        let forecasts = [];

        if (type === "today") {
            forecasts = data.list.slice(0, 4);
        } else if (type === "tomorrow") {
            forecasts = data.list.slice(8, 12);
        } else if (type === "next3days") {
            forecasts = data.list
                .filter((item, index) => index % 8 === 0)
                .slice(1, 5);
        }

        const forecastCards =
            document.querySelectorAll(".forecast-card");

        forecastCards.forEach((card, index) => {
            const item = forecasts[index];

            if (!item) {
                card.style.display = "none";
                return;
            } else {
                card.style.display = "flex";
            }

            const date = new Date(item.dt_txt);

            let timeLabel = "";

            if (type === "next3days") {
                timeLabel = date.toLocaleDateString("en-US", {
                    weekday: "short",
                });
            } else {
                timeLabel = date.toLocaleTimeString([], {
                    hour: "numeric",
                });
            }

            const temp = Math.round(item.main.temp);

            card.querySelector(".hourly-forecast").textContent =
                timeLabel;

            card.querySelector(".temperature-display").textContent =
                `${temp}°C`;

            // FORECAST ICON
            const icon = card.querySelector("img");

            const iconCode = item.weather[0].icon;

            icon.src = getWeatherIcon(iconCode);

            icon.className =
                "weather-icon w-10 h-10 object-contain my-2";
        });

        updateWeatherGraph(forecasts, type);

    } catch (error) {
        console.log(error);
    }
}

// CHART
function updateWeatherGraph(forecastData, type) {
    const ctx =
        document.getElementById("weatherGraph").getContext("2d");

    const labels = forecastData.map((item) => {
        const date = new Date(item.dt_txt);

        return type === "next3days"
            ? date.toLocaleDateString("en-US", {
                  weekday: "short",
              })
            : date.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
              });
    });

    const temps = forecastData.map((item) =>
        Math.round(item.main.temp)
    );

    if (weatherChartInstance) {
        weatherChartInstance.destroy();
    }

    const isDark =
        document.body.classList.contains("dark-theme");

    const textColor = isDark ? "#a1a1aa" : "#52525b";

    const lineColor = "#3b82f6";

    weatherChartInstance = new Chart(ctx, {
        type: "line",

        data: {
            labels: labels,

            datasets: [
                {
                    label: "Temperature (°C)",

                    data: temps,

                    borderColor: lineColor,

                    backgroundColor:
                        "rgba(59, 130, 246, 0.1)",

                    borderWidth: 2,

                    tension: 0.4,

                    fill: true,

                    pointBackgroundColor: lineColor,
                },
            ],
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false,
                },
            },

            scales: {
                x: {
                    grid: {
                        display: false,
                    },

                    ticks: {
                        color: textColor,
                    },
                },

                y: {
                    grid: {
                        color: isDark
                            ? "#27272a"
                            : "#e4e4e7",
                    },

                    ticks: {
                        color: textColor,
                    },
                },
            },
        },
    });
}

// SEARCH
function handleSearch() {
    const city = cityInput.value.trim();

    if (city !== "") {
        currentCity = city;

        checkWeather(city);

        getForecast(city, "today");

        setActiveTab(todayTab);
    }
}

// EVENTS
searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSearch();
    }
});

// THEME SWITCH
const themeSwitch =
    document.querySelector("#theme-switch");

themeSwitch.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    if (weatherChartInstance) {
        getForecast(
            currentCity,
            document
                .querySelector(".underline")
                .id.replace("-tab", "")
        );
    }
});

// TABS
function setActiveTab(activeTab) {
    [todayTab, tomorrowTab, next3DaysTab].forEach((tab) => {
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

// INITIAL LOAD
checkWeather(currentCity);

getForecast(currentCity, "today");
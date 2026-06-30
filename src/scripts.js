const apiKey = "242376116803c22adf8d06c51e88d072";

const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const weatherIcon = document.querySelector(".weatherIcon img");

// Initialize state tracking variables up top to avoid ReferenceErrors
let currentCity = "London";
let weatherChartInstance = null;

async function checkWeather(city = "London") {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();
        const today = new Date();

        document.querySelector("#current-date").textContent = today.toDateString();
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

        const weatherCondition = data.weather[0].main;
        weatherIcon.className = "w-24 h-20 object-contain";

        if (weatherCondition === "Clouds") {
            weatherIcon.src = "/assets/images/Group 34.svg";
        } else if (weatherCondition === "Clear") {
            weatherIcon.src = "/assets/images/clear.png";
        } else if (weatherCondition === "Rain") {
            weatherIcon.src = "/assets/images/rain.png";
        } else if (weatherCondition === "Drizzle") {
            weatherIcon.src = "/assets/images/drizzle.png";
        } else if (weatherCondition === "Mist") {
            weatherIcon.src = "/assets/images/mist.png";
        } else {
            weatherIcon.src = "/assets/images/Group 34.svg";
        }
    } catch (error) {
        alert(error.message);
    }
}

async function getForecast(city = "London", type = "today") {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(forecastUrl);
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

        const forecastCards = document.querySelectorAll(".forecast-card");

        forecastCards.forEach((card, index) => {
            const item = forecasts[index];
            if (!item) return;

            const date = new Date(item.dt_txt);
            let timeLabel = "";

            if (type === "next3days") {
                timeLabel = date.toLocaleDateString("en-US", { weekday: "short" });
            } else {
                timeLabel = date.toLocaleTimeString([], { hour: "numeric" });
            }

            const temp = Math.round(item.main.temp);
            card.querySelector(".hourly-forecast").textContent = timeLabel;
            card.querySelector(".temperature-display").textContent = `${temp}°C`;

            const icon = card.querySelector("img");
            const condition = item.weather[0].main;

            if (condition === "Clouds") {
                icon.src = "/assets/images/Group 34.svg";
            } else if (condition === "Clear") {
                icon.src = "/assets/images/clear.png";
            } else if (condition === "Rain") {
                icon.src = "/assets/images/rain.png";
            } else if (condition === "Drizzle") {
                icon.src = "/assets/images/drizzle.png";
            } else if (condition === "Mist") {
                icon.src = "/assets/images/mist.png";
            } else {
                icon.src = "/assets/images/cloud-angled-rain-zap.svg";
            }

            icon.className = "weather-icon w-10 h-10 object-contain my-2";
        });

        // Update analytics line graph mapping to current selected timeline segment
        updateWeatherGraph(forecasts, type);
    } catch (error) {
        console.log(error);
    }
}

// Dedicated Chart renderer engine
function updateWeatherGraph(forecastData, type) {
    const ctx = document.getElementById("weatherGraph").getContext("2d");

    // Parse labels and temperatures directly out of array data
    const labels = forecastData.map((item) => {
        const date = new Date(item.dt_txt);
        return type === "next3days"
            ? date.toLocaleDateString("en-US", { weekday: "short" })
            : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    });

    const temps = forecastData.map((item) => Math.round(item.main.temp));

    // Destroy active chart instance explicitly before drawing to avoid visual overlapping artifacts
    if (weatherChartInstance) {
        weatherChartInstance.destroy();
    }

    const isDark = document.body.classList.contains("dark-theme");
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
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
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
                legend: { display: false },
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor } },
                y: {
                    grid: { color: isDark ? "#27272a" : "#e4e4e7" },
                    ticks: { color: textColor },
                },
            },
        },
    });
}

// Initial triggers
checkWeather(currentCity);
getForecast(currentCity);

// Unified execution block helper
function handleSearch() {
    const city = cityInput.value.trim();
    if (city !== "") {
        currentCity = city;
        checkWeather(city);
        getForecast(city, "today");
        setActiveTab(todayTab); // Reset tab interface state directly back to base
    }
}

searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});

const themeSwitch = document.querySelector("#theme-switch");
themeSwitch.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    // Redraw graph instantly to recalculate axis line color themes dynamically
    if (weatherChartInstance) {
        getForecast(
            currentCity,
            document.querySelector(".nav-tab .underline").id.replace("-tab", ""),
        );
    }
});

const todayTab = document.querySelector("#today-tab");
const tomorrowTab = document.querySelector("#tomorrow-tab");
const next3DaysTab = document.querySelector("#next3days-tab");

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
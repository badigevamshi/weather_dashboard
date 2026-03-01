const apiKey = "65857ce633b80efc1371858def5c256e";

/* ===============================
   DOM ELEMENTS
================================= */
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const resultDiv = document.getElementById("weatherResult");
const forecastDiv = document.getElementById("forecast");
const historyList = document.getElementById("historyList");
const spinner = document.getElementById("loadingSpinner");
const themeToggle = document.getElementById("themeToggle");
const container = document.querySelector(".container");

const skycons = new Skycons({ color: "white" });
let lightningInterval;

/* ===============================
   HISTORY CONFIG (48 HOURS)
================================= */
const HISTORY_EXPIRY = 48 * 60 * 60 * 1000;

/* ===============================
   INIT ON LOAD
================================= */
window.addEventListener("load", () => {
    initTheme();
    displayHistory();

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(position => {
        getWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
        );
    });
});

/* ===============================
   SEARCH EVENTS
================================= */
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) return;

    getWeatherByCity(city);
    saveToHistory(city);
});

cityInput.addEventListener("keypress", e => {
    if (e.key === "Enter") searchBtn.click();
});

/* ===============================
   FETCH WEATHER
================================= */
async function fetchWeather(weatherURL, forecastURL) {
    spinner.classList.remove("hidden");
    resultDiv.innerHTML = "";
    forecastDiv.innerHTML = "";

    try {
        const weatherRes = await fetch(weatherURL);
        const weatherData = await weatherRes.json();
        if (!weatherRes.ok) throw new Error(weatherData.message);

        renderCurrentWeather(weatherData);
        changeBackground(weatherData.weather[0].main);

        const forecastRes = await fetch(forecastURL);
        const forecastData = await forecastRes.json();
        renderForecast(forecastData);

    } catch (error) {
        resultDiv.innerHTML = `<p>${error.message}</p>`;
    } finally {
        spinner.classList.add("hidden");
    }
}

function getWeatherByCity(city) {
    fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
}

function getWeatherByCoords(lat, lon) {
    fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
}

/* ===============================
   RENDER CURRENT WEATHER
================================= */
function renderCurrentWeather(data) {
    resultDiv.innerHTML = `
        <h3>${data.name}, ${data.sys.country}</h3>
        <canvas id="weatherIcon" width="100" height="100"></canvas>
        <p><strong>${data.main.temp}°C</strong></p>
        <p>${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
    `;

    skycons.remove("weatherIcon");

    const iconMap = {
        Clear: Skycons.CLEAR_DAY,
        Clouds: Skycons.CLOUDY,
        Rain: Skycons.RAIN,
        Snow: Skycons.SNOW,
        Thunderstorm: Skycons.RAIN,
        Drizzle: Skycons.SLEET,
        Mist: Skycons.FOG,
        Haze: Skycons.FOG
    };

    skycons.add("weatherIcon", iconMap[data.weather[0].main] || Skycons.CLOUDY);
    skycons.play();
}

/* ===============================
   RENDER FORECAST
================================= */
function renderForecast(data) {
    if (!data.list) return;

    const daily = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    forecastDiv.innerHTML = "<h3>5-Day Forecast</h3>";

    daily.slice(0, 5).forEach(day => {
        forecastDiv.innerHTML += `
            <div class="forecast-day">
                <p>${day.dt_txt.split(" ")[0]}</p>
                <p>${day.main.temp}°C</p>
                <p>${day.weather[0].description}</p>
            </div>
        `;
    });
}

/* ===============================
   BACKGROUND + SMART UI
================================= */
function changeBackground(condition) {

    document.body.classList.remove("rain", "snow");
    stopLightning();

    container.classList.remove(
        "dark-glass",
        "light-glass",
        "dark-text",
        "light-text"
    );

    const backgrounds = {
        Clear: "https://images.unsplash.com/photo-1501973801540-537f08ccae7b",
        Clouds: "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31",
        Rain: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
        Thunderstorm: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
        Snow: "https://images.unsplash.com/photo-1608889175766-6f7c61c2b3a1"
    };

    document.body.style.backgroundImage =
        `url(${backgrounds[condition] || backgrounds.Clear})`;

    const isLightMode = document.body.classList.contains("light-mode");

    if (!isLightMode) {

        if (condition === "Clear" || condition === "Snow") {
            container.classList.add("dark-glass", "dark-text");
        }
        else if (condition === "Rain" || condition === "Thunderstorm") {
            container.classList.add("light-glass", "light-text");
        }
        else {
            container.classList.add("dark-glass", "light-text");
        }
    }

    if (condition === "Rain") document.body.classList.add("rain");
    if (condition === "Snow") document.body.classList.add("snow");
    if (condition === "Thunderstorm") {
        document.body.classList.add("rain");
        startLightning();
    }
}

/* ===============================
   LIGHTNING EFFECT
================================= */
function startLightning() {
    stopLightning();

    const flash = document.createElement("div");
    flash.classList.add("lightning-flash");
    document.body.appendChild(flash);

    lightningInterval = setInterval(() => {
        flash.style.opacity = "0.8";
        setTimeout(() => flash.style.opacity = "0", 120);
    }, Math.random() * 4000 + 3000);
}

function stopLightning() {
    clearInterval(lightningInterval);
    const existing = document.querySelector(".lightning-flash");
    if (existing) existing.remove();
}

/* ===============================
   SEARCH HISTORY (48H AUTO DELETE)
================================= */
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    const now = Date.now();

    history = history.filter(item => now - item.timestamp < HISTORY_EXPIRY);

    const exists = history.find(
        item => item.city.toLowerCase() === city.toLowerCase()
    );

    if (!exists) {
        history.push({ city, timestamp: now });
        localStorage.setItem("weatherHistory", JSON.stringify(history));
        displayHistory();
    }
}

function displayHistory() {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    const now = Date.now();

    history = history.filter(item => now - item.timestamp < HISTORY_EXPIRY);
    localStorage.setItem("weatherHistory", JSON.stringify(history));

    historyList.innerHTML = "";

    history.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.city;
        li.onclick = () => getWeatherByCity(item.city);
        historyList.appendChild(li);
    });
}

/* ===============================
   THEME SYSTEM
================================= */
function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light-mode");
        themeToggle.checked = true;
    } else {
        document.body.classList.remove("light-mode");
        themeToggle.checked = false;
    }
}

function detectSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
}

function initTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(detectSystemTheme());
    }
}

themeToggle.addEventListener("change", () => {
    const selectedTheme = themeToggle.checked ? "light" : "dark";
    applyTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
});

window.matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", e => {
        if (!localStorage.getItem("theme")) {
            applyTheme(e.matches ? "light" : "dark");
        }
    });
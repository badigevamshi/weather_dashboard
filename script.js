const apiKey = "65857ce633b80efc1371858def5c256e";

/* ===============================
   DOM ELEMENTS
================================= */
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const locationLabel = document.getElementById("locationLabel");
const spinner = document.getElementById("loadingSpinner");
const errorMessage = document.getElementById("errorMessage");

const heroCard = document.getElementById("heroCard");
const hourlyCard = document.getElementById("hourlyCard");
const detailsCard = document.getElementById("detailsCard");
const forecastCard = document.getElementById("forecastCard");

// Weather Effects
const rainCanvas = document.getElementById("rainCanvas");
const snowCanvas = document.getElementById("snowCanvas");
const lightningFlash = document.getElementById("lightningFlash");
const sunnyOverlay = document.getElementById("sunnyOverlay");

let rainCtx, snowCtx;
let rainDrops = [];
let snowflakes = [];
let rainAnimId = null;
let snowAnimId = null;
let lightningTimer = null;

/* ===============================
   WEATHER ICON SVGs
================================= */
const weatherIcons = {
    Clear: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="22" stroke="#F59E0B" stroke-width="4" fill="none"/>
        <line x1="50" y1="8" x2="50" y2="18" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="82" x2="50" y2="92" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="8" y1="50" x2="18" y2="50" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="82" y1="50" x2="92" y2="50" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="20.3" y1="20.3" x2="27.4" y2="27.4" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="72.6" y1="72.6" x2="79.7" y2="79.7" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="20.3" y1="79.7" x2="27.4" y2="72.6" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="72.6" y1="27.4" x2="79.7" y2="20.3" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    Clouds: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 65 C10 65 5 52 15 45 C10 30 30 20 42 28 C48 18 68 18 72 30 C85 28 95 40 85 52 C95 60 88 72 75 68 L25 65Z" stroke="#0066FF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    Rain: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 55 C10 55 5 42 15 35 C10 20 30 12 42 20 C48 10 68 10 72 22 C85 20 95 32 85 44 C92 50 88 58 78 55 L25 55Z" stroke="#0066FF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="35" y1="65" x2="30" y2="80" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="50" y1="65" x2="45" y2="80" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="65" y1="65" x2="60" y2="80" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    Snow: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 55 C10 55 5 42 15 35 C10 20 30 12 42 20 C48 10 68 10 72 22 C85 20 95 32 85 44 C92 50 88 58 78 55 L25 55Z" stroke="#0066FF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="35" cy="72" r="3" fill="#60A5FA"/>
        <circle cx="50" cy="68" r="3" fill="#60A5FA"/>
        <circle cx="65" cy="75" r="3" fill="#60A5FA"/>
        <circle cx="42" cy="82" r="3" fill="#60A5FA"/>
        <circle cx="58" cy="85" r="3" fill="#60A5FA"/>
    </svg>`,
    Thunderstorm: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 50 C10 50 5 37 15 30 C10 15 30 7 42 15 C48 5 68 5 72 17 C85 15 95 27 85 39 C92 45 88 53 78 50 L25 50Z" stroke="#0066FF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="48,56 42,72 52,72 46,90" stroke="#F59E0B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    Drizzle: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 55 C10 55 5 42 15 35 C10 20 30 12 42 20 C48 10 68 10 72 22 C85 20 95 32 85 44 C92 50 88 58 78 55 L25 55Z" stroke="#0066FF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="40" y1="65" x2="38" y2="73" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
        <line x1="55" y1="65" x2="53" y2="73" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    Mist: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="15" y1="35" x2="85" y2="35" stroke="#A0AEC0" stroke-width="3" stroke-linecap="round"/>
        <line x1="25" y1="50" x2="75" y2="50" stroke="#A0AEC0" stroke-width="3" stroke-linecap="round"/>
        <line x1="20" y1="65" x2="80" y2="65" stroke="#A0AEC0" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    Haze: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="15" y1="35" x2="85" y2="35" stroke="#A0AEC0" stroke-width="3" stroke-linecap="round"/>
        <line x1="25" y1="50" x2="75" y2="50" stroke="#A0AEC0" stroke-width="3" stroke-linecap="round"/>
        <line x1="20" y1="65" x2="80" y2="65" stroke="#A0AEC0" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    PartlyCloudy: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="38" cy="35" r="14" stroke="#F59E0B" stroke-width="3" fill="none"/>
        <line x1="38" y1="12" x2="38" y2="17" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
        <line x1="38" y1="53" x2="38" y2="56" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
        <line x1="16" y1="35" x2="20" y2="35" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
        <line x1="56" y1="35" x2="60" y2="35" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
        <path d="M35 70 C22 70 18 60 26 55 C24 44 38 38 48 44 C52 36 66 36 70 45 C80 43 88 52 80 60 C86 65 82 72 74 70 L35 70Z" stroke="#0066FF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
};

function getWeatherIcon(condition, description) {
    if (condition === "Clouds" && description && description.toLowerCase().includes("few")) {
        return weatherIcons.PartlyCloudy;
    }
    return weatherIcons[condition] || weatherIcons.Clouds;
}

/* ===============================
   DETAIL ITEM SVG ICONS
================================= */
const detailIcons = {
    humidity: `<svg viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
    wind: `<svg viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`,
    pressure: `<svg viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    visibility: `<svg viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    sunrise: `<svg viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>`,
    sunset: `<svg viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="16 6 12 10 8 6"/></svg>`,
    uv: `<svg viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
};

/* ===============================
   INIT ON LOAD
================================= */
window.addEventListener("load", () => {
    initCanvases();

    if (!navigator.geolocation) {
        locationLabel.textContent = "Location unavailable";
        getWeatherByCity("New York");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            getWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        error => {
            locationLabel.textContent = "Location denied";
            getWeatherByCity("New York");
        },
        { timeout: 8000, enableHighAccuracy: false }
    );
});

/* ===============================
   SEARCH EVENTS
================================= */
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) return;
    getWeatherByCity(city);
});

cityInput.addEventListener("keypress", e => {
    if (e.key === "Enter") searchBtn.click();
});

/* ===============================
   FETCH WEATHER
================================= */
async function fetchWeather(weatherURL, forecastURL) {
    clearAllEffects(); // Clear immediately
    spinner.classList.remove("hidden");
    hideCards();
    errorMessage.classList.add("hidden");

    try {
        const weatherRes = await fetch(weatherURL);
        const weatherData = await weatherRes.json();
        if (!weatherRes.ok) throw new Error(weatherData.message || "City not found");

        const forecastRes = await fetch(forecastURL);
        const forecastData = await forecastRes.json();

        renderCurrentWeather(weatherData);
        renderWeatherDetails(weatherData);
        renderHourlyForecast(forecastData);
        renderForecast(forecastData);

        // Apply weather effects
        applyWeatherEffects(weatherData.weather[0].main);

        locationLabel.textContent = weatherData.name;

    } catch (error) {
        clearAllEffects(); // Ensure clear on error too
        errorMessage.textContent = `⚠ ${error.message}`;
        errorMessage.classList.remove("hidden");
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

function hideCards() {
    [heroCard, hourlyCard, detailsCard, forecastCard].forEach(card => {
        card.classList.add("hidden");
        card.classList.remove("show");
    });
}

function showCard(card, delay) {
    setTimeout(() => {
        card.classList.remove("hidden");
        card.classList.add("show");
    }, delay);
}

/* ===============================
   FORMAT DATE
================================= */
function formatDate(timestamp, tzOffset) {
    const utcMs = (timestamp + tzOffset) * 1000;
    const date = new Date(utcMs);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(timestamp, tzOffset) {
    const utcMs = (timestamp + tzOffset) * 1000;
    const date = new Date(utcMs);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return `${h}:${m} ${ampm}`;
}

/* ===============================
   RENDER CURRENT WEATHER (Hero Card)
================================= */
function renderCurrentWeather(data) {
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const high = Math.round(data.main.temp_max);
    const low = Math.round(data.main.temp_min);
    const condition = data.weather[0].main;
    const description = data.weather[0].description;
    const capitalizedDesc = description.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const icon = getWeatherIcon(condition, description);
    const tz = data.timezone || 0;

    heroCard.innerHTML = `
        <div class="hero-left">
            <h2 class="hero-city">${data.name}</h2>
            <p class="hero-date">${formatDate(data.dt, tz)}</p>
            <div class="hero-temp-row">
                <span class="hero-temp">${temp}°</span>
                <span class="hero-temp-unit">C</span>
            </div>
            <p class="hero-condition">${capitalizedDesc}</p>
            <p class="hero-feels-like">Feels like ${feelsLike}°C</p>
        </div>
        <div class="hero-right">
            <div class="hero-icon-container">${icon}</div>
            <div class="hero-highlow">
                <div class="highlow-item">
                    <span class="highlow-label">High</span>
                    <span class="highlow-value">${high}°</span>
                </div>
                <div class="highlow-divider"></div>
                <div class="highlow-item">
                    <span class="highlow-label">Low</span>
                    <span class="highlow-value">${low}°</span>
                </div>
            </div>
        </div>
    `;

    showCard(heroCard, 100);
}

/* ===============================
   RENDER WEATHER DETAILS
================================= */
function renderWeatherDetails(data) {
    const tz = data.timezone || 0;
    const sunrise = formatTime(data.sys.sunrise, tz);
    const sunset = formatTime(data.sys.sunset, tz);
    const visibility = data.visibility ? (data.visibility / 1000).toFixed(0) : 'N/A';

    const details = [
        { icon: detailIcons.humidity, label: "Humidity", value: `${data.main.humidity}%` },
        { icon: detailIcons.wind, label: "Wind Speed", value: `${data.wind.speed} km/h` },
        { icon: detailIcons.pressure, label: "Pressure", value: `${data.main.pressure} hPa` },
        { icon: detailIcons.visibility, label: "Visibility", value: `${visibility} km` },
        { icon: detailIcons.sunrise, label: "Sunrise", value: sunrise },
        { icon: detailIcons.sunset, label: "Sunset", value: sunset },
        { icon: detailIcons.uv, label: "UV Index", value: "6", sub: "High" }
    ];

    const grid = document.getElementById("detailsGrid");
    grid.innerHTML = details.map(d => `
        <div class="detail-item">
            <div class="detail-icon">${d.icon}</div>
            <span class="detail-label">${d.label}</span>
            <span class="detail-value">${d.value}</span>
            ${d.sub ? `<span class="detail-sub">${d.sub}</span>` : ''}
        </div>
    `).join('');

    showCard(detailsCard, 300);
}

/* ===============================
   RENDER HOURLY FORECAST
================================= */
function renderHourlyForecast(data) {
    if (!data.list) return;

    const hourlyData = data.list.slice(0, 8);
    const temps = hourlyData.map(h => Math.round(h.main.temp));

    drawHourlyChart(hourlyData, temps);

    const grid = document.getElementById("hourlyGrid");
    grid.innerHTML = hourlyData.map(h => {
        const time = new Date(h.dt * 1000);
        const hour = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        const temp = Math.round(h.main.temp);
        const desc = h.weather[0].description;
        const capitalizedDesc = desc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        return `
            <div class="hourly-item">
                <span class="hourly-time">${hour}</span>
                <span class="hourly-temp">${temp}°</span>
                <span class="hourly-condition">${capitalizedDesc}</span>
            </div>
        `;
    }).join('');

    showCard(hourlyCard, 200);
}

function drawHourlyChart(hourlyData, temps) {
    const canvas = document.getElementById("hourlyChart");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 760;
    const height = 200;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const minTemp = Math.min(...temps) - 3;
    const maxTemp = Math.max(...temps) + 3;
    const tempRange = maxTemp - minTemp || 1;

    ctx.clearRect(0, 0, width, height);

    // Check if dark theme
    const isDark = document.body.classList.contains('weather-rain') ||
        document.body.classList.contains('weather-thunderstorm') ||
        document.body.classList.contains('weather-drizzle');
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0';
    const labelColor = isDark ? 'rgba(255,255,255,0.5)' : '#A0AEC0';
    const lineColor = isDark ? '#80CBC4' : '#0066FF';

    // Grid lines
    const gridLines = 5;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= gridLines; i++) {
        const y = paddingTop + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // Y-axis labels
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
        const y = paddingTop + (chartHeight / gridLines) * i;
        const tempVal = Math.round(maxTemp - (tempRange / gridLines) * i);
        ctx.fillText(`${tempVal}`, paddingLeft - 8, y + 4);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    const stepX = chartWidth / (temps.length - 1);
    hourlyData.forEach((h, i) => {
        const x = paddingLeft + stepX * i;
        const time = new Date(h.dt * 1000);
        const label = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        ctx.fillText(label, x, height - 8);
    });

    // Line
    const points = temps.map((t, i) => ({
        x: paddingLeft + stepX * i,
        y: paddingTop + chartHeight - ((t - minTemp) / tempRange) * chartHeight
    }));

    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Dots
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#37474F' : '#FFFFFF';
        ctx.fill();
    });

    // Y unit
    ctx.save();
    ctx.fillStyle = labelColor;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.translate(12, paddingTop + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('°C', 0, 0);
    ctx.restore();
}

/* ===============================
   RENDER 7-DAY FORECAST
================================= */
function renderForecast(data) {
    if (!data.list) return;

    const dailyMap = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyMap[date]) {
            dailyMap[date] = { temps: [], conditions: [], pops: [], item: item };
        }
        dailyMap[date].temps.push(item.main.temp);
        dailyMap[date].conditions.push(item.weather[0].main);
        dailyMap[date].pops.push(item.pop || 0);
    });

    const days = Object.keys(dailyMap).slice(0, 7);

    let globalMin = Infinity, globalMax = -Infinity;
    days.forEach(d => {
        globalMin = Math.min(globalMin, ...dailyMap[d].temps);
        globalMax = Math.max(globalMax, ...dailyMap[d].temps);
    });
    const globalRange = globalMax - globalMin || 1;

    const forecastList = document.getElementById("forecastList");
    forecastList.innerHTML = days.map(dateStr => {
        const dayData = dailyMap[dateStr];
        const date = new Date(dateStr + "T12:00:00");
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const low = Math.round(Math.min(...dayData.temps));
        const high = Math.round(Math.max(...dayData.temps));
        const avgPop = Math.round(Math.max(...dayData.pops) * 100);

        const conditionCounts = {};
        dayData.conditions.forEach(c => { conditionCounts[c] = (conditionCounts[c] || 0) + 1; });
        const mainCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0][0];

        const barLeft = ((Math.min(...dayData.temps) - globalMin) / globalRange) * 100;
        const barWidth = ((Math.max(...dayData.temps) - Math.min(...dayData.temps)) / globalRange) * 100;
        const iconSvg = weatherIcons[mainCondition] || weatherIcons.Clouds;

        return `
            <div class="forecast-row">
                <span class="forecast-day">${dayName}</span>
                <div class="forecast-condition">
                    <div style="width:24px;height:24px;">${iconSvg}</div>
                    <span>${mainCondition}</span>
                </div>
                <div class="forecast-precip">
                    <svg viewBox="0 0 24 24" fill="#0066FF" stroke="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                    <span>${avgPop}%</span>
                </div>
                <span class="forecast-low">${low}°</span>
                <div class="forecast-bar-container">
                    <div class="forecast-bar" style="left: ${barLeft}%; width: ${Math.max(barWidth, 8)}%;"></div>
                </div>
                <span class="forecast-high">${high}°</span>
            </div>
        `;
    }).join('');

    showCard(forecastCard, 400);
}

/* ===============================================================
   WEATHER EFFECTS ENGINE
   - Rain drops (canvas animation)
   - Snow flakes (canvas animation)
   - Lightning flashes (periodic DOM opacity)
   - Sunny glow (CSS animation, toggled via class)
================================================================ */

function initCanvases() {
    rainCtx = rainCanvas.getContext("2d");
    snowCtx = snowCanvas.getContext("2d");
    resizeCanvases();
    window.addEventListener("resize", resizeCanvases);
}

function resizeCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    rainCanvas.width = w;
    rainCanvas.height = h;
    snowCanvas.width = w;
    snowCanvas.height = h;
}

function clearAllEffects() {
    // Stop animations
    if (rainAnimId) { cancelAnimationFrame(rainAnimId); rainAnimId = null; }
    if (snowAnimId) { cancelAnimationFrame(snowAnimId); snowAnimId = null; }
    if (lightningTimer) { clearInterval(lightningTimer); lightningTimer = null; }

    // Hide effect elements
    rainCanvas.classList.add("hidden");
    snowCanvas.classList.add("hidden");
    lightningFlash.classList.add("hidden");
    sunnyOverlay.classList.add("hidden");
    lightningFlash.style.opacity = "0";

    // Clear canvases
    rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

    // Reset body theme classes
    document.body.className = '';
    rainDrops = [];
    snowflakes = [];
}

function applyWeatherEffects(condition) {
    clearAllEffects();

    const c = condition.toLowerCase();

    switch (c) {
        case 'clear':
            document.body.classList.add('weather-clear');
            sunnyOverlay.classList.remove("hidden");
            break;

        case 'clouds':
            document.body.classList.add('weather-clouds');
            break;

        case 'rain':
            document.body.classList.add('weather-rain');
            startRain(120, 8);
            break;

        case 'drizzle':
            document.body.classList.add('weather-drizzle');
            startRain(50, 5);
            break;

        case 'thunderstorm':
            document.body.classList.add('weather-thunderstorm');
            startRain(180, 10);
            startLightning();
            break;

        case 'snow':
            document.body.classList.add('weather-snow');
            startSnow(300);
            break;

        case 'mist':
        case 'smoke':
        case 'haze':
        case 'dust':
        case 'fog':
        case 'sand':
        case 'ash':
        case 'squall':
        case 'tornado':
            document.body.classList.add('weather-mist');
            break;

        default:
            document.body.classList.add('weather-clouds');
            break;
    }
}

/* ===============================
   RAIN EFFECT
================================= */
function startRain(dropCount, speed) {
    rainCanvas.classList.remove("hidden");
    const w = rainCanvas.width;
    const h = rainCanvas.height;

    rainDrops = Array.from({ length: dropCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        length: Math.random() * 30 + 20,
        speed: Math.random() * speed + speed,
        opacity: Math.random() * 0.5 + 0.3,
        width: Math.random() * 2 + 1
    }));

    function animateRain() {
        rainCtx.clearRect(0, 0, w, h);

        rainDrops.forEach(drop => {
            rainCtx.beginPath();
            rainCtx.moveTo(drop.x, drop.y);
            rainCtx.lineTo(drop.x - 1.5, drop.y + drop.length);
            rainCtx.strokeStyle = `rgba(200, 225, 255, ${drop.opacity})`;
            rainCtx.lineWidth = drop.width;
            rainCtx.lineCap = 'round';
            rainCtx.stroke();

            drop.y += drop.speed;
            drop.x -= 1;

            if (drop.y > h) {
                drop.y = -drop.length;
                drop.x = Math.random() * w;
            }
        });

        rainAnimId = requestAnimationFrame(animateRain);
    }

    animateRain();
}

function startSnow(flakeCount) {
    snowCanvas.classList.remove("hidden");
    const w = snowCanvas.width;
    const h = snowCanvas.height;

    snowflakes = Array.from({ length: flakeCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 4 + 1.5,
        speed: Math.random() * 1.5 + 0.5,
        wind: Math.random() * 1 - 0.5,
        opacity: Math.random() * 0.7 + 0.3
    }));

    function animateSnow() {
        snowCtx.clearRect(0, 0, w, h);

        snowflakes.forEach(flake => {
            // Main flake body
            snowCtx.beginPath();
            snowCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            snowCtx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            snowCtx.fill();

            // Premium glow layer
            snowCtx.beginPath();
            snowCtx.arc(flake.x, flake.y, flake.radius * 2.5, 0, Math.PI * 2);
            const gradient = snowCtx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.radius * 2.5);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${flake.opacity * 0.3})`);
            gradient.addColorStop(1, 'transparent');
            snowCtx.fillStyle = gradient;
            snowCtx.fill();

            flake.y += flake.speed;
            flake.x += flake.wind + Math.sin(flake.y * 0.01) * 0.5;

            if (flake.y > h) {
                flake.y = -flake.radius * 2;
                flake.x = Math.random() * w;
            }
            if (flake.x > w) flake.x = 0;
            if (flake.x < 0) flake.x = w;
        });

        snowAnimId = requestAnimationFrame(animateSnow);
    }

    animateSnow();
}

/* ===============================
   LIGHTNING EFFECT
================================= */
function startLightning() {
    lightningFlash.classList.remove("hidden");

    function flash() {
        // Double flash pattern
        lightningFlash.style.opacity = "0.9";
        setTimeout(() => {
            lightningFlash.style.opacity = "0";
            setTimeout(() => {
                lightningFlash.style.opacity = "0.6";
                setTimeout(() => {
                    lightningFlash.style.opacity = "0";
                }, 100);
            }, 120);
        }, 80);
    }

    // Random intervals between 3-8 seconds
    lightningTimer = setInterval(() => {
        flash();
    }, Math.random() * 5000 + 3000);

    // Initial flash after 2 seconds
    setTimeout(flash, 2000);
}
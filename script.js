const details = document.getElementById("Details");
const form = document.getElementById("form");
const input = document.getElementById("cityInput");
const searchButton = document.getElementById("btn");
const locationButton = document.getElementById("geotag");

const weatherDescriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with light hail",
    99: "Thunderstorm with heavy hail"
};

function showMessage(message, isError = false) {
    details.classList.toggle("error", isError);
    details.innerHTML = `<p role="status">${message}</p>`;
}

function displayWeather(place, weather) {
    const current = weather.current;
    const units = weather.current_units;
    details.classList.remove("error");
    details.innerHTML = `
        <h2>${place}</h2>
        <p class="condition">${weatherDescriptions[current.weather_code] || "Current conditions"}</p>
        <p><strong>${Math.round(current.temperature_2m)}${units.temperature_2m}</strong></p>
        <p>Feels like ${Math.round(current.apparent_temperature)}${units.apparent_temperature}</p>
        <p>Humidity: ${current.relative_humidity_2m}${units.relative_humidity_2m}</p>
        <p>Wind: ${Math.round(current.wind_speed_10m)} ${units.wind_speed_10m}</p>
    `;
}

async function getWeather(latitude, longitude, place) {
    const params = new URLSearchParams({
        latitude,
        longitude,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
        timezone: "auto"
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) throw new Error("Weather data is unavailable right now.");
    displayWeather(place, await response.json());
}

async function searchCity(city) {
    const params = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
    if (!response.ok) throw new Error("Could not search for that city.");
    const data = await response.json();
    if (!data.results?.length) throw new Error("City not found. Check the spelling and try again.");
    const place = data.results[0];
    const label = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
    await getWeather(place.latitude, place.longitude, label);
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = input.value.trim();
    if (!city) {
        showMessage("Enter a city name to get the weather.", true);
        input.focus();
        return;
    }
    searchButton.disabled = true;
    showMessage("Finding current weather…");
    try {
        await searchCity(city);
    } catch (error) {
        showMessage(error.message || "Something went wrong. Please try again.", true);
    } finally {
        searchButton.disabled = false;
    }
});

locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        showMessage("Location is not supported by this browser.", true);
        return;
    }
    locationButton.disabled = true;
    showMessage("Getting your location…");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
            await getWeather(coords.latitude, coords.longitude, "Your location");
        } catch (error) {
            showMessage(error.message || "Could not get weather for your location.", true);
        } finally {
            locationButton.disabled = false;
        }
    }, (error) => {
        const message = error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. You can search for a city instead."
            : "Could not get your location. You can search for a city instead.";
        showMessage(message, true);
        locationButton.disabled = false;
    }, { timeout: 10000 });
});


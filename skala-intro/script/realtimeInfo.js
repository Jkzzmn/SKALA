import { cityCoordinates, fetchWeatherData } from "./weatherAPI.js";

const citySelect = document.getElementById("citySelect");
const cityResult = document.getElementById("cityResult");
const weatherResult = document.getElementById("weatherResult");

citySelect.addEventListener("change", async function() {
    const selectedCityKey = citySelect.value;

    if (selectedCityKey === "") {
        cityResult.innerHTML = "<p>도시를 선택하면 좌표가 여기에 표시됩니다.</p>";
        weatherResult.innerHTML = "";
        return;
    }

    const cityData = cityCoordinates[selectedCityKey];

    cityResult.innerHTML =
        "<div class='city-box'>" +
            "<h3>📍 " + cityData.name + " (" + selectedCityKey + ")</h3>" +
            "<p>🧭 위도 (Latitude): " + cityData.lat + "</p>" +
            "<p>🧭 경도 (Longitude): " + cityData.lon + "</p>" +
        "</div>";

    weatherResult.innerHTML = `
        <div class="loading-text" style="margin-top: 15px;">
            실시간 날씨 로딩 중... ⏳
        </div>
    `;

    try {
        const { temp, humidity } = await fetchWeatherData(cityData.lat, cityData.lon);
        weatherResult.innerHTML = `
            <div class="weather-result-box">
                <p class="weather-header">
                    <span class="emoji">🌏</span> <strong>${cityData.name} 실시간 날씨</strong>
                </p>
                <p class="weather-item">
                    <span class="emoji">🌡️</span> 현재 기온: <strong>${temp}°C</strong>
                </p>
                <p class="weather-item">
                    <span class="emoji">💧</span> 현재 습도: <strong>${humidity}%</strong>
                </p>
            </div>
        `;

    } catch (error) {
        console.error(error);
        weatherResult.innerHTML = `
            <div class="weather-result-box">
                <p>⚠️ 날씨 데이터를 불러오지 못했습니다.</p>
            </div>
        `;
    }
});
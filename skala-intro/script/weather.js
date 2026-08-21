const cityCoordinates = {
    Seoul: { name: "서울", lat: 37.5665, lon: 126.9780 },
    Tokyo: { name: "도쿄", lat: 35.6762, lon: 139.6503 },
    Madrid: { name: "마드리드", lat: 40.4168, lon: -3.7038 },
    Monterrey: { name: "몬테레이", lat: 25.6866, lon: -100.3161 }, // 멕시코 몬테레이(Monterrey) 인근 기준
    LA: { name: "로스앤젤레스", lat: 34.0522, lon: -118.2437 }
};

const citySelect = document.getElementById("citySelect");
const cityResult = document.getElementById("cityResult");



citySelect.addEventListener("change",async function(){
    const selectedCityKey = citySelect.value;

    if (selectedCityKey === "") {
        cityResult.innerHTML = "<p>도시를 선택하면 좌표가 여기에 표시됩니다.</p>";
        return;
    }
    const cityData = cityCoordinates[selectedCityKey];
    cityResult.innerHTML =
        "<div class='city-box'>"+
        "<h3>📍 "+ cityData.name + " (" + selectedCityKey + ")</h3>" +
        "<p>🧭 위도 (Latitude): " + cityData.lat + "</p>" +
        "<p>🧭 경도 (Longitude): " + cityData.lon + "</p>";
        +"</div>"
    
    weatherResult.innerHTML = `
        <div class="loading-text" style="margin-top: 15px;">
            실시간 날씨 로딩 중... ⏳
        </div>
    `;
    try {
        const url = "https://api.open-meteo.com/v1/forecast"
                  + "?latitude=" + cityData.lat 
                  + "&longitude=" + cityData.lon 
                  + "&current=temperature_2m,relative_humidity_2m";

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
        }

        const weatherData = await response.json();
        
        const temp = weatherData.current.temperature_2m;
        const humidity = weatherData.current.relative_humidity_2m;

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
})
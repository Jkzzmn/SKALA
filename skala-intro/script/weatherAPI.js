export const cityCoordinates = {
    Seoul: { name: "대한민국 서울 KR", lat: 37.5665, lon: 126.9780 },
    Tokyo: { name: "일본 도쿄 JP", lat: 35.6762, lon: 139.6503 },
    Madrid: { name: "스페인 마드리드 ES", lat: 40.4168, lon: -3.7038 },
    Monterrey: { name: "멕시코 몬테레이 MX", lat: 25.6866, lon: -100.3161 }, 
    LA: { name: "미국 로스앤젤레스 US", lat: 34.0522, lon: -118.2437 }
};

export async function fetchWeatherData(lat, lon) {
    const url = "https://api.open-meteo.com/v1/forecast"
              + "?latitude=" + lat 
              + "&longitude=" + lon 
              + "&current=temperature_2m,relative_humidity_2m";

    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
    }

    const weatherData = await response.json();

    return {
        temp: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m
    };
}
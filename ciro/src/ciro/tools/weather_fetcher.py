"""
Weather Fetcher Tool — Fetches current weather data from Open-Meteo API.

Uses the free Open-Meteo API (no API key required) to get weather
conditions for a given location. This data feeds into the corroboration
engine to verify flood/heatwave/storm reports.
"""

import json
import urllib.request
import urllib.error
from crewai.tools import tool


@tool("weather_fetcher")
def weather_fetcher(latitude: float, longitude: float) -> str:
    """
    Fetches current weather data for a given GPS location using the
    free Open-Meteo API. Returns temperature, precipitation, wind speed,
    and weather condition codes as a JSON string.

    Use this tool when you need to verify weather conditions at a
    specific location to corroborate a crisis report.
    """
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={latitude}&longitude={longitude}"
            f"&current=temperature_2m,relative_humidity_2m,"
            f"precipitation,rain,weather_code,wind_speed_10m"
            f"&timezone=Asia/Karachi"
        )

        req = urllib.request.Request(url, headers={"User-Agent": "CIRO/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())

        current = data.get("current", {})

        # Interpret weather code for crisis relevance
        weather_code = current.get("weather_code", 0)
        precipitation = current.get("precipitation", 0)
        temperature = current.get("temperature_2m", 0)
        rain = current.get("rain", 0)

        # Weather severity assessment
        weather_severity = "normal"
        weather_notes = []

        if precipitation > 10 or rain > 10:
            weather_severity = "heavy_rain"
            weather_notes.append(f"Heavy precipitation: {precipitation}mm")
        elif precipitation > 2 or rain > 2:
            weather_severity = "moderate_rain"
            weather_notes.append(f"Moderate precipitation: {precipitation}mm")

        if temperature > 42:
            weather_severity = "extreme_heat"
            weather_notes.append(f"Extreme temperature: {temperature}°C")
        elif temperature > 38:
            if weather_severity == "normal":
                weather_severity = "high_heat"
            weather_notes.append(f"High temperature: {temperature}°C")

        if current.get("wind_speed_10m", 0) > 50:
            weather_notes.append(f"High winds: {current['wind_speed_10m']} km/h")

        result = {
            "temperature_celsius": temperature,
            "precipitation_mm": precipitation,
            "rain_mm": rain,
            "humidity_percent": current.get("relative_humidity_2m", 0),
            "wind_speed_kmh": current.get("wind_speed_10m", 0),
            "weather_code": weather_code,
            "weather_severity": weather_severity,
            "weather_notes": weather_notes,
            "supports_flood_report": precipitation > 5 or rain > 5,
            "supports_heatwave_report": temperature > 40,
            "data_available": True,
        }

        return json.dumps(result)

    except (urllib.error.URLError, urllib.error.HTTPError, Exception) as e:
        # Graceful degradation — return neutral data if API fails
        return json.dumps({
            "data_available": False,
            "error": str(e),
            "weather_severity": "unknown",
            "supports_flood_report": False,
            "supports_heatwave_report": False,
            "note": "Weather API unavailable. Corroboration will proceed without weather data.",
        })

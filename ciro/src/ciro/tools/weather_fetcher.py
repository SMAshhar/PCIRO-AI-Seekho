"""Weather Fetcher Tool — resilient Open‑Meteo client with validation.

This module queries Open‑Meteo (no API key required) and returns a
validated, normalized JSON structure used by the corroboration engine.
The implementation adds retry/backoff and Pydantic validation to make
the data more robust for downstream scoring.
"""

from typing import Any
import json
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from pydantic import BaseModel, Field, ValidationError
from crewai.tools import tool


class WeatherResult(BaseModel):
    temperature_celsius: float = Field(0.0)
    precipitation_mm: float = Field(0.0)
    rain_mm: float = Field(0.0)
    humidity_percent: float = Field(0.0)
    wind_speed_kmh: float = Field(0.0)
    weather_code: int = Field(0)
    weather_severity: str = Field("unknown")
    weather_notes: list[str] = Field(default_factory=list)
    supports_flood_report: bool = Field(False)
    supports_heatwave_report: bool = Field(False)
    data_available: bool = Field(False)


def _build_session(retries: int = 3, backoff: float = 0.5) -> requests.Session:
    s = requests.Session()
    retry = Retry(total=retries, backoff_factor=backoff, status_forcelist=(429, 500, 502, 503, 504))
    adapter = HTTPAdapter(max_retries=retry)
    s.mount("https://", adapter)
    s.mount("http://", adapter)
    s.headers.update({"User-Agent": "CIRO-WeatherFetcher/1.0"})
    return s


def _interpret_current(current: dict[str, Any]) -> WeatherResult:
    # Attempt to extract commonly returned fields; fall back to 0/defaults
    temperature = current.get("temperature_2m") or current.get("temperature") or current.get("temp") or 0.0
    precipitation = current.get("precipitation") or current.get("precipitation_mm") or 0.0
    rain = current.get("rain") or 0.0
    humidity = current.get("relative_humidity_2m") or current.get("humidity") or 0.0
    wind = current.get("wind_speed_10m") or current.get("wind_speed_kmh") or current.get("wind_speed") or 0.0
    weather_code = current.get("weather_code") or current.get("weathercode") or 0

    notes: list[str] = []
    severity = "normal"

    if precipitation and (precipitation > 10 or rain > 10):
        severity = "heavy_rain"
        notes.append(f"Heavy precipitation: {precipitation}mm")
    elif precipitation and (precipitation > 2 or rain > 2):
        severity = "moderate_rain"
        notes.append(f"Moderate precipitation: {precipitation}mm")

    if temperature and temperature > 42:
        severity = "extreme_heat"
        notes.append(f"Extreme temperature: {temperature}°C")
    elif temperature and temperature > 38:
        if severity == "normal":
            severity = "high_heat"
        notes.append(f"High temperature: {temperature}°C")

    if wind and wind > 50:
        notes.append(f"High winds: {wind} km/h")

    return WeatherResult(
        temperature_celsius=float(temperature),
        precipitation_mm=float(precipitation),
        rain_mm=float(rain),
        humidity_percent=float(humidity),
        wind_speed_kmh=float(wind),
        weather_code=int(weather_code),
        weather_severity=severity,
        weather_notes=notes,
        supports_flood_report=(float(precipitation) > 5 or float(rain) > 5),
        supports_heatwave_report=(float(temperature) > 40),
        data_available=True,
    )


@tool("weather_fetcher")
def weather_fetcher(latitude: float, longitude: float) -> str:
    """Query Open‑Meteo and return a validated, normalized JSON string.

    This function is resilient (retries) and returns a consistent output
    shape whether or not the external API responds successfully.
    """
    session = _build_session()
    try:
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={latitude}&longitude={longitude}"
            "&current_weather=true"
            "&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,weathercode,wind_speed_10m"
            "&timezone=Asia%2FKarachi"
        )

        resp = session.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        # Open-Meteo may provide 'current_weather' or a 'current' wrapper
        current = data.get("current") or data.get("current_weather") or {}

        # If the API returned hourly fields only, attempt to infer latest values
        if not current and "hourly" in data:
            # get the last index values from hourly arrays
            hourly = data["hourly"]
            # attempt to take the last timestep present
            try:
                last_idx = len(next(iter(hourly.values()))) - 1
                current = {}
                for k, v in hourly.items():
                    try:
                        current[k] = v[last_idx]
                    except Exception:
                        continue
            except Exception:
                current = {}

        result = _interpret_current(current)
        return result.json()

    except (requests.RequestException, ValidationError, Exception) as e:
        fallback = WeatherResult(data_available=False, weather_severity="unknown")
        fallback_dict = fallback.dict()
        fallback_dict.update({"error": str(e), "note": "Weather API unavailable. Corroboration will proceed without weather data."})
        return json.dumps(fallback_dict)

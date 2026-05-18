import json
import unittest
from unittest.mock import MagicMock, patch

from ciro.tools.weather_fetcher import weather_fetcher
from ciro.tools.corroboration_engine import corroboration_engine


class OpenMeteoIntegrationTest(unittest.TestCase):
    @patch("ciro.tools.weather_fetcher.requests.Session")
    def test_weather_fetcher_parses_open_meteo_response(self, mock_session_class):
        session = MagicMock()
        mock_session_class.return_value = session

        response = MagicMock()
        response.raise_for_status.return_value = None
        response.json.return_value = {
            "latitude": 33.6844,
            "longitude": 73.0479,
            "generationtime_ms": 0.123,
            "utc_offset_seconds": 18000,
            "timezone": "Asia/Karachi",
            "timezone_abbreviation": "PKT",
            "elevation": 500.0,
            "current_weather": {
                "temperature": 41.2,
                "windspeed": 12.0,
                "winddirection": 90,
                "weathercode": 3,
                "time": "2026-05-18T13:00"
            },
            "hourly": {
                "time": ["2026-05-18T12:00", "2026-05-18T13:00"],
                "temperature_2m": [39.0, 41.2],
                "relative_humidity_2m": [20, 18],
                "precipitation": [0.0, 0.0],
                "rain": [0.0, 0.0],
                "weathercode": [3, 3],
                "wind_speed_10m": [10.0, 12.0],
            },
        }
        session.get.return_value = response

        output = weather_fetcher.func(33.6844, 73.0479)
        result = json.loads(output)

        self.assertTrue(result["data_available"])
        self.assertEqual(result["temperature_celsius"], 41.2)
        self.assertEqual(result["weather_code"], 3)
        self.assertEqual(result["weather_severity"], "high_heat")
        self.assertFalse(result["supports_flood_report"])

    def test_corroboration_engine_consumes_open_meteo_output(self):
        weather_output = json.dumps({
            "data_available": True,
            "temperature_celsius": 21.5,
            "precipitation_mm": 14.7,
            "rain_mm": 14.7,
            "humidity_percent": 88.0,
            "wind_speed_kmh": 8.0,
            "weather_code": 61,
            "weather_severity": "heavy_rain",
            "supports_flood_report": True,
            "supports_heatwave_report": False,
        })

        result = corroboration_engine.func(
            crisis_type="flood",
            location_lat=33.6844,
            location_lon=73.0479,
            citizen_report_text="G-10 mein pani bhar gaya",
            weather_data=weather_output,
            num_similar_reports=3,
            sector="G-10",
        )
        output = json.loads(result)

        self.assertTrue(output["is_verified"])
        self.assertIn(output["severity"], ["high", "critical"])
        self.assertEqual(output["sources"][0]["source_name"], "Weather API (Open-Meteo)")


if __name__ == "__main__":
    unittest.main()

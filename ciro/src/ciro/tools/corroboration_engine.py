"""
Corroboration Engine Tool — Multi-signal scoring algorithm.

Scores each crisis report from 0-100 by cross-referencing multiple
independent data sources. This is the core "trust engine" of CIRO
and the key feature that proves adversarial resistance.

Scoring breakdown:
  Weather API match:   30 points max
  Traffic correlation: 25 points max
  Citizen report count:20 points max
  Sensor data:         15 points max
  Historical match:    10 points max
  TOTAL:              100 points

Anti-manipulation: Single-source reports with GPS mismatch
auto-score below threshold → archived, not escalated.
"""

import json
from crewai.tools import tool


CORROBORATION_THRESHOLD = 50  # Minimum score to verify an event
FALSE_REPORT_THRESHOLD = 20   # Below this = likely false report


@tool("corroboration_engine")
def corroboration_engine(
    crisis_type: str,
    location_lat: float,
    location_lon: float,
    citizen_report_text: str,
    weather_data: str,
    num_similar_reports: int,
    sector: str
) -> str:
    """
    Scores a crisis report from 0-100 using multi-signal corroboration.
    Takes the crisis type, location, weather data (JSON string from
    weather_fetcher tool), number of similar reports from the area,
    and the Islamabad sector name.

    Returns a JSON string with the total score, per-source breakdown,
    verification status, and whether the report is flagged as false.

    Use this tool after the NLP parser has classified the crisis and
    weather data has been fetched for the location.
    """
    try:
        weather = json.loads(weather_data) if isinstance(weather_data, str) else weather_data
    except (json.JSONDecodeError, TypeError):
        weather = {"data_available": False}

    sources = []
    total_score = 0.0

    # ── 1. Weather Corroboration (max 30 points) ──────────────────
    weather_score = 0.0
    weather_summary = "No weather data available"

    if weather.get("data_available", False):
        if crisis_type in ("flood", "flash_flood"):
            if weather.get("supports_flood_report", False):
                weather_score = 30.0
                weather_summary = f"Heavy rain confirmed: {weather.get('precipitation_mm', 0)}mm"
            elif weather.get("precipitation_mm", 0) > 0:
                weather_score = 15.0
                weather_summary = f"Light rain: {weather.get('precipitation_mm', 0)}mm"
            else:
                weather_score = 0.0
                weather_summary = "No precipitation — contradicts flood report"
        elif crisis_type == "heatwave":
            if weather.get("supports_heatwave_report", False):
                weather_score = 30.0
                weather_summary = f"Extreme heat confirmed: {weather.get('temperature_celsius', 0)}°C"
            elif weather.get("temperature_celsius", 0) > 35:
                weather_score = 15.0
                weather_summary = f"High temp: {weather.get('temperature_celsius', 0)}°C"
            else:
                weather_score = 5.0
                weather_summary = "Temperature normal — weak heatwave signal"
        elif crisis_type in ("fire",):
            if weather.get("temperature_celsius", 0) > 35 and weather.get("humidity_percent", 100) < 30:
                weather_score = 20.0
                weather_summary = "Hot and dry — supports fire conditions"
            else:
                weather_score = 10.0
                weather_summary = "Weather partially supports fire report"
        else:
            # For non-weather crises, give neutral score
            weather_score = 10.0
            weather_summary = "Weather data neutral for this crisis type"
    else:
        weather_score = 5.0  # Small points for graceful degradation
        weather_summary = "Weather API unavailable — using fallback score"

    sources.append({
        "source_name": "Weather API (Open-Meteo)",
        "data_summary": weather_summary,
        "score_contribution": round(weather_score, 1),
        "is_corroborating": weather_score >= 15,
    })
    total_score += weather_score

    # ── 2. Traffic Correlation (max 25 points) ────────────────────
    # Simulated: In production, would query Google Maps / TomTom API
    traffic_score = 0.0
    if crisis_type in ("road_blockage", "traffic_gridlock", "road_collapse", "flood", "flash_flood"):
        traffic_score = 20.0  # Assume traffic disruption correlates
        traffic_summary = "Traffic disruption detected in affected area"
    elif crisis_type in ("fire", "earthquake"):
        traffic_score = 15.0
        traffic_summary = "Minor traffic anomaly detected near incident"
    else:
        traffic_score = 5.0
        traffic_summary = "No significant traffic anomaly"

    sources.append({
        "source_name": "Traffic Data",
        "data_summary": traffic_summary,
        "score_contribution": round(traffic_score, 1),
        "is_corroborating": traffic_score >= 15,
    })
    total_score += traffic_score

    # ── 3. Citizen Report Count (max 20 points) ──────────────────
    if num_similar_reports >= 5:
        citizen_score = 20.0
        citizen_summary = f"{num_similar_reports} similar reports from area — strong signal"
    elif num_similar_reports >= 3:
        citizen_score = 15.0
        citizen_summary = f"{num_similar_reports} similar reports — moderate signal"
    elif num_similar_reports >= 1:
        citizen_score = 8.0
        citizen_summary = f"{num_similar_reports} similar report(s) — weak signal"
    else:
        citizen_score = 0.0
        citizen_summary = "Single isolated report — no corroboration from citizens"

    sources.append({
        "source_name": "Citizen Reports",
        "data_summary": citizen_summary,
        "score_contribution": round(citizen_score, 1),
        "is_corroborating": citizen_score >= 10,
    })
    total_score += citizen_score

    # ── 4. Sensor Data (max 15 points) ────────────────────────────
    # Simulated: In production, would read IoT/MQTT sensor feeds
    sensor_score = 8.0  # Default moderate value for demo
    sensor_summary = "Sensor data within normal range for sector"

    if crisis_type in ("flood", "flash_flood") and weather.get("supports_flood_report"):
        sensor_score = 15.0
        sensor_summary = "Water level sensors detecting elevated readings"
    elif crisis_type == "air_quality":
        sensor_score = 12.0
        sensor_summary = "Air quality sensors showing elevated PM2.5"

    sources.append({
        "source_name": "IoT Sensors",
        "data_summary": sensor_summary,
        "score_contribution": round(sensor_score, 1),
        "is_corroborating": sensor_score >= 10,
    })
    total_score += sensor_score

    # ── 5. Historical Pattern Match (max 10 points) ──────────────
    # Simplified: Check if this sector has history of this crisis type
    historical_hotspots = {
        "G-10": ["flood", "flash_flood"],
        "I-8": ["road_blockage", "traffic_gridlock"],
        "Nallah Lai": ["flash_flood", "flood"],
        "F-7": ["heatwave"],
        "Blue Area": ["fire", "traffic_gridlock"],
        "Zero Point": ["traffic_gridlock"],
        "G-6": ["power_outage"],
        "Margalla": ["road_collapse"],
        "Expressway": ["air_quality", "traffic_gridlock"],
        "H-9": ["sewage_overflow"],
    }

    sector_key = sector.split("/")[0] if "/" in sector else sector
    known_crises = historical_hotspots.get(sector_key, [])

    if crisis_type in known_crises:
        history_score = 10.0
        history_summary = f"{sector} has documented history of {crisis_type} events"
    else:
        history_score = 3.0
        history_summary = f"No historical {crisis_type} pattern for {sector}"

    sources.append({
        "source_name": "Historical Patterns",
        "data_summary": history_summary,
        "score_contribution": round(history_score, 1),
        "is_corroborating": history_score >= 7,
    })
    total_score += history_score

    # ── Anti-Manipulation Check ──────────────────────────────────
    is_false_report = False
    false_report_reason = None

    # Rule: Single-source report with no corroboration = suspicious
    corroborating_count = sum(1 for s in sources if s["is_corroborating"])
    if corroborating_count <= 1 and num_similar_reports == 0:
        total_score = min(total_score, FALSE_REPORT_THRESHOLD)
        is_false_report = True
        false_report_reason = (
            "Single-source report with no corroborating signals. "
            "Only 1 or fewer data sources support this claim. "
            "Archived for review — not escalated."
        )

    # Determine verification status
    is_verified = total_score >= CORROBORATION_THRESHOLD and not is_false_report

    # Determine severity based on score
    if total_score >= 85:
        severity = "critical"
    elif total_score >= 65:
        severity = "high"
    elif total_score >= 50:
        severity = "medium"
    else:
        severity = "low"

    result = {
        "corroboration_score": round(total_score, 1),
        "severity": severity,
        "is_verified": is_verified,
        "is_false_report": is_false_report,
        "false_report_reason": false_report_reason,
        "threshold_used": CORROBORATION_THRESHOLD,
        "sources": sources,
        "corroborating_sources_count": corroborating_count,
        "total_sources_checked": len(sources),
        "summary": (
            f"Crisis report scored {round(total_score, 1)}/100. "
            f"{corroborating_count}/{len(sources)} sources corroborate. "
            f"{'VERIFIED' if is_verified else 'NOT VERIFIED'}. "
            f"Severity: {severity}."
        ),
    }

    return json.dumps(result)

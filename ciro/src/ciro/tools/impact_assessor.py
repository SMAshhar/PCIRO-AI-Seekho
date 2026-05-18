"""
Impact Assessor Tool — Estimates zone-based impact for a verified crisis.
"""

import json
from crewai.tools import tool

SECTOR_DATA = {
    "G-10": {"population": 45000, "hospitals": ["PIMS", "Shifa"], "schools": 12, "key_roads": ["Kashmir Highway"]},
    "G-11": {"population": 38000, "hospitals": ["Al-Shifa"], "schools": 8, "key_roads": ["Khayaban-e-Iqbal"]},
    "G-6": {"population": 25000, "hospitals": ["Polyclinic"], "schools": 6, "key_roads": ["Jinnah Avenue"]},
    "G-8": {"population": 42000, "hospitals": ["G-8 Markaz Clinic"], "schools": 10, "key_roads": ["Kashmir Highway"]},
    "F-7": {"population": 20000, "hospitals": [], "schools": 5, "key_roads": ["Faisal Avenue"]},
    "I-8": {"population": 50000, "hospitals": ["Ali Medical Centre"], "schools": 14, "key_roads": ["I-8 Markaz Road"]},
    "H-9": {"population": 22000, "hospitals": [], "schools": 5, "key_roads": ["H-9 Road"]},
    "Blue Area": {"population": 5000, "hospitals": [], "schools": 0, "key_roads": ["Jinnah Avenue"]},
    "Zero Point": {"population": 2000, "hospitals": [], "schools": 0, "key_roads": ["Islamabad Expressway"]},
    "Nallah Lai": {"population": 60000, "hospitals": ["DHQ Rawalpindi"], "schools": 20, "key_roads": ["Nallah Lai Bridge"]},
    "Margalla": {"population": 8000, "hospitals": [], "schools": 2, "key_roads": ["Margalla Road"]},
    "Expressway": {"population": 3000, "hospitals": [], "schools": 0, "key_roads": ["Islamabad Expressway"]},
}

RESOURCE_MAP = {
    "flood": ["Rescue boats", "Water pumps", "Emergency shelters", "Medical teams"],
    "flash_flood": ["Rescue boats", "Evacuation buses", "Search & rescue teams"],
    "road_blockage": ["Traffic police", "Tow trucks", "Diversion signs"],
    "heatwave": ["Mobile medical units", "Water distribution", "Cooling centers"],
    "fire": ["Fire brigade", "Ambulances", "Evacuation team", "Water tankers"],
    "power_outage": ["IESCO repair crew", "Generators", "Emergency lighting"],
    "air_quality": ["Health advisory team", "Face mask distribution"],
    "road_collapse": ["Engineering team", "Barricades", "Heavy machinery"],
    "sewage_overflow": ["CDA sanitation crew", "Disinfection team"],
    "earthquake": ["Search & rescue", "Medical teams", "Structural engineers"],
}


@tool("impact_assessor")
def impact_assessor(crisis_type: str, sector: str, severity: str) -> str:
    """
    Assesses the impact of a verified crisis event on an Islamabad sector.
    Estimates affected population, infrastructure at risk, and recommends
    resources. Returns a JSON string with the full impact assessment.
    """
    sector_key = sector.split("/")[0] if "/" in sector else sector
    sector_info = SECTOR_DATA.get(sector_key, {
        "population": 10000, "hospitals": [], "schools": 3, "key_roads": ["Unknown Road"]
    })

    multiplier = {"low": 0.1, "medium": 0.3, "high": 0.6, "critical": 0.9}.get(severity, 0.2)
    affected_pop = int(sector_info["population"] * multiplier)

    infra_at_risk = []
    if sector_info["hospitals"]:
        infra_at_risk.extend([f"Hospital: {h}" for h in sector_info["hospitals"]])
    if sector_info["schools"] > 0:
        infra_at_risk.append(f"{max(1, int(sector_info['schools'] * multiplier))} schools")
    infra_at_risk.extend([f"Road: {r}" for r in sector_info["key_roads"]])

    est_response = {"low": 45, "medium": 30, "high": 20, "critical": 10}.get(severity, 30)
    resources = RESOURCE_MAP.get(crisis_type, ["General emergency response team"])

    return json.dumps({
        "crisis_type": crisis_type,
        "sector": sector,
        "severity": severity,
        "affected_sectors": [sector_key],
        "affected_population": affected_pop,
        "infrastructure_at_risk": infra_at_risk,
        "recommended_resources": resources,
        "estimated_response_time_min": est_response,
        "risk_level": severity,
        "summary": f"{crisis_type.replace('_', ' ').title()} in {sector}: ~{affected_pop:,} affected, ETA: {est_response} min.",
    })

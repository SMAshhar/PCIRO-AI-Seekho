"""
Roman Urdu Parser Tool — Extracts crisis intent and keywords from
Roman Urdu citizen reports.

This is one of CIRO's key differentiators: no other hackathon team
will have local language NLP support.
"""

import json
from crewai.tools import tool


# Roman Urdu keyword → crisis type mapping
CRISIS_KEYWORDS: dict[str, str] = {
    # Flood / Water
    "pani": "flood", "bhar": "flood", "doob": "flood",
    "baarish": "flood", "barish": "flood", "selab": "flash_flood",
    "baadh": "flash_flood", "nallah": "flash_flood",
    # Road / Traffic
    "accident": "road_blockage", "hadsa": "road_blockage",
    "traffic": "traffic_gridlock", "jam": "traffic_gridlock",
    "band": "road_blockage", "toot": "road_collapse",
    "block": "road_blockage",
    # Power
    "bijli": "power_outage", "light": "power_outage",
    "loadshedding": "power_outage", "andhera": "power_outage",
    # Fire
    "aag": "fire", "fire": "fire", "dhuaan": "fire",
    "smoke": "fire", "jalana": "fire",
    # Heat
    "garmi": "heatwave", "loo": "heatwave", "behosh": "heatwave",
    "heat": "heatwave", "tapish": "heatwave",
    # Air Quality
    "dhund": "air_quality", "smog": "air_quality",
    "pollution": "air_quality", "sans": "air_quality",
    # Sewage
    "ganda": "sewage_overflow", "naala": "sewage_overflow",
    "sewage": "sewage_overflow", "gandagi": "sewage_overflow",
    # Earthquake
    "zalzala": "earthquake", "earthquake": "earthquake",
    "kaanp": "earthquake", "hilna": "earthquake",
}

# Islamabad sector detection patterns
SECTOR_PATTERNS: list[str] = [
    "G-10", "G-11", "G-6", "G-7", "G-8", "G-9",
    "F-6", "F-7", "F-8", "F-9", "F-10", "F-11",
    "I-8", "I-9", "I-10", "I-11",
    "H-8", "H-9", "H-10", "H-11",
    "E-7", "E-8", "E-9", "E-10", "E-11",
    "Blue Area", "Zero Point", "Margalla", "Nallah Lai",
    "Expressway", "Markaz", "Faisal Mosque",
]


@tool("roman_urdu_parser")
def roman_urdu_parser(report_text: str) -> str:
    """
    Parses a citizen crisis report written in Roman Urdu (or English)
    and extracts: crisis type, keywords found, detected sector, and
    confidence score. Returns a JSON string with the parsed results.

    Use this tool when you receive raw citizen report text that needs
    to be classified into a crisis type and have its location extracted.
    """
    text_lower = report_text.lower()

    # Extract matching keywords
    found_keywords = []
    crisis_types_found: dict[str, int] = {}

    for keyword, crisis_type in CRISIS_KEYWORDS.items():
        if keyword in text_lower:
            found_keywords.append(keyword)
            crisis_types_found[crisis_type] = crisis_types_found.get(crisis_type, 0) + 1

    # Determine primary crisis type by most keyword matches
    if crisis_types_found:
        primary_crisis = max(crisis_types_found, key=crisis_types_found.get)  # type: ignore
    else:
        primary_crisis = "unknown"

    # Detect sector/location mentions
    detected_sectors = []
    for sector in SECTOR_PATTERNS:
        if sector.lower() in text_lower:
            detected_sectors.append(sector)

    # Calculate confidence based on keyword density
    keyword_count = len(found_keywords)
    if keyword_count >= 3:
        confidence = 0.9
    elif keyword_count == 2:
        confidence = 0.75
    elif keyword_count == 1:
        confidence = 0.5
    else:
        confidence = 0.2

    # Boost confidence if sector is detected
    if detected_sectors:
        confidence = min(confidence + 0.1, 1.0)

    result = {
        "parsed_intent": primary_crisis,
        "keywords": found_keywords,
        "detected_sectors": detected_sectors,
        "language_detected": "roman_urdu" if any(k in text_lower for k in ["mein", "hai", "ho", "ka", "ki", "ke", "se", "pe", "nahi"]) else "english",
        "confidence": round(confidence, 2),
        "original_text": report_text,
    }

    return json.dumps(result, ensure_ascii=False)

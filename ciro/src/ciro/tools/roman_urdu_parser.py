"""
Roman Urdu Parser Tool — Extracts crisis intent and keywords from
Roman Urdu citizen reports using Gemini 2.0 with a robust local dictionary fallback.
"""

import json
import os
import re
from crewai.tools import tool
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# Extended and more robust Roman Urdu keyword → crisis type mapping
CRISIS_KEYWORDS: dict[str, str] = {
    # Flood / Water
    "pani": "flood", "bhar": "flood", "doob": "flood", "dub": "flood",
    "baarish": "flood", "barish": "flood", "selab": "flash_flood",
    "baadh": "flash_flood", "nallah": "flash_flood", "nala": "flash_flood",
    "tughyani": "flash_flood", "water": "flood", "rain": "flood",
    "ubal": "sewage_overflow", "leakage": "sewage_overflow",

    # Road / Traffic
    "accident": "road_blockage", "hadsa": "road_blockage",
    "traffic": "traffic_gridlock", "jam": "traffic_gridlock",
    "band": "road_blockage", "toot": "road_collapse",
    "block": "road_blockage", "rukaawat": "road_blockage",
    "phas": "traffic_gridlock", "phasi": "traffic_gridlock",
    "slowdown": "traffic_gridlock",

    # Power
    "bijli": "power_outage", "light": "power_outage",
    "loadshedding": "power_outage", "andhera": "power_outage",
    "power": "power_outage", "generator": "power_outage",
    "transformer": "power_outage", "shat": "power_outage",

    # Fire
    "aag": "fire", "fire": "fire", "dhuaan": "fire",
    "smoke": "fire", "jalana": "fire", "jal": "fire",
    "shola": "fire", "blaze": "fire",

    # Heat
    "garmi": "heatwave", "loo": "heatwave", "behosh": "heatwave",
    "heat": "heatwave", "tapish": "heatwave", "shiddat": "heatwave",
    "dhoop": "heatwave",

    # Air Quality
    "dhund": "air_quality", "smog": "air_quality",
    "pollution": "air_quality", "sans": "air_quality",
    "suffocation": "air_quality", "ghutan": "air_quality",

    # Sewage
    "ganda": "sewage_overflow", "naala": "sewage_overflow",
    "sewage": "sewage_overflow", "gandagi": "sewage_overflow",
    "gutter": "sewage_overflow", "overflow": "sewage_overflow",
    "badboo": "sewage_overflow",

    # Earthquake
    "zalzala": "earthquake", "earthquake": "earthquake",
    "kaanp": "earthquake", "hilna": "earthquake",
    "tremor": "earthquake", "jhatka": "earthquake",
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


class ParsedReportSchema(BaseModel):
    parsed_intent: str = Field(description="The primary crisis type extracted (e.g. flood, fire, traffic_gridlock, power_outage, etc.)")
    keywords: list[str] = Field(description="List of keywords indicating the crisis.")
    detected_sectors: list[str] = Field(description="List of detected Islamabad sectors or landmarks.")
    language_detected: str = Field(description="'roman_urdu' or 'english'")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")
    original_text: str = Field(description="The original report text.")


def local_dictionary_fallback(report_text: str) -> dict:
    """Robust local dictionary-based parser used as fallback."""
    text_lower = report_text.lower()

    # Normalize sector mentions in text (e.g. 'g 10' or 'g10' -> 'g-10')
    normalized_text = text_lower
    # Replace patterns like 'g 10', 'g-10', 'g10' with standardized 'g-10'
    normalized_text = re.sub(r'\b([a-z])\s*[-_]?\s*(\d+)\b', r'\1-\2', normalized_text)

    # Extract matching keywords
    found_keywords = []
    crisis_types_found: dict[str, int] = {}

    for keyword, crisis_type in CRISIS_KEYWORDS.items():
        if keyword in normalized_text:
            found_keywords.append(keyword)
            crisis_types_found[crisis_type] = crisis_types_found.get(crisis_type, 0) + 1

    # Determine primary crisis type by most keyword matches
    if crisis_types_found:
        primary_crisis = max(crisis_types_found, key=crisis_types_found.get)
    else:
        primary_crisis = "unknown"

    # Detect sector/location mentions
    detected_sectors = []
    for sector in SECTOR_PATTERNS:
        # Match sector in normalized text (e.g. 'g-10')
        if sector.lower() in normalized_text or sector.lower().replace("-", "") in normalized_text:
            if sector not in detected_sectors:
                detected_sectors.append(sector)

    # Calculate confidence based on keyword density
    keyword_count = len(found_keywords)
    if keyword_count >= 3:
        confidence = 0.85
    elif keyword_count == 2:
        confidence = 0.7
    elif keyword_count == 1:
        confidence = 0.5
    else:
        confidence = 0.2

    # Boost confidence if sector is detected
    if detected_sectors:
        confidence = min(confidence + 0.15, 1.0)

    # Simple language detection
    urdu_indicators = ["mein", "hai", "ho", "ka", "ki", "ke", "se", "pe", "nahi", "tha", "raha", "gaya", "gya", "par"]
    language = "roman_urdu" if any(indicator in text_lower for indicator in urdu_indicators) else "english"

    return {
        "parsed_intent": primary_crisis,
        "keywords": found_keywords,
        "detected_sectors": detected_sectors,
        "language_detected": language,
        "confidence": round(confidence, 2),
        "original_text": report_text,
    }


@tool("roman_urdu_parser")
def roman_urdu_parser(report_text: str) -> str:
    """
    Parses a citizen crisis report written in Roman Urdu (or English)
    and extracts: crisis type, keywords found, detected sector, and
    confidence score. Uses Gemini 2.0 with a robust local dictionary fallback.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        print("GEMINI_API_KEY not found in environment. Falling back to local dictionary parser.")
        return json.dumps(local_dictionary_fallback(report_text), ensure_ascii=False)

    try:
        # Initialize Google GenAI Client
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an expert NLP system for the CIRO Urban Resilience platform in Islamabad, Pakistan.
        Analyze the following citizen report which could be in Roman Urdu (Urdu written in Latin script) or English.
        
        Extract the following details as structured JSON matching the schema:
        1. parsed_intent: The primary crisis type. Choose ONLY from: 
           [flood, flash_flood, road_blockage, traffic_gridlock, road_collapse, power_outage, fire, heatwave, air_quality, sewage_overflow, earthquake, unknown]
        2. keywords: List of specific words from the text that indicate the crisis.
        3. detected_sectors: List of Islamabad sectors (e.g. G-10, I-8, Blue Area, Faisal Mosque, Zero Point, etc.) mentioned. Standardize them to 'Letter-Number' (e.g., 'G-10').
        4. language_detected: 'roman_urdu' or 'english'.
        5. confidence: Confidence score between 0.0 and 1.0.
        6. original_text: The original unchanged report text.
        
        Report Text: "{report_text}"
        """

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ParsedReportSchema,
                temperature=0.1,
            )
        )
        
        # Verify we got a valid response text
        if response.text:
            # Validate that it parses as JSON and has the fields
            parsed_res = json.loads(response.text)
            parsed_res["parser_type"] = "gemini_api"
            return json.dumps(parsed_res, ensure_ascii=False)
        else:
            raise ValueError("Empty response from Gemini API")

    except Exception as e:
        print(f"Gemini parsing failed due to: {e}. Falling back to local dictionary parser.")
        fallback_res = local_dictionary_fallback(report_text)
        # Add a note that fallback was used
        fallback_res["parser_type"] = "fallback_dictionary"
        return json.dumps(fallback_res, ensure_ascii=False)

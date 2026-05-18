import json
import unittest
from unittest.mock import patch, MagicMock
from ciro.tools.roman_urdu_parser import roman_urdu_parser

class RomanUrduParserTest(unittest.TestCase):

    @patch("ciro.tools.roman_urdu_parser.genai.Client")
    def test_parser_uses_gemini_on_success(self, mock_client_class):
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "parsed_intent": "flood",
            "keywords": ["pani", "bhar"],
            "detected_sectors": ["G-10"],
            "language_detected": "roman_urdu",
            "confidence": 0.95,
            "original_text": "G-10 mein pani bhar gaya hai"
        })
        mock_client.models.generate_content.return_value = mock_response

        # Force GEMINI_API_KEY in environment
        with patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}):
            output = roman_urdu_parser.func("G-10 mein pani bhar gaya hai")
            result = json.loads(output)

            self.assertEqual(result["parsed_intent"], "flood")
            self.assertEqual(result["parser_type"], "gemini_api")
            self.assertEqual(result["confidence"], 0.95)

    @patch("ciro.tools.roman_urdu_parser.genai.Client")
    def test_parser_falls_back_to_dictionary_on_api_error(self, mock_client_class):
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Simulate API Exception
        mock_client.models.generate_content.side_effect = Exception("API Quota Exceeded")

        with patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}):
            output = roman_urdu_parser.func("Traffic jam at G11 markaz")
            result = json.loads(output)

            self.assertEqual(result["parsed_intent"], "traffic_gridlock")
            self.assertEqual(result["parser_type"], "fallback_dictionary")
            self.assertIn("G-11", result["detected_sectors"])
            self.assertEqual(result["confidence"], 0.85)

    def test_parser_uses_dictionary_when_api_key_missing(self):
        with patch.dict("os.environ", {}, clear=True):
            output = roman_urdu_parser.func("Zero Point pe accident hoa hai")
            result = json.loads(output)

            self.assertEqual(result["parsed_intent"], "road_blockage")
            self.assertEqual(result["language_detected"], "roman_urdu")
            self.assertIn("Zero Point", result["detected_sectors"])

if __name__ == "__main__":
    unittest.main()

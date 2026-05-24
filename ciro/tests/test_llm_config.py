import os
import unittest
from unittest.mock import patch, MagicMock
from importlib import reload

# Patch load_dotenv and crewai.LLM BEFORE importing ciro.llm_config
with patch("dotenv.load_dotenv"):
    with patch("crewai.LLM"):
        import ciro.llm_config

@patch("dotenv.load_dotenv")
class LLMConfigTest(unittest.TestCase):

    def setUp(self):
        # Store original environment variables
        self.original_env = dict(os.environ)

    def tearDown(self):
        # Restore original environment variables
        os.environ.clear()
        os.environ.update(self.original_env)

    @patch("crewai.LLM")
    def test_llm_config_no_api_key(self, mock_llm_class, mock_load_dotenv):
        # Mock LLM instance
        mock_llm_instance = MagicMock()
        mock_llm_class.return_value = mock_llm_instance

        # Clear GEMINI_API_KEY from environment
        if "GEMINI_API_KEY" in os.environ:
            del os.environ["GEMINI_API_KEY"]

        # Reload the module to trigger get_llm()
        reload(ciro.llm_config)

        # Check that LLM was called with the Ollama model
        mock_llm_class.assert_any_call(
            model="ollama/batiai/gemma4-e4b:q6",
            base_url="http://localhost:11434"
        )
        self.assertEqual(ciro.llm_config.local_llm, mock_llm_instance)

    @patch("crewai.LLM")
    def test_llm_config_invalid_api_key(self, mock_llm_class, mock_load_dotenv):
        # Mock LLM instances
        mock_gemini_instance = MagicMock()
        mock_ollama_instance = MagicMock()

        # Define side effects: Gemini will raise exception on call()
        mock_gemini_instance.call.side_effect = Exception("API Key Leaked / Quota Exceeded")
        mock_llm_class.side_effect = lambda model, **kwargs: mock_gemini_instance if "gemini" in model else mock_ollama_instance

        # Set invalid key in env
        os.environ["GEMINI_API_KEY"] = "leaked-or-invalid-key"

        # Reload
        reload(ciro.llm_config)

        # Check that it tried gemini-1.5-flash and gemini-2.0-flash, then fell back to ollama
        mock_llm_class.assert_any_call(
            model="ollama/batiai/gemma4-e4b:q6",
            base_url="http://localhost:11434"
        )
        self.assertEqual(ciro.llm_config.local_llm, mock_ollama_instance)

    @patch("crewai.LLM")
    def test_llm_config_valid_api_key(self, mock_llm_class, mock_load_dotenv):
        # Mock LLM instances
        mock_gemini_instance = MagicMock()
        mock_ollama_instance = MagicMock()

        # Gemini works (does not raise exception on call())
        mock_gemini_instance.call.return_value = "hello"
        mock_llm_class.side_effect = lambda model, **kwargs: mock_gemini_instance if "gemini" in model else mock_ollama_instance

        # Set valid key in env
        os.environ["GEMINI_API_KEY"] = "valid-api-key"

        # Reload
        reload(ciro.llm_config)

        # Should use the gemini model and NOT call ollama
        self.assertEqual(ciro.llm_config.local_llm, mock_gemini_instance)
        # Verify LLM was NOT called with ollama
        for call_args in mock_llm_class.call_args_list:
            model_arg = call_args[1].get("model") or call_args[0][0]
            self.assertNotEqual(model_arg, "ollama/batiai/gemma4-e4b:q6")

if __name__ == "__main__":
    unittest.main()

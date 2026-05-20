import os
import logging
from dotenv import load_dotenv
from crewai import LLM

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ciro.llm_config")

load_dotenv()

def get_llm() -> LLM:
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        for model_name in ["gemini/gemini-1.5-flash", "gemini/gemini-2.0-flash"]:
            try:
                logger.info(f"Gemini API key found. Verifying {model_name}...")
                llm = LLM(model=model_name, api_key=api_key)
                # A quick lightweight validation call to verify the API key is valid and not leaked/exhausted
                llm.call(messages=[{"role": "user", "content": "ping"}])
                logger.info(f"Successfully verified Gemini Flash ({model_name}). Using Gemini.")
                return llm
            except Exception as e:
                logger.warning(f"Gemini Flash verification failed for {model_name}: {e}.")
        
        logger.warning("All Gemini Flash options failed verification. Falling back to local Ollama LLM.")

    logger.info("Using local Ollama LLM (ollama/qwen3:8b).")
    return LLM(
        model="ollama/qwen3:8b",
        base_url="http://localhost:11434"
    )

local_llm = get_llm()


from crewai import LLM

local_llm = LLM(
    model="ollama/qwen3:8b",
    base_url="http://localhost:11434"
)

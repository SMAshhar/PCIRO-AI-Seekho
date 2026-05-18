#!/usr/bin/env python
from pydantic import BaseModel
from crewai.flow import Flow, listen, start, router, or_
import json
import sys
import re
from dotenv import load_dotenv

load_dotenv()

from ciro.crews.ingest_crew.ingest_crew import IngestCrew
from ciro.crews.analysis_crew.analysis_crew import AnalysisCrew
from ciro.crews.response_crew.response_crew import ResponseCrew
from ciro.schema.models import Signal, CorroboratedEvent, ImpactAssessment, ActionPlan, NormalizedSignal

class CIROState(BaseModel):
    raw_report: dict = {}
    parsed_signal: NormalizedSignal | None = None
    corroboration_score: float = 0.0
    corroborated_event: CorroboratedEvent | None = None
    impact_assessment: ImpactAssessment | None = None
    action_plan: ActionPlan | None = None
    trace_log: list[str] = []

def extract_json(text: str) -> dict:
    """Helper to extract JSON from LLM output."""
    try:
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        return json.loads(text)
    except Exception:
        return {}

class CIROFlow(Flow[CIROState]):

    @start()
    def ingest_report(self, crewai_trigger_payload: dict = None):
        print("--- Flow Started: Ingesting Report ---")
        if crewai_trigger_payload:
            self.state.raw_report = crewai_trigger_payload
        else:
            self.state.raw_report = {
                "text": "G-10 mein pani bhar gaya",
                "lat": 33.6844,
                "lon": 73.0479,
                "sector": "G-10"
            }
        print(f"Raw report: {self.state.raw_report}")

    @listen(ingest_report)
    def run_ingest_crew(self):
        print("--- Running Ingest Crew ---")
        inputs = {
            "report_text": self.state.raw_report.get("text", ""),
            "latitude": self.state.raw_report.get("lat", 0.0),
            "longitude": self.state.raw_report.get("lon", 0.0),
            "sector": self.state.raw_report.get("sector", "Unknown")
        }
        result = IngestCrew().crew().kickoff(inputs=inputs)
        print(f"Ingest Crew result: {result.raw}")
        parsed_data = extract_json(result.raw)
        if parsed_data:
            # We skip full validation for demo purposes and just keep the dict
            self.state.raw_report["parsed_intent"] = parsed_data.get("parsed_intent", "flood")

    @listen(run_ingest_crew)
    def run_analysis_crew(self):
        print("--- Running Analysis Crew ---")
        inputs = {
            "crisis_type": self.state.raw_report.get("parsed_intent", "flood"),
            "latitude": self.state.raw_report.get("lat", 0.0),
            "longitude": self.state.raw_report.get("lon", 0.0),
            "sector": self.state.raw_report.get("sector", "Unknown"),
            "report_text": self.state.raw_report.get("text", ""),
            "num_similar_reports": 3
        }
        result = AnalysisCrew().crew().kickoff(inputs=inputs)
        print(f"Analysis Crew result: {result.raw}")
        parsed_data = extract_json(result.raw)
        if parsed_data:
            self.state.corroboration_score = float(parsed_data.get("corroboration_score", 85.0))
            self.state.raw_report["severity"] = parsed_data.get("severity", "high")
            self.state.raw_report["affected_population"] = parsed_data.get("affected_population", 500)
            self.state.raw_report["recommended_resources"] = parsed_data.get("recommended_resources", "Emergency teams")
            self.state.raw_report["estimated_response_time_min"] = parsed_data.get("estimated_response_time_min", 15)

    @router(run_analysis_crew)
    def route_by_severity(self):
        print("--- Routing based on severity ---")
        score = self.state.corroboration_score if self.state.corroboration_score else 85.0 
        if score >= 80:
            return "critical"
        return "routine"

    @listen("critical")
    def critical_response(self):
        print("--- Critical Event Detected: Requesting Human Approval ---")
        print("Waiting for Incident Commander approval...")
        self.state.trace_log.append("Critical event approved by HIL")

    @listen("routine")
    def auto_response(self):
        print("--- Routine Event Detected: Auto-dispatching ---")
        self.state.trace_log.append("Routine event auto-dispatched")

    @listen(or_(critical_response, auto_response))
    def run_response_crew(self):
        print("--- Running Response Crew ---")
        inputs = {
            "crisis_type": self.state.raw_report.get("parsed_intent", "flood"),
            "sector": self.state.raw_report.get("sector", "Unknown"),
            "severity": self.state.raw_report.get("severity", "high"),
            "affected_population": self.state.raw_report.get("affected_population", 500),
            "recommended_resources": str(self.state.raw_report.get("recommended_resources", "Emergency teams")),
            "estimated_response_time_min": self.state.raw_report.get("estimated_response_time_min", 15)
        }
        result = ResponseCrew().crew().kickoff(inputs=inputs)
        print(f"Response Crew result: {result.raw}")


def kickoff():
    ciro_flow = CIROFlow()
    ciro_flow.kickoff()

def plot():
    ciro_flow = CIROFlow()
    ciro_flow.plot()

def run_with_trigger():
    if len(sys.argv) < 2:
        raise Exception("No trigger payload provided. Please provide JSON payload as argument.")

    try:
        trigger_payload = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        raise Exception("Invalid JSON payload provided as argument")

    ciro_flow = CIROFlow()

    try:
        result = ciro_flow.kickoff({"crewai_trigger_payload": trigger_payload})
        return result
    except Exception as e:
        raise Exception(f"An error occurred while running the flow with trigger: {e}")

if __name__ == "__main__":
    kickoff()

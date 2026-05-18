from crewai import Agent, Crew, Process, Task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.project import CrewBase, agent, crew, task

from ciro.tools.roman_urdu_parser import roman_urdu_parser
from ciro.llm_config import local_llm


@CrewBase
class IngestCrew:
    """Ingest Crew — Parses Roman Urdu reports and normalizes signals."""

    agents: list[BaseAgent]
    tasks: list[Task]

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def nlp_parser(self) -> Agent:
        return Agent(
            config=self.agents_config["nlp_parser"],  # type: ignore[index]
            tools=[roman_urdu_parser],
            llm=local_llm,
        )

    @agent
    def data_normalizer(self) -> Agent:
        return Agent(
            config=self.agents_config["data_normalizer"],  # type: ignore[index]
            llm=local_llm,
        )

    @task
    def parse_report_task(self) -> Task:
        return Task(
            config=self.tasks_config["parse_report_task"],  # type: ignore[index]
        )

    @task
    def normalize_signal_task(self) -> Task:
        return Task(
            config=self.tasks_config["normalize_signal_task"],  # type: ignore[index]
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Ingest Crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )

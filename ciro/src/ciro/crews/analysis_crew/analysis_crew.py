from crewai import Agent, Crew, Process, Task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.project import CrewBase, agent, crew, task

from ciro.tools.weather_fetcher import weather_fetcher
from ciro.tools.corroboration_engine import corroboration_engine
from ciro.tools.impact_assessor import impact_assessor
from ciro.llm_config import local_llm


@CrewBase
class AnalysisCrew:
    """Analysis Crew — Corroborates, detects, and assesses crisis events."""

    agents: list[BaseAgent]
    tasks: list[Task]

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def signal_corroborator(self) -> Agent:
        return Agent(
            config=self.agents_config["signal_corroborator"],  # type: ignore[index]
            tools=[weather_fetcher, corroboration_engine],
            llm=local_llm,
        )

    @agent
    def event_detector(self) -> Agent:
        return Agent(
            config=self.agents_config["event_detector"],  # type: ignore[index]
            llm=local_llm,
        )

    @agent
    def impact_assessor_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["impact_assessor_agent"],  # type: ignore[index]
            tools=[impact_assessor],
            llm=local_llm,
        )

    @task
    def corroboration_task(self) -> Task:
        return Task(
            config=self.tasks_config["corroboration_task"],  # type: ignore[index]
        )

    @task
    def detection_task(self) -> Task:
        return Task(
            config=self.tasks_config["detection_task"],  # type: ignore[index]
        )

    @task
    def impact_assessment_task(self) -> Task:
        return Task(
            config=self.tasks_config["impact_assessment_task"],  # type: ignore[index]
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Analysis Crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )

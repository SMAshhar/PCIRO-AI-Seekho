from crewai import Agent, Crew, Process, Task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.project import CrewBase, agent, crew, task

from ciro.tools.alert_dispatcher import alert_dispatcher
from ciro.llm_config import local_llm


@CrewBase
class ResponseCrew:
    """Response Crew — Plans response and dispatches alerts."""

    agents: list[BaseAgent]
    tasks: list[Task]

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def response_planner(self) -> Agent:
        return Agent(
            config=self.agents_config["response_planner"],  # type: ignore[index]
            llm=local_llm,
        )

    @agent
    def logistics_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["logistics_agent"],  # type: ignore[index]
            tools=[alert_dispatcher],
            llm=local_llm,
        )

    @task
    def response_planning_task(self) -> Task:
        return Task(
            config=self.tasks_config["response_planning_task"],  # type: ignore[index]
        )

    @task
    def dispatch_task(self) -> Task:
        return Task(
            config=self.tasks_config["dispatch_task"],  # type: ignore[index]
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Response Crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )

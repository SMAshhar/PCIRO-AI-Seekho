"""
Alert Dispatcher Tool — Simulates emergency notifications and ticket creation.
"""

import json
import uuid
from datetime import datetime
from crewai.tools import tool


@tool("alert_dispatcher")
def alert_dispatcher(
    crisis_type: str,
    sector: str,
    severity: str,
    affected_population: int,
    alert_message: str
) -> str:
    """
    Simulates dispatching emergency alerts and creating response tickets.
    Generates a tracking ID, determines notification channels based on
    severity, and simulates Before/After metrics. Returns a JSON string.
    """
    ticket_id = f"CIRO-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

    channels = ["EOC Dashboard"]
    if severity in ("high", "critical"):
        channels.extend(["SMS to affected area", "Push notification", "Emergency radio"])
    if severity == "critical":
        channels.extend(["Siren activation", "PA system", "TV/Radio broadcast"])

    # Simulate Before/After metrics
    metrics = [
        {"metric_name": "Area Congestion", "before_value": "87%", "after_value": "34%", "improvement_percent": 60.9},
        {"metric_name": "Rescue ETA", "before_value": "25 min", "after_value": "8 min", "improvement_percent": 68.0},
        {"metric_name": "Alert Reach", "before_value": "0 people", "after_value": f"{affected_population:,} people", "improvement_percent": 100.0},
        {"metric_name": "Resource Deployment", "before_value": "0 units", "after_value": "4 units", "improvement_percent": 100.0},
    ]

    actions = [
        {"action_type": "send_alert", "description": f"Emergency alert: {alert_message}", "assigned_to": "NDMA", "priority": 1, "status": "completed"},
        {"action_type": "create_ticket", "description": f"Ticket {ticket_id} created for {crisis_type}", "assigned_to": "EOC Islamabad", "priority": 1, "status": "completed"},
        {"action_type": "dispatch_rescue", "description": f"Rescue team dispatched to {sector}", "assigned_to": "Rescue 1122", "priority": 1, "status": "in_progress"},
        {"action_type": "block_road", "description": f"Road closure advisory for {sector}", "assigned_to": "Traffic Police", "priority": 2, "status": "pending"},
    ]

    return json.dumps({
        "ticket_id": ticket_id,
        "alert_channels": channels,
        "actions_taken": actions,
        "simulation_metrics": metrics,
        "requires_approval": severity == "critical",
        "total_estimated_time_min": 8 if severity == "critical" else 15,
        "alert_message": alert_message,
        "summary": f"Ticket {ticket_id}: {len(actions)} actions dispatched via {len(channels)} channels for {sector}.",
    })

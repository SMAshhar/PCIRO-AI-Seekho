import json
import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime

from fastapi.testclient import TestClient

from ciro.api.app import create_fastapi_app
from ciro.api.store import crisis_store
from ciro.api.schemas import (
    CrisisEventOut,
    CrisisLocation,
    CrisisStatus,
    CrisisType,
    Severity,
    ImpactAssessmentOut,
    ReportCreate,
)


class APITest(unittest.TestCase):
    def setUp(self):
        # Clear the in-memory database store before each test
        crisis_store._events.clear()
        
        # Instantiate test client
        self.app = create_fastapi_app()
        self.client = TestClient(self.app)

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["crises_count"], 0)

        # Seed an item and check health updates count
        event = CrisisEventOut(
            event_id="test-event-1",
            crisis_type=CrisisType.FLOOD,
            title="G-10 Flood",
            sector="G-10",
            location=CrisisLocation(lat=33.6844, lon=73.0479, sector="G-10"),
            severity=Severity.HIGH,
            corroboration_score=75.0,
            status=CrisisStatus.ACTIVE,
            ingest_timestamp=datetime.utcnow().isoformat() + "Z",
            summary="G-10 flooding test",
            impact_assessment=ImpactAssessmentOut(
                affected_population=500,
                affected_sectors=["G-10"],
                infrastructure_at_risk=["Roads"],
                recommended_resources=["Water Pumps"],
                estimated_response_time_min=15,
            )
        )
        crisis_store.upsert(event)

        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["crises_count"], 1)

    def test_list_crises_endpoint(self):
        # 1. Initially empty
        response = self.client.get("/api/crises")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

        # 2. Add an active event
        event = CrisisEventOut(
            event_id="test-event-1",
            crisis_type=CrisisType.FLOOD,
            title="G-10 Flood",
            sector="G-10",
            location=CrisisLocation(lat=33.6844, lon=73.0479, sector="G-10"),
            severity=Severity.HIGH,
            corroboration_score=75.0,
            status=CrisisStatus.ACTIVE,
            ingest_timestamp=datetime.utcnow().isoformat() + "Z",
            summary="G-10 flooding test",
        )
        crisis_store.upsert(event)

        response = self.client.get("/api/crises")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["event_id"], "test-event-1")
        self.assertEqual(data[0]["status"], "active")

        # 3. Add an archived event (should not be listed as active)
        archived_event = CrisisEventOut(
            event_id="test-event-archived",
            crisis_type=CrisisType.FIRE,
            title="I-8 Fire",
            sector="I-8",
            location=CrisisLocation(lat=33.6844, lon=73.0479, sector="I-8"),
            severity=Severity.MEDIUM,
            corroboration_score=40.0,
            status=CrisisStatus.ARCHIVED,
            ingest_timestamp=datetime.utcnow().isoformat() + "Z",
            summary="I-8 fire test",
        )
        crisis_store.upsert(archived_event)

        response = self.client.get("/api/crises")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)  # Only the active one

    def test_get_crisis_detail_and_not_found(self):
        # 1. Try non-existent
        response = self.client.get("/api/crises/non-existent")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Crisis not found")

        # 2. Add and get existing
        event = CrisisEventOut(
            event_id="test-event-1",
            crisis_type=CrisisType.FIRE,
            title="F-7 Fire",
            sector="F-7",
            location=CrisisLocation(lat=33.6844, lon=73.0479, sector="F-7"),
            severity=Severity.MEDIUM,
            corroboration_score=50.0,
            status=CrisisStatus.ACTIVE,
            ingest_timestamp=datetime.utcnow().isoformat() + "Z",
            summary="F-7 fire test",
        )
        crisis_store.upsert(event)

        response = self.client.get("/api/crises/test-event-1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "F-7 Fire")

    def test_submit_report_endpoint(self):
        report_payload = {
            "text": "G-10 mein barish ho rahi hai aur nala ubal gaya hai",
            "crisis_type": "flood",
            "location": {
                "lat": 33.6844,
                "lon": 73.0479,
                "sector": "G-10"
            },
            "device_id": "test-device-id"
        }

        # We'll patch Gemini API call to fallback directly for deterministic parsing
        with patch.dict("os.environ", {}, clear=True):
            response = self.client.post("/api/reports", json=report_payload)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["status"], "processing")
            self.assertIn("report_id", data)
            self.assertIn("event_id", data)

            # TestClient executes background tasks synchronously
            # Thus, the report should be fully processed in the store now
            event_id = data["event_id"]
            stored_event = crisis_store.get(event_id)
            self.assertIsNotNone(stored_event)
            self.assertEqual(stored_event.sector, "G-10")
            # "nala" / "barish" keyword matches should yield flood
            self.assertEqual(stored_event.crisis_type, CrisisType.FLOOD)

    def test_trace_and_simulation_endpoints(self):
        event = CrisisEventOut(
            event_id="test-event-trace",
            crisis_type=CrisisType.POWER_OUTAGE,
            title="G-6 Power Outage",
            sector="G-6",
            location=CrisisLocation(lat=33.6844, lon=73.0479, sector="G-6"),
            severity=Severity.LOW,
            corroboration_score=30.0,
            status=CrisisStatus.ACTIVE,
            ingest_timestamp=datetime.utcnow().isoformat() + "Z",
            summary="G-6 power outage test",
            agent_trace=[],
            simulation_metrics=[],
        )
        crisis_store.upsert(event)

        # 1. Test Trace
        response = self.client.get("/api/crises/test-event-trace/trace")
        self.assertEqual(response.status_code, 200)
        trace_data = json.loads(response.json())
        self.assertEqual(trace_data, [])

        # 2. Test Simulation
        response = self.client.get("/api/crises/test-event-trace/simulation")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_commander_approve_and_reject(self):
        event = CrisisEventOut(
            event_id="test-commander-event",
            crisis_type=CrisisType.HEATWAVE,
            title="F-8 Heatwave",
            sector="F-8",
            location=CrisisLocation(lat=33.6844, lon=73.0479, sector="F-8"),
            severity=Severity.CRITICAL,
            corroboration_score=90.0,
            status=CrisisStatus.AWAITING_APPROVAL,
            ingest_timestamp=datetime.utcnow().isoformat() + "Z",
            summary="Heatwave in F-8",
        )
        crisis_store.upsert(event)

        # 1. Approve
        approve_payload = {
            "eventId": "test-commander-event",
            "note": "Approved by Incident Commander",
        }
        response = self.client.post("/api/commander/approve", json=approve_payload)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        self.assertEqual(response.json()["event_id"], "test-commander-event")

        # Check status updated to active
        updated_event = crisis_store.get("test-commander-event")
        self.assertEqual(updated_event.status, CrisisStatus.ACTIVE)
        self.assertIn("Approved by Incident Commander", updated_event.summary)

        # 2. Reject
        reject_payload = {
            "eventId": "test-commander-event",
            "reason": "False alarm report",
        }
        response = self.client.post("/api/commander/reject", json=reject_payload)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])

        # Check status updated to archived
        rejected_event = crisis_store.get("test-commander-event")
        self.assertEqual(rejected_event.status, CrisisStatus.ARCHIVED)
        self.assertIn("Rejected: False alarm report", rejected_event.summary)

    def test_register_device(self):
        payload = {
            "device_id": "device-12345",
            "fcm_token": "token-abc-xyz",
            "sectors": ["G-10", "G-11"],
            "role": "citizen"
        }
        response = self.client.post("/api/devices/register", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "registered")
        self.assertEqual(response.json()["device_id"], "device-12345")


if __name__ == "__main__":
    unittest.main()

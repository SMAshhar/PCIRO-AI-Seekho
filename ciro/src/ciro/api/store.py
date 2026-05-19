"""In-memory crisis event store (thread-safe)."""

from __future__ import annotations

import threading
from typing import Optional

from ciro.api.schemas import CrisisEventOut, CrisisStatus


class CrisisStore:
    def __init__(self) -> None:
        self._events: dict[str, CrisisEventOut] = {}
        self._lock = threading.RLock()

    def list_active(self) -> list[CrisisEventOut]:
        with self._lock:
            events = [
                e
                for e in self._events.values()
                if e.status not in (CrisisStatus.ARCHIVED, CrisisStatus.RESOLVED)
            ]
            events.sort(
                key=lambda e: (e.corroboration_score, e.ingest_timestamp),
                reverse=True,
            )
            return events

    def get(self, event_id: str) -> Optional[CrisisEventOut]:
        with self._lock:
            return self._events.get(event_id)

    def upsert(self, event: CrisisEventOut) -> CrisisEventOut:
        with self._lock:
            self._events[event.event_id] = event
            return event

    def delete(self, event_id: str) -> bool:
        with self._lock:
            return self._events.pop(event_id, None) is not None

    def count(self) -> int:
        with self._lock:
            return len(self._events)


crisis_store = CrisisStore()

import {CrisisEvent} from '../types/models';

const g10Polygon = {
  type: 'Polygon' as const,
  coordinates: [
    [
      [73.04, 33.69],
      [73.06, 33.69],
      [73.06, 33.67],
      [73.04, 33.67],
      [73.04, 33.69],
    ],
  ],
};

export const MOCK_CRISES: CrisisEvent[] = [
  {
    event_id: 'evt-g10-flood-001',
    crisis_type: 'flood',
    title: 'G-10 Urban Flooding',
    sector: 'G-10',
    location: {lat: 33.6844, lon: 73.0479, sector: 'G-10'},
    severity: 'critical',
    corroboration_score: 85,
    status: 'awaiting_approval',
    ingest_timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    summary: 'Heavy rainfall causing street flooding across G-10 sectors.',
    confidence: 0.94,
    trace_id: 'ag-trace-2026-05-18-001',
    sources: [
      {
        source_name: 'Weather API (Open-Meteo)',
        score_contribution: 30,
        max_score: 30,
        is_corroborating: true,
      },
      {
        source_name: 'Traffic Data',
        score_contribution: 25,
        max_score: 25,
        is_corroborating: true,
      },
      {
        source_name: 'Citizen Reports',
        score_contribution: 20,
        max_score: 20,
        is_corroborating: true,
      },
      {
        source_name: 'IoT Sensors',
        score_contribution: 8,
        max_score: 15,
        is_corroborating: false,
      },
      {
        source_name: 'Historical Patterns',
        score_contribution: 2,
        max_score: 10,
        is_corroborating: false,
      },
    ],
    impact_assessment: {
      affected_population: 3200,
      affected_sectors: ['G-10/1', 'G-10/2', 'G-10/3', 'G-10/4'],
      zone_geojson: g10Polygon,
      infrastructure_at_risk: ['Hospital: PIMS', '3 schools', 'Road: Kashmir Highway'],
      estimated_response_time_min: 10,
    },
    agent_trace: [
      {
        agent_name: 'Roman Urdu NLP',
        status: 'done',
        timestamp_offset_ms: 8000,
        summary: 'Parsed intent: flood · Sectors: G-10 · Confidence: 0.91',
        raw_output: JSON.stringify(
          {parsed_intent: 'flood', keywords: ['pani', 'bhar'], confidence: 0.91},
          null,
          2,
        ),
      },
      {
        agent_name: 'Data Normalizer',
        status: 'done',
        timestamp_offset_ms: 14000,
        summary: 'Enriched with weather — Rain: 45mm/hr',
      },
      {
        agent_name: 'Signal Corroborator',
        status: 'done',
        timestamp_offset_ms: 22000,
        summary: 'Corroboration score: 85/100',
      },
      {
        agent_name: 'Event Detector',
        status: 'done',
        timestamp_offset_ms: 28000,
        summary: 'Verified critical flood event',
      },
      {
        agent_name: 'Impact Assessor',
        status: 'done',
        timestamp_offset_ms: 35000,
        summary: '~3,200 residents affected',
      },
      {
        agent_name: 'Response Planner',
        status: 'active',
        timestamp_offset_ms: 42000,
        summary: 'Drafting response plan…',
      },
      {
        agent_name: 'Logistics Dispatcher',
        status: 'pending',
        summary: 'Awaiting commander approval',
      },
    ],
    simulation_metrics: [
      {label: 'Road Congestion', before: '100%', after: '40%', improved: true},
      {label: 'Rescue ETA', before: '—', after: '8 min', improved: true},
      {label: 'Residents Alerted', before: '0', after: '3,200', improved: true},
      {label: 'Resources Deployed', before: '0', after: '6', improved: true},
    ],
    proposed_actions: [
      'Reroute traffic via I-8 bypass',
      'Create emergency ticket #CIR-2026-0118',
      'Send push alert to 3,200 users in G-10',
      'Dispatch 2 rescue units',
    ],
  },
  {
    event_id: 'evt-i8-traffic-002',
    crisis_type: 'traffic_gridlock',
    title: 'I-8 Markaz Gridlock',
    sector: 'I-8',
    location: {lat: 33.659, lon: 73.078, sector: 'I-8'},
    severity: 'high',
    corroboration_score: 72,
    status: 'active',
    ingest_timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    summary: 'Severe congestion reported near I-8 Markaz.',
    sources: [
      {
        source_name: 'Traffic Data',
        score_contribution: 20,
        max_score: 25,
        is_corroborating: true,
      },
      {
        source_name: 'Citizen Reports',
        score_contribution: 15,
        max_score: 20,
        is_corroborating: true,
      },
    ],
    impact_assessment: {
      affected_population: 1200,
      affected_sectors: ['I-8'],
    },
    agent_trace: [
      {agent_name: 'Roman Urdu NLP', status: 'done', summary: 'traffic_gridlock'},
      {agent_name: 'Signal Corroborator', status: 'done', summary: 'Score 72'},
      {agent_name: 'Response Planner', status: 'pending'},
    ],
  },
  {
    event_id: 'evt-f7-heat-003',
    crisis_type: 'heatwave',
    title: 'F-7 Heat Advisory',
    sector: 'F-7',
    location: {lat: 33.721, lon: 73.037, sector: 'F-7'},
    severity: 'medium',
    corroboration_score: 58,
    status: 'active',
    ingest_timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    agent_trace: [
      {agent_name: 'Roman Urdu NLP', status: 'done'},
      {agent_name: 'Impact Assessor', status: 'active'},
    ],
  },
];

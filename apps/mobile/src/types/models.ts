export type CrisisType =
  | 'flood'
  | 'fire'
  | 'heatwave'
  | 'road_blockage'
  | 'power_outage'
  | 'air_quality'
  | 'flash_flood'
  | 'earthquake'
  | 'traffic_gridlock'
  | 'sewage_overflow'
  | 'unknown';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type CrisisStatus =
  | 'active'
  | 'awaiting_approval'
  | 'resolved'
  | 'archived';

export type AgentStatus = 'done' | 'active' | 'pending' | 'failed';

export interface AgentStep {
  agent_name: string;
  status: AgentStatus;
  icon?: string;
  timestamp_offset_ms?: number;
  summary?: string;
  raw_output?: string;
}

export interface CorroborationSource {
  source_name: string;
  data_summary?: string;
  score_contribution: number;
  max_score: number;
  is_corroborating: boolean;
}

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface ImpactAssessment {
  affected_population: number;
  affected_sectors: string[];
  zone_geojson?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  infrastructure_at_risk?: string[];
  recommended_resources?: string[];
  estimated_response_time_min?: number;
}

export interface SimulationMetric {
  label: string;
  before: string;
  after: string;
  improved: boolean;
}

export interface CrisisLocation {
  lat: number;
  lon: number;
  sector: string;
  address?: string;
}

export interface CrisisEvent {
  event_id: string;
  crisis_type: CrisisType;
  title: string;
  sector: string;
  location: CrisisLocation;
  severity: Severity;
  corroboration_score: number;
  status: CrisisStatus;
  ingest_timestamp: string;
  summary?: string;
  sources?: CorroborationSource[];
  impact_assessment?: ImpactAssessment;
  agent_trace?: AgentStep[];
  simulation_metrics?: SimulationMetric[];
  proposed_actions?: string[];
  confidence?: number;
  trace_id?: string;
  alert_message?: string;
}

export interface ReportPayload {
  text: string;
  crisis_type: CrisisType;
  location: CrisisLocation;
  photo_url?: string;
  device_id: string;
}

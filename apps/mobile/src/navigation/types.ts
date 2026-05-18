export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  CrisisDetail: {crisisId: string};
  AgentTrace: {crisisId: string; traceId: string};
  Simulation: {crisisId: string};
  IncidentCommander: {crisisId: string; eventId: string};
};

export type MainTabParamList = {
  Feed: undefined;
  Report: undefined;
  Settings: undefined;
};

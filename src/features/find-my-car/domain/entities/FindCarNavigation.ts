export type NavigationMode = 'gps' | 'indoor';

export type FindCarNavigation = {
  targetId: string;
  targetLevel?: string;
  targetZone?: string;
  savedAt: Date;
  distance: number | null;
  bearing: number | null;
  relativeBearing: number | null;
  compassHeading: number;
  mode: NavigationMode;
  currentLevel: string;
  directionLabel: string;
  floorDelta: number | null;
};

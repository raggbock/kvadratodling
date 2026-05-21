import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

export type SunRequirement = 'full' | 'partial' | 'shade';
export type WaterRequirement = 'low' | 'medium' | 'high';
export type ZoneId = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6' | 'Z7' | 'Z8';

export interface PlantTiming {
  sowIndoorsDaysBeforeFrost: number | null;
  directSowDaysBeforeFrost: number | null;
  transplantDaysAfterFrost: number | null;
  daysToMaturityMin: number;
  daysToMaturityMax: number;
}

export interface PlantZones {
  min: ZoneId;
  max: ZoneId;
  note: string | null;
}

export interface Plant {
  slug: string;
  name: string;
  nameSv: string;
  family: string;
  plantsPerSquare: number;
  sunRequirement: SunRequirement;
  waterRequirement: WaterRequirement;
  timing: PlantTiming;
  zones: PlantZones;
  description: string;
  tips: string;
  emoji: string;
  tags: string[];
  pests: string[];
  diseases: string[];
}

let _plants: Plant[] | null = null;

export function getAllPlants(): Plant[] {
  if (_plants) return _plants;
  const filePath = join(process.cwd(), 'data', 'plants', 'plants.yaml');
  const raw = readFileSync(filePath, 'utf8');
  _plants = yaml.load(raw) as Plant[];
  return _plants;
}

export function getPlantBySlug(slug: string): Plant | undefined {
  return getAllPlants().find((p) => p.slug === slug);
}

import type { CityPropDefinition, ViewportSize } from '../scene/sceneTypes';
import type { IntensityConfig } from './config';
import { seededRandom } from './seededRandom';
import type { SimulationStatus } from './types';

export interface MovingPerson {
  id: string;
  x: number;
  y: number;
  direction: -1 | 1;
  escaped: boolean;
  color: string;
}

export interface OccupantState {
  id: string;
  x: number;
  y: number;
  escaped: boolean;
}

export interface MovingVehicle {
  id: string;
  variant: CityPropDefinition['variant'];
  x: number;
  y: number;
  direction: -1 | 1;
  broken: boolean;
  escaped: boolean;
  color: string;
}

export interface EvacuationSnapshot {
  active: boolean;
  people: MovingPerson[];
  occupants: OccupantState[];
  vehicles: MovingVehicle[];
}

export class EvacuationController {
  private readonly viewport: ViewportSize;
  private readonly breakdownIndex: number;
  private active = false;
  private elapsedMs = 0;
  private people: MovingPerson[];
  private occupants: OccupantState[];
  private vehicles: MovingVehicle[];
  private readonly personDelays: number[];
  private readonly occupantDelays: number[];
  private readonly vehicleDelays: number[];

  constructor(props: CityPropDefinition[], viewport: ViewportSize, seed = 1) {
    this.viewport = viewport;
    const random = seededRandom(seed);
    this.people = props
      .filter((prop) => prop.kind === 'pedestrian')
      .map((prop) => ({
        id: prop.id,
        x: prop.x,
        y: prop.y,
        direction: prop.direction ?? (random() > 0.5 ? 1 : -1),
        escaped: false,
        color: prop.color,
      }));
    this.personDelays = this.people.map((_, index) => 650 + index * 160);
    this.vehicles = props
      .filter((prop) => prop.kind === 'vehicle')
      .map((prop) => ({
        id: prop.id,
        variant: prop.variant,
        x: prop.x,
        y: prop.y,
        direction: prop.direction ?? 1,
        broken: false,
        escaped: false,
        color: prop.color,
      }));
    this.vehicleDelays = this.vehicles.map((_, index) => 900 + index * 220);
    this.breakdownIndex = Math.floor(random() * Math.max(1, this.vehicles.length));
    this.occupants = Array.from({ length: 5 }, (_, index) => ({
      id: `occupant-${index}`,
      x: viewport.width * (0.44 + index * 0.03),
      y: viewport.height * 0.42,
      escaped: false,
    }));
    this.occupantDelays = this.occupants.map((_, index) => 1200 + index * 180);
  }

  update(deltaMs: number, status: SimulationStatus, intensity: IntensityConfig): EvacuationSnapshot {
    if (status !== 'running') return this.snapshot();
    const delta = Math.max(0, Math.min(deltaMs, 1000));
    this.active = true;
    this.elapsedMs += delta;

    this.people = this.people.map((person, index) => {
      if (person.escaped) return person;
      const movementMs = Math.max(0, Math.min(delta, this.elapsedMs - this.personDelays[index]));
      const x = person.x + person.direction * movementMs * (0.055 + intensity.level * 0.008);
      return { ...person, x, escaped: x < -20 || x > this.viewport.width + 20 };
    });

    this.occupants = this.occupants.map((occupant, index) => {
      if (occupant.escaped) return occupant;
      const movementMs = Math.max(0, Math.min(delta, this.elapsedMs - this.occupantDelays[index]));
      const y = Math.min(this.viewport.height * 0.8, occupant.y + movementMs * 0.045);
      return { ...occupant, y, escaped: y >= this.viewport.height * 0.8 };
    });

    this.vehicles = this.vehicles.map((vehicle, index) => {
      const shouldBreak = intensity.level >= 5 && this.elapsedMs >= 1500 && index === this.breakdownIndex;
      if (vehicle.broken || vehicle.escaped || shouldBreak) {
        return shouldBreak ? { ...vehicle, broken: true } : vehicle;
      }
      const movementMs = Math.max(0, Math.min(delta, this.elapsedMs - this.vehicleDelays[index]));
      const x = vehicle.x + vehicle.direction * movementMs * (0.15 + intensity.level * 0.018);
      return { ...vehicle, x, escaped: x < -120 || x > this.viewport.width + 120 };
    });

    return this.snapshot();
  }

  snapshot(): EvacuationSnapshot {
    return {
      active: this.active,
      people: this.people.map((person) => ({ ...person })),
      occupants: this.occupants.map((occupant) => ({ ...occupant })),
      vehicles: this.vehicles.map((vehicle) => ({ ...vehicle })),
    };
  }
}

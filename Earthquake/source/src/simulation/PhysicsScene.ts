import { Bodies, Body, Composite, Constraint, Engine } from 'matter-js';
import { createCityPropDefinitions } from '../scene/cityProps';
import type { CityPropDefinition, LandmarkDefinition, ViewportSize } from '../scene/sceneTypes';
import type { LandmarkId } from './types';
import type { IntensityConfig } from './config';

export interface PhysicsBodySnapshot {
  id: string;
  kind: 'landmark' | 'ground';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  fixed: boolean;
}

export interface PhysicsConstraintSnapshot {
  id: string;
  a: string;
  b: string;
  breakThreshold: number;
  stress: number;
  broken: boolean;
}

export interface PhysicsSnapshot {
  engineId: number;
  landmarkId: LandmarkId | null;
  mounted: boolean;
  frozen: boolean;
  elapsedMs: number;
  bodies: PhysicsBodySnapshot[];
  constraints: PhysicsConstraintSnapshot[];
  cityProps: CityPropDefinition[];
}

interface ConstraintEntry {
  definition: PhysicsConstraintSnapshot;
  constraint: Constraint;
}

let nextEngineId = 1;

export class PhysicsScene {
  private readonly engine = Engine.create({ gravity: { x: 0, y: 0.82 } });
  private readonly engineId = nextEngineId++;
  private readonly seed: number;
  private bodies = new Map<string, Body>();
  private entries = new Map<string, ConstraintEntry>();
  private definition: LandmarkDefinition | null = null;
  private viewport: ViewportSize | null = null;
  private cityProps: CityPropDefinition[] = [];
  private mounted = false;
  private frozen = false;
  private elapsedMs = 0;

  constructor(seed = 1) {
    this.seed = seed;
  }

  mount(definition: LandmarkDefinition, viewport: ViewportSize): void {
    Composite.clear(this.engine.world, false, true);
    this.bodies.clear();
    this.entries.clear();
    this.definition = definition;
    this.viewport = viewport;
    this.cityProps = createCityPropDefinitions(viewport);
    this.elapsedMs = 0;
    this.frozen = false;
    this.mounted = true;

    const groundHeight = Math.max(20, viewport.height * 0.025);
    const ground = Bodies.rectangle(viewport.width / 2, viewport.height - groundHeight / 2, viewport.width * 1.4, groundHeight, {
      isStatic: true,
      label: 'ground',
      friction: 0.92,
    });
    this.bodies.set('ground', ground);

    for (const section of definition.sections) {
      const width = Math.max(6, section.width * viewport.width * 0.62);
      const height = Math.max(6, section.height * viewport.height * 0.82);
      const x = viewport.width * (0.19 + section.x * 0.62) + width / 2;
      const y = viewport.height * (0.02 + section.y * 0.82) + height / 2;
      const body = Bodies.rectangle(x, y, width, height, {
        isStatic: Boolean(section.fixed),
        label: `${definition.id}:${section.id}`,
        angle: section.angle ?? 0,
        density: 0.004,
        friction: 0.76,
        frictionAir: 0.022,
        restitution: 0.03,
      });
      this.bodies.set(section.id, body);
    }

    Composite.add(this.engine.world, [...this.bodies.values()]);

    for (const definitionConstraint of definition.constraints) {
      const bodyA = this.bodies.get(definitionConstraint.a);
      const bodyB = this.bodies.get(definitionConstraint.b);
      if (!bodyA || !bodyB) continue;
      const constraint = Constraint.create({
        bodyA,
        bodyB,
        stiffness: definitionConstraint.stiffness,
        damping: definitionConstraint.damping,
        length: Math.hypot(bodyA.position.x - bodyB.position.x, bodyA.position.y - bodyB.position.y),
        label: definitionConstraint.id,
      });
      this.entries.set(definitionConstraint.id, {
        constraint,
        definition: {
          id: definitionConstraint.id,
          a: definitionConstraint.a,
          b: definitionConstraint.b,
          breakThreshold: definitionConstraint.breakThreshold,
          stress: 0,
          broken: false,
        },
      });
      Composite.add(this.engine.world, constraint);
    }
  }

  step(deltaMs: number, intensity: IntensityConfig): void {
    if (!this.mounted || this.frozen || !this.definition) return;
    const clampedDelta = Math.max(0, Math.min(deltaMs, 50));
    this.elapsedMs += clampedDelta;
    const phase = this.elapsedMs * 0.001 * intensity.frequency * Math.PI * 2 + this.seed * 0.13;
    const horizontal = Math.sin(phase) * intensity.amplitude * 0.00018;
    const vertical = Math.cos(phase * 0.63) * intensity.verticalImpulse * 0.00009;

    for (const [id, body] of this.bodies) {
      if (id === 'ground' || body.isStatic) continue;
      Body.applyForce(body, body.position, { x: horizontal * body.mass, y: vertical * body.mass });
    }

    for (const entry of this.entries.values()) {
      if (entry.definition.broken) continue;
      entry.definition.stress += Math.abs(horizontal) * intensity.stressMultiplier * clampedDelta * 18;
    }

    Engine.update(this.engine, clampedDelta);
  }

  breakConstraints(ids: readonly string[]): void {
    for (const id of ids) {
      const entry = this.entries.get(id);
      if (!entry || entry.definition.broken) continue;
      entry.definition.broken = true;
      Composite.remove(this.engine.world, entry.constraint);
    }
  }

  freeze(): void {
    if (!this.mounted) return;
    this.frozen = true;
  }

  destroy(): void {
    if (!this.mounted && this.bodies.size === 0) return;
    Composite.clear(this.engine.world, false, true);
    this.bodies.clear();
    this.entries.clear();
    this.cityProps = [];
    this.definition = null;
    this.viewport = null;
    this.mounted = false;
    this.frozen = false;
    this.elapsedMs = 0;
  }

  snapshot(): PhysicsSnapshot {
    if (!this.definition || !this.viewport) {
      return {
        engineId: this.engineId,
        landmarkId: null,
        mounted: false,
        frozen: false,
        elapsedMs: 0,
        bodies: [],
        constraints: [],
        cityProps: [],
      };
    }

    const sections = new Map(this.definition.sections.map((section) => [section.id, section]));
    const bodies = [...this.bodies.entries()].map(([id, body]): PhysicsBodySnapshot => {
      const section = sections.get(id);
      const boundsWidth = body.bounds.max.x - body.bounds.min.x;
      const boundsHeight = body.bounds.max.y - body.bounds.min.y;
      return {
        id: id === 'ground' ? 'ground' : `${this.definition!.id}:${id}`,
        kind: id === 'ground' ? 'ground' : 'landmark',
        x: body.position.x,
        y: body.position.y,
        width: boundsWidth,
        height: boundsHeight,
        angle: body.angle,
        fixed: id === 'ground' || Boolean(section?.fixed),
      };
    });

    return {
      engineId: this.engineId,
      landmarkId: this.definition.id,
      mounted: this.mounted,
      frozen: this.frozen,
      elapsedMs: this.elapsedMs,
      bodies,
      constraints: [...this.entries.values()].map((entry) => ({ ...entry.definition })),
      cityProps: this.cityProps.map((prop) => ({ ...prop })),
    };
  }
}

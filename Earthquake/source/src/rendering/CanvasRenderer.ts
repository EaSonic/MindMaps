import { getLandmarkDefinition } from '../scene/landmarks';
import type { CityPropDefinition, LandmarkSection } from '../scene/sceneTypes';
import type { DamageSnapshot, StreetlightState } from '../simulation/DamageController';
import type { EvacuationSnapshot, MovingPerson, MovingVehicle, OccupantState } from '../simulation/EvacuationController';
import type { PhysicsBodySnapshot, PhysicsSnapshot } from '../simulation/PhysicsScene';
import type { LandmarkId, SimulationState } from '../simulation/types';

interface RenderModel {
  state: SimulationState;
  snapshot: PhysicsSnapshot;
  damage: DamageSnapshot;
  evacuation: EvacuationSnapshot;
  reducedMotion: boolean;
}

export class CanvasRenderer {
  private readonly landmarkImages = new Map<LandmarkId, HTMLImageElement>();

  constructor(onArtworkReady: () => void = () => undefined) {
    if (typeof Image === 'undefined') return;

    for (const id of ['eiffel', 'pisa', 'empire', 'twin-towers'] as const) {
      const image = new Image();
      image.decoding = 'async';
      image.addEventListener('load', onArtworkReady, { once: true });
      image.src = getLandmarkDefinition(id).artwork;
      this.landmarkImages.set(id, image);
    }
  }

  render(canvas: HTMLCanvasElement, model: RenderModel): void {
    const parent = canvas.parentElement;
    const cssWidth = Math.max(360, parent?.clientWidth ?? 1200);
    const cssHeight = Math.max(430, parent?.clientHeight ?? 760);
    const pixelRatio = Math.min(globalThis.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * pixelRatio);
    canvas.height = Math.round(cssHeight * pixelRatio);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, cssWidth, cssHeight);

    const scaleX = cssWidth / 1200;
    const scaleY = cssHeight / 760;
    const shake = model.state.status === 'running' && !model.reducedMotion ? (model.state.strength - 1) * 0.8 : 0;
    const phase = model.snapshot.elapsedMs * 0.018;

    context.save();
    context.translate(Math.sin(phase) * shake, Math.cos(phase * 0.71) * shake * 0.28);
    context.scale(scaleX, scaleY);
    this.drawCity(context, model);
    context.restore();
  }

  private drawCity(context: CanvasRenderingContext2D, model: RenderModel): void {
    const { snapshot, state, damage, evacuation } = model;
    const streetTop = 590;

    this.drawDistantHaze(context);
    context.fillStyle = '#747b7d';
    context.fillRect(0, streetTop - 22, 1200, 38);
    context.fillStyle = '#d7d0c4';
    context.fillRect(0, streetTop + 16, 1200, 42);
    context.fillStyle = '#29313a';
    context.fillRect(0, streetTop + 58, 1200, 112);
    context.fillStyle = '#e5e2d8';
    for (let x = 10; x < 1200; x += 82) context.fillRect(x, streetTop + 110, 48, 5);
    context.fillStyle = '#d8d7d1';
    for (let x = 0; x < 1200; x += 52) context.fillRect(x, streetTop + 25, 34, 4);

    snapshot.cityProps.filter((prop) => prop.kind === 'tree').forEach((tree) => {
      this.drawTree(context, tree, damage.toppledTreeIds.includes(tree.id));
    });
    snapshot.cityProps.filter((prop) => prop.kind === 'streetlight').forEach((light) => {
      this.drawStreetlight(context, light, damage.lightStates[light.id] ?? 'on');
    });

    this.drawLandmark(context, model);

    const people = evacuation.people.length
      ? evacuation.people
      : snapshot.cityProps.filter((prop) => prop.kind === 'pedestrian').map((prop): MovingPerson => ({
          id: prop.id,
          x: prop.x,
          y: prop.y,
          direction: prop.direction ?? 1,
          escaped: false,
          color: prop.color,
        }));
    people.filter((person) => !person.escaped).forEach((person) => this.drawPerson(context, person, evacuation.active));
    evacuation.occupants.filter((occupant) => !occupant.escaped).forEach((occupant) => this.drawOccupant(context, occupant));

    const vehicles = evacuation.vehicles.length
      ? evacuation.vehicles
      : snapshot.cityProps.filter((prop) => prop.kind === 'vehicle').map((prop): MovingVehicle => ({
          id: prop.id,
          variant: prop.variant,
          x: prop.x,
          y: prop.y,
          direction: prop.direction ?? 1,
          broken: false,
          escaped: false,
          color: prop.color,
        }));
    vehicles.filter((vehicle) => !vehicle.escaped).forEach((vehicle) => this.drawVehicle(context, vehicle));

    if (damage.brokenConstraintIds.length > 0) this.drawDust(context, model);
  }

  private drawDistantHaze(context: CanvasRenderingContext2D): void {
    const gradient = context.createLinearGradient(0, 390, 0, 590);
    gradient.addColorStop(0, 'rgb(168 193 209 / 0)');
    gradient.addColorStop(1, 'rgb(104 125 136 / 0.26)');
    context.fillStyle = gradient;
    context.fillRect(0, 360, 1200, 230);
  }

  private drawTree(context: CanvasRenderingContext2D, tree: CityPropDefinition, toppled: boolean): void {
    context.save();
    context.translate(tree.x + tree.width / 2, tree.y + tree.height);
    context.rotate(toppled ? -1.16 : 0);
    context.fillStyle = '#5d3f2b';
    context.fillRect(-4, -tree.height * 0.58, 8, tree.height * 0.58);
    const gradient = context.createRadialGradient(0, -tree.height * 0.72, 5, 0, -tree.height * 0.72, tree.width * 0.52);
    gradient.addColorStop(0, '#6b994e');
    gradient.addColorStop(1, tree.color);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, -tree.height * 0.72, tree.width * 0.48, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  private drawStreetlight(context: CanvasRenderingContext2D, light: CityPropDefinition, state: StreetlightState): void {
    context.save();
    context.translate(light.x, light.y);
    context.fillStyle = light.color;
    context.fillRect(7, 10, 4, light.height - 10);
    context.beginPath();
    context.moveTo(9, 12);
    context.quadraticCurveTo(9, 1, 20, 1);
    context.strokeStyle = light.color;
    context.lineWidth = 4;
    context.stroke();
    const glowing = state === 'on' || (state === 'flicker' && Math.floor(performance.now() / 130) % 2 === 0);
    context.fillStyle = glowing ? '#f7db8c' : '#4c5660';
    context.shadowColor = glowing ? '#ffe2a0' : 'transparent';
    context.shadowBlur = glowing ? 14 : 0;
    context.beginPath();
    context.arc(21, 5, 6, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  private drawLandmark(context: CanvasRenderingContext2D, model: RenderModel): void {
    const definition = getLandmarkDefinition(model.state.landmark);
    const artwork = this.landmarkImages.get(model.state.landmark);
    const sections = new Map(definition.sections.map((section) => [section.id, section]));
    const landmarkBodies = model.snapshot.bodies.filter((body) => body.kind === 'landmark');

    context.save();
    context.shadowColor = 'rgb(17 26 35 / 0.38)';
    context.shadowBlur = 8;
    context.shadowOffsetY = 5;
    for (const body of landmarkBodies) {
      const sectionId = body.id.split(':').slice(1).join(':');
      const section = sections.get(sectionId);
      if (!section) continue;
      this.drawLandmarkSection(context, body, section, definition.palette, artwork);
    }
    context.restore();
  }

  private drawLandmarkSection(
    context: CanvasRenderingContext2D,
    body: PhysicsBodySnapshot,
    section: LandmarkSection,
    palette: { primary: string; secondary: string; detail: string; windows: string },
    artwork?: HTMLImageElement,
  ): void {
    context.save();
    context.translate(body.x, body.y);
    context.rotate(body.angle);
    const x = -body.width / 2;
    const y = -body.height / 2;
    context.beginPath();
    if (section.shape === 'trapezoid') {
      context.moveTo(x + body.width * 0.14, y);
      context.lineTo(x + body.width * 0.86, y);
      context.lineTo(x + body.width, y + body.height);
      context.lineTo(x, y + body.height);
    } else if (section.shape === 'spire') {
      context.moveTo(0, y);
      context.lineTo(x + body.width, y + body.height);
      context.lineTo(x, y + body.height);
    } else {
      context.rect(x, y, body.width, body.height);
    }
    context.closePath();

    const artworkReady = Boolean(artwork?.complete && artwork.naturalWidth > 0 && artwork.naturalHeight > 0);
    if (artworkReady && artwork) {
      context.save();
      context.clip();
      context.drawImage(
        artwork,
        section.x * artwork.naturalWidth,
        section.y * artwork.naturalHeight,
        section.width * artwork.naturalWidth,
        section.height * artwork.naturalHeight,
        x,
        y,
        body.width,
        body.height,
      );
      context.restore();
    } else {
      const gradient = context.createLinearGradient(x, 0, -x, 0);
      gradient.addColorStop(0, palette.detail);
      gradient.addColorStop(0.32, palette.primary);
      gradient.addColorStop(0.72, palette.secondary);
      gradient.addColorStop(1, palette.detail);
      context.fillStyle = gradient;
      context.fill();
    }

    if (!artworkReady) {
      context.strokeStyle = palette.detail;
      context.lineWidth = Math.max(1.2, body.width * 0.018);
      context.stroke();
    }

    context.shadowColor = 'transparent';
    if (!artworkReady && section.detail === 'lattice') this.drawLattice(context, body, palette.detail);
    if (!artworkReady && section.detail === 'windows') this.drawWindows(context, body, palette.windows);
    if (!artworkReady && section.detail === 'columns') this.drawColumns(context, body, palette.detail);
    context.restore();
  }

  private drawLattice(context: CanvasRenderingContext2D, body: PhysicsBodySnapshot, color: string): void {
    const x = -body.width / 2;
    const y = -body.height / 2;
    context.strokeStyle = color;
    context.lineWidth = 1.1;
    const segments = Math.max(2, Math.floor(body.height / 18));
    for (let index = 0; index < segments; index += 1) {
      const top = y + (index / segments) * body.height;
      const bottom = y + ((index + 1) / segments) * body.height;
      context.beginPath();
      context.moveTo(x + body.width * 0.12, top);
      context.lineTo(x + body.width * 0.88, bottom);
      context.moveTo(x + body.width * 0.88, top);
      context.lineTo(x + body.width * 0.12, bottom);
      context.stroke();
    }
  }

  private drawWindows(context: CanvasRenderingContext2D, body: PhysicsBodySnapshot, color: string): void {
    const columns = Math.max(2, Math.floor(body.width / 18));
    const rows = Math.max(1, Math.floor(body.height / 17));
    const gapX = body.width / (columns + 1);
    const gapY = body.height / (rows + 1);
    context.fillStyle = color;
    for (let row = 1; row <= rows; row += 1) {
      for (let column = 1; column <= columns; column += 1) {
        context.fillRect(-body.width / 2 + column * gapX - 2, -body.height / 2 + row * gapY - 3, 4, 7);
      }
    }
  }

  private drawColumns(context: CanvasRenderingContext2D, body: PhysicsBodySnapshot, color: string): void {
    context.strokeStyle = color;
    context.lineWidth = 1.5;
    for (let column = 1; column < 7; column += 1) {
      const x = -body.width / 2 + (column / 7) * body.width;
      context.beginPath();
      context.moveTo(x, -body.height / 2 + 4);
      context.lineTo(x, body.height / 2 - 4);
      context.stroke();
    }
  }

  private drawPerson(context: CanvasRenderingContext2D, person: MovingPerson, running: boolean): void {
    context.save();
    context.translate(person.x, person.y);
    context.fillStyle = '#d1a17f';
    context.beginPath();
    context.arc(0, -24, 5, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = person.color;
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(0, -18);
    context.lineTo(0, -6);
    context.stroke();
    const stride = running ? Math.sin(person.x * 0.15) * 7 : 2;
    context.strokeStyle = '#26323c';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(0, -7);
    context.lineTo(-stride, 0);
    context.moveTo(0, -7);
    context.lineTo(stride, 0);
    context.stroke();
    context.restore();
  }

  private drawOccupant(context: CanvasRenderingContext2D, occupant: OccupantState): void {
    context.fillStyle = '#f3c97b';
    context.beginPath();
    context.arc(occupant.x, occupant.y, 3, 0, Math.PI * 2);
    context.fill();
  }

  private drawVehicle(context: CanvasRenderingContext2D, vehicle: MovingVehicle): void {
    const sizes: Record<string, { width: number; height: number }> = {
      ambulance: { width: 76, height: 34 },
      taxi: { width: 64, height: 28 },
      compact: { width: 55, height: 26 },
      large: { width: 92, height: 42 },
    };
    const size = sizes[vehicle.variant] ?? sizes.compact;
    context.save();
    context.translate(vehicle.x, vehicle.y);
    if (vehicle.direction < 0) context.scale(-1, 1);
    context.rotate(vehicle.broken ? -0.05 : 0);
    context.fillStyle = vehicle.color;
    context.beginPath();
    context.roundRect(0, -size.height, size.width, size.height - 7, 6);
    context.fill();
    context.fillStyle = '#9fc0cf';
    context.fillRect(size.width * 0.17, -size.height + 5, size.width * 0.36, size.height * 0.36);
    if (vehicle.variant === 'ambulance') {
      context.fillStyle = '#d8413c';
      context.fillRect(size.width * 0.58, -size.height * 0.7, 15, 5);
      context.fillRect(size.width * 0.58 + 5, -size.height * 0.7 - 5, 5, 15);
    }
    if (vehicle.variant === 'taxi') {
      context.fillStyle = '#222';
      context.fillRect(size.width * 0.42, -size.height - 4, 14, 5);
    }
    context.fillStyle = '#141b22';
    context.beginPath();
    context.arc(size.width * 0.22, -7, 8, 0, Math.PI * 2);
    context.arc(size.width * 0.78, -7, 8, 0, Math.PI * 2);
    context.fill();
    if (vehicle.broken) {
      context.fillStyle = '#6f7880';
      context.beginPath();
      context.arc(size.width * 0.8, -size.height - 6, 8, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  private drawDust(context: CanvasRenderingContext2D, model: RenderModel): void {
    const count = Math.min(28, model.damage.brokenConstraintIds.length * 4);
    context.fillStyle = 'rgb(166 150 127 / 0.36)';
    for (let index = 0; index < count; index += 1) {
      const angle = index * 2.399;
      const radius = 12 + (index % 7) * 8;
      const x = 600 + Math.cos(angle) * radius * 2;
      const y = 550 + Math.sin(angle) * radius;
      context.beginPath();
      context.arc(x, y, 6 + (index % 4) * 2, 0, Math.PI * 2);
      context.fill();
    }
  }

}

import type {Coordinates} from '@dnd-kit-vue/utilities';

export type {Coordinates};

export type DistanceMeasurement =
  | number
  | Coordinates
  | Pick<Coordinates, 'x'>
  | Pick<Coordinates, 'y'>;

export type Translate = Coordinates;

export interface ScrollCoordinates {
  initial: Coordinates;
  current: Coordinates;
  delta: Coordinates;
}

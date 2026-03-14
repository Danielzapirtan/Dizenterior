export interface FurnitureTemplate {
  id: string;
  name: string;
  width: number; // in cm
  height: number; // in cm
  color: string;
  type: 'rect' | 'circle' | 'sofa' | 'bed' | 'table';
}

export interface PlacedFurniture {
  id: string;
  templateId: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

export interface RoomDimensions {
  width: number; // in cm
  height: number; // in cm
}

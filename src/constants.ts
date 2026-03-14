import { FurnitureTemplate } from './types';

export const FURNITURE_LIBRARY: FurnitureTemplate[] = [
  { id: 'sofa-2', name: 'Canapea 2 locuri', width: 160, height: 90, color: '#4f46e5', type: 'sofa' },
  { id: 'sofa-3', name: 'Canapea 3 locuri', width: 220, height: 95, color: '#4338ca', type: 'sofa' },
  { id: 'bed-double', name: 'Pat Dublu', width: 150, height: 200, color: '#0891b2', type: 'bed' },
  { id: 'bed-king', name: 'Pat King Size', width: 180, height: 200, color: '#0e7490', type: 'bed' },
  { id: 'table-dining', name: 'Masă Dining', width: 180, height: 90, color: '#b45309', type: 'table' },
  { id: 'table-coffee', name: 'Măsuță de cafea', width: 100, height: 60, color: '#d97706', type: 'table' },
  { id: 'chair', name: 'Scaun', width: 50, height: 50, color: '#16a34a', type: 'rect' },
  { id: 'desk', name: 'Birou', width: 140, height: 70, color: '#2563eb', type: 'rect' },
  { id: 'wardrobe', name: 'Dulap', width: 120, height: 60, color: '#7c3aed', type: 'rect' },
  { id: 'plant', name: 'Plantă', width: 40, height: 40, color: '#15803d', type: 'circle' },
];

export const PIXELS_PER_CM = 2; // Scale factor

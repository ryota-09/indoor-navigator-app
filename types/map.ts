// Map element types
export enum ElementType {
  CORRIDOR = 'corridor',
  SHOP = 'shop',
  STAIRS = 'stairs',
  ELEVATOR = 'elevator',
  ESCALATOR = 'escalator',
  ENTRANCE = 'entrance',
  EXIT = 'exit',
  RESTROOM = 'restroom',
  INFORMATION = 'information',
  WAITING_AREA = 'waiting_area',
  PLATFORM = 'platform',
  TICKET_GATE = 'ticket_gate',
  WALL = 'wall',
  PILLAR = 'pillar'
}

// Template categories
export enum TemplateCategory {
  STATION = 'station',
  SHOPPING = 'shopping',
  OFFICE = 'office',
  HOSPITAL = 'hospital',
  AIRPORT = 'airport',
  EDUCATION = 'education',
  PARKING = 'parking',
  CUSTOM = 'custom'
}

// Connection types between elements
export enum ConnectionType {
  WALKABLE = 'walkable',
  DOOR = 'door',
  STAIRS_UP = 'stairs_up',
  STAIRS_DOWN = 'stairs_down',
  ELEVATOR_UP = 'elevator_up',
  ELEVATOR_DOWN = 'elevator_down',
  ESCALATOR_UP = 'escalator_up',
  ESCALATOR_DOWN = 'escalator_down'
}

// Base element interface
export interface MapElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  floor: number;
  name?: string;
  description?: string;
  accessibility?: {
    wheelchair: boolean;
    visuallyImpaired: boolean;
    hearingImpaired: boolean;
  };
  metadata?: Record<string, any>;
}

// Connection between elements
export interface ElementConnection {
  id: string;
  fromElementId: string;
  toElementId: string;
  type: ConnectionType;
  distance?: number; // in meters
  time?: number; // estimated time in seconds
  accessible: boolean;
  bidirectional: boolean;
}

// Floor information
export interface Floor {
  id: string;
  level: number;
  name: string;
  height?: number; // floor height in meters
  elements: MapElement[];
  connections: ElementConnection[];
}

// Complete map data structure
export interface MapData {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  floors: Floor[];
  metadata: {
    totalWidth: number;
    totalHeight: number;
    totalFloors: number;
    tags: string[];
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
      city?: string;
      country?: string;
    };
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isPublished: boolean;
  isTemplate: boolean;
  rating?: {
    average: number;
    count: number;
  };
  statistics?: {
    views: number;
    uses: number;
    shares: number;
  };
}

// Map template (simplified version for templates)
export interface MapTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  thumbnail?: string;
  previewUrl?: string;
  elements: MapElement[];
  metadata: {
    width: number;
    height: number;
    floors: number;
    tags: string[];
  };
  isOfficial: boolean;
  isPremium: boolean;
}

// Map validation rules
export interface MapValidationRules {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  maxFloors: number;
  maxElements: number;
  maxConnections: number;
  requiredElements: ElementType[];
}

// Map save request
export interface MapSaveRequest {
  name: string;
  description?: string;
  category: TemplateCategory;
  floors: Floor[];
  metadata: Partial<MapData['metadata']>;
  isPublished?: boolean;
  isTemplate?: boolean;
}

// Map query filters
export interface MapQueryFilters {
  category?: TemplateCategory;
  tags?: string[];
  createdBy?: string;
  isPublished?: boolean;
  isTemplate?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  sortBy?: 'createdAt' | 'updatedAt' | 'rating' | 'views';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
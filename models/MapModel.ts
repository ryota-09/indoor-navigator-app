import {
  ConnectionType,
  ElementConnection,
  ElementType,
  Floor,
  MapData,
  MapElement,
  MapValidationRules,
} from "../types/map";

export class MapModel {
  private static readonly DEFAULT_VALIDATION_RULES: MapValidationRules = {
    minWidth: 10,
    maxWidth: 1000,
    minHeight: 10,
    maxHeight: 1000,
    maxFloors: 20,
    maxElements: 1000,
    maxConnections: 2000,
    requiredElements: [ElementType.ENTRANCE],
  };

  // Validate map data against rules
  static validate(
    mapData: Partial<MapData>,
    rules: MapValidationRules = this.DEFAULT_VALIDATION_RULES
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check map dimensions
    if (mapData.metadata) {
      const { totalWidth, totalHeight, totalFloors } = mapData.metadata;

      if (
        totalWidth &&
        (totalWidth < rules.minWidth || totalWidth > rules.maxWidth)
      ) {
        errors.push(
          `Map width must be between ${rules.minWidth} and ${rules.maxWidth}`
        );
      }

      if (
        totalHeight &&
        (totalHeight < rules.minHeight || totalHeight > rules.maxHeight)
      ) {
        errors.push(
          `Map height must be between ${rules.minHeight} and ${rules.maxHeight}`
        );
      }

      if (totalFloors && totalFloors > rules.maxFloors) {
        errors.push(`Map cannot have more than ${rules.maxFloors} floors`);
      }
    }

    // Check floors and elements
    if (mapData.floors) {
      let totalElements = 0;
      let totalConnections = 0;
      const foundRequiredElements = new Set<ElementType>();

      mapData.floors.forEach((floor, index) => {
        // Validate floor structure
        if (!floor.level && floor.level !== 0) {
          errors.push(`Floor at index ${index} must have a level`);
        }

        if (!floor.name) {
          errors.push(`Floor at index ${index} must have a name`);
        }

        // Count elements and check required types
        if (floor.elements) {
          totalElements += floor.elements.length;
          floor.elements.forEach((element) => {
            foundRequiredElements.add(element.type);

            // Validate element properties
            if (!this.isValidElement(element)) {
              errors.push(
                `Invalid element ${element.id} on floor ${floor.level}`
              );
            }
          });
        }

        // Count connections
        if (floor.connections) {
          totalConnections += floor.connections.length;
        }
      });

      // Check total counts
      if (totalElements > rules.maxElements) {
        errors.push(`Map cannot have more than ${rules.maxElements} elements`);
      }

      if (totalConnections > rules.maxConnections) {
        errors.push(
          `Map cannot have more than ${rules.maxConnections} connections`
        );
      }

      // Check required elements
      rules.requiredElements.forEach((requiredType) => {
        if (!foundRequiredElements.has(requiredType)) {
          errors.push(`Map must have at least one ${requiredType} element`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate individual element
  private static isValidElement(element: MapElement): boolean {
    return !!(
      element.id &&
      element.type &&
      typeof element.x === "number" &&
      typeof element.y === "number" &&
      element.width > 0 &&
      element.height > 0 &&
      typeof element.floor === "number"
    );
  }

  // Auto-detect connections between elements
  static detectConnections(floor: Floor): ElementConnection[] {
    const connections: ElementConnection[] = [];
    const elements = floor.elements;

    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const connection = this.checkElementConnection(
          elements[i],
          elements[j]
        );
        if (connection) {
          connections.push(connection);
        }
      }
    }

    return connections;
  }

  // Check if two elements should be connected
  private static checkElementConnection(
    elem1: MapElement,
    elem2: MapElement
  ): ElementConnection | null {
    // Skip if elements are on different floors
    if (elem1.floor !== elem2.floor) {
      return null;
    }

    // Check if elements are adjacent
    const isAdjacent = this.areElementsAdjacent(elem1, elem2);
    if (!isAdjacent) {
      return null;
    }

    // Determine connection type based on element types
    const connectionType = this.determineConnectionType(elem1.type, elem2.type);
    if (!connectionType) {
      return null;
    }

    // Calculate distance
    const distance = this.calculateDistance(elem1, elem2);

    return {
      id: `${elem1.id}-${elem2.id}`,
      fromElementId: elem1.id,
      toElementId: elem2.id,
      type: connectionType,
      distance,
      time: Math.round(distance / 1.4), // Assume 1.4 m/s walking speed
      accessible: this.isConnectionAccessible(elem1, elem2),
      bidirectional: true,
    };
  }

  // Check if elements are adjacent
  private static areElementsAdjacent(
    elem1: MapElement,
    elem2: MapElement
  ): boolean {
    const threshold = 5; // pixels tolerance

    // Check horizontal adjacency
    const horizontallyAligned =
      Math.abs(elem1.y - elem2.y) < elem1.height + elem2.height &&
      (Math.abs(elem1.x + elem1.width - elem2.x) < threshold ||
        Math.abs(elem2.x + elem2.width - elem1.x) < threshold);

    // Check vertical adjacency
    const verticallyAligned =
      Math.abs(elem1.x - elem2.x) < elem1.width + elem2.width &&
      (Math.abs(elem1.y + elem1.height - elem2.y) < threshold ||
        Math.abs(elem2.y + elem2.height - elem1.y) < threshold);

    return horizontallyAligned || verticallyAligned;
  }

  // Determine connection type based on element types
  private static determineConnectionType(
    type1: ElementType,
    type2: ElementType
  ): ConnectionType | null {
    // Walls and pillars block connections
    if (
      type1 === ElementType.WALL ||
      type2 === ElementType.WALL ||
      type1 === ElementType.PILLAR ||
      type2 === ElementType.PILLAR
    ) {
      return null;
    }

    // Special connection types
    if (type1 === ElementType.STAIRS || type2 === ElementType.STAIRS) {
      return ConnectionType.STAIRS_UP; // Will need floor context to determine up/down
    }

    if (type1 === ElementType.ELEVATOR || type2 === ElementType.ELEVATOR) {
      return ConnectionType.ELEVATOR_UP;
    }

    if (type1 === ElementType.ESCALATOR || type2 === ElementType.ESCALATOR) {
      return ConnectionType.ESCALATOR_UP;
    }

    // Shop entrances require doors
    if (type1 === ElementType.SHOP || type2 === ElementType.SHOP) {
      return ConnectionType.DOOR;
    }

    // Default walkable connection
    return ConnectionType.WALKABLE;
  }

  // Calculate distance between element centers
  private static calculateDistance(
    elem1: MapElement,
    elem2: MapElement
  ): number {
    const center1 = {
      x: elem1.x + elem1.width / 2,
      y: elem1.y + elem1.height / 2,
    };
    const center2 = {
      x: elem2.x + elem2.width / 2,
      y: elem2.y + elem2.height / 2,
    };

    // Convert pixels to meters (assume 10 pixels = 1 meter)
    const pixelsPerMeter = 10;
    const dx = (center2.x - center1.x) / pixelsPerMeter;
    const dy = (center2.y - center1.y) / pixelsPerMeter;

    return Math.sqrt(dx * dx + dy * dy);
  }

  // Check if connection is accessible
  private static isConnectionAccessible(
    elem1: MapElement,
    elem2: MapElement
  ): boolean {
    // If either element has accessibility info, use it
    const elem1Accessible = elem1.accessibility?.wheelchair ?? true;
    const elem2Accessible = elem2.accessibility?.wheelchair ?? true;

    return elem1Accessible && elem2Accessible;
  }

  // Generate unique ID
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create empty map data
  static createEmptyMap(name: string, createdBy: string): MapData {
    const now = new Date();
    return {
      id: this.generateId(),
      name,
      category: "custom" as any,
      floors: [
        {
          id: this.generateId(),
          level: 0,
          name: "Ground Floor",
          elements: [],
          connections: [],
        },
      ],
      metadata: {
        totalWidth: 500,
        totalHeight: 500,
        totalFloors: 1,
        tags: [],
      },
      createdBy,
      createdAt: now,
      updatedAt: now,
      version: 1,
      isPublished: false,
      isTemplate: false,
    };
  }
}

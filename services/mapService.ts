import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  MapData, 
  MapSaveRequest, 
  MapQueryFilters,
  Floor,
  MapElement,
  ElementConnection 
} from '../types/map';
import { MapModel } from '../models/MapModel';

export class MapService {
  private static readonly COLLECTION_NAME = 'maps';
  private static readonly TEMPLATES_COLLECTION = 'mapTemplates';

  // Convert Firestore data to MapData
  private static firestoreToMapData(
    id: string, 
    data: DocumentData
  ): MapData {
    return {
      id,
      name: data.name,
      description: data.description,
      category: data.category,
      floors: data.floors || [],
      metadata: data.metadata,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      version: data.version || 1,
      isPublished: data.isPublished || false,
      isTemplate: data.isTemplate || false,
      rating: data.rating,
      statistics: data.statistics
    };
  }

  // Convert MapData to Firestore format
  private static mapDataToFirestore(mapData: Partial<MapData>): DocumentData {
    const data: DocumentData = {
      ...mapData,
      createdAt: mapData.createdAt ? Timestamp.fromDate(mapData.createdAt) : Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Remove undefined fields
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    return data;
  }

  // Save a new map
  static async saveMap(
    request: MapSaveRequest, 
    userId: string
  ): Promise<MapData> {
    try {
      // Create map data
      const mapId = MapModel.generateId();
      const now = new Date();
      
      const mapData: MapData = {
        id: mapId,
        name: request.name,
        description: request.description,
        category: request.category,
        floors: request.floors,
        metadata: {
          totalWidth: request.metadata?.totalWidth || 500,
          totalHeight: request.metadata?.totalHeight || 500,
          totalFloors: request.floors.length,
          tags: request.metadata?.tags || [],
          location: request.metadata?.location
        },
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        version: 1,
        isPublished: request.isPublished || false,
        isTemplate: request.isTemplate || false
      };

      // Validate map data
      const validation = MapModel.validate(mapData);
      if (!validation.isValid) {
        throw new Error(`Map validation failed: ${validation.errors.join(', ')}`);
      }

      // Auto-detect connections if not provided
      mapData.floors = mapData.floors.map(floor => ({
        ...floor,
        connections: floor.connections?.length > 0 
          ? floor.connections 
          : MapModel.detectConnections(floor)
      }));

      // Save to Firestore
      const docRef = doc(db, this.COLLECTION_NAME, mapId);
      await setDoc(docRef, this.mapDataToFirestore(mapData));

      return mapData;
    } catch (error) {
      console.error('Error saving map:', error);
      throw error;
    }
  }

  // Update existing map
  static async updateMap(
    mapId: string, 
    updates: Partial<MapData>,
    userId: string
  ): Promise<MapData> {
    try {
      // Get existing map
      const existingMap = await this.getMap(mapId);
      if (!existingMap) {
        throw new Error('Map not found');
      }

      // Check ownership
      if (existingMap.createdBy !== userId) {
        throw new Error('Unauthorized to update this map');
      }

      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: new Date(),
        version: existingMap.version + 1
      };

      // Validate if floors are being updated
      if (updates.floors) {
        const validation = MapModel.validate({ ...existingMap, ...updates });
        if (!validation.isValid) {
          throw new Error(`Map validation failed: ${validation.errors.join(', ')}`);
        }

        // Auto-detect connections for updated floors
        updateData.floors = updates.floors.map(floor => ({
          ...floor,
          connections: floor.connections?.length > 0 
            ? floor.connections 
            : MapModel.detectConnections(floor)
        }));
      }

      // Update in Firestore
      const docRef = doc(db, this.COLLECTION_NAME, mapId);
      await updateDoc(docRef, this.mapDataToFirestore(updateData));

      // Return updated map
      return {
        ...existingMap,
        ...updateData
      };
    } catch (error) {
      console.error('Error updating map:', error);
      throw error;
    }
  }

  // Get a single map
  static async getMap(mapId: string): Promise<MapData | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, mapId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.firestoreToMapData(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Error getting map:', error);
      throw error;
    }
  }

  // Query maps with filters
  static async queryMaps(filters: MapQueryFilters = {}): Promise<{
    maps: MapData[];
    lastDoc: QueryDocumentSnapshot | null;
  }> {
    try {
      let q = query(collection(db, this.COLLECTION_NAME));

      // Apply filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters.createdBy) {
        q = query(q, where('createdBy', '==', filters.createdBy));
      }
      
      if (filters.isPublished !== undefined) {
        q = query(q, where('isPublished', '==', filters.isPublished));
      }
      
      if (filters.isTemplate !== undefined) {
        q = query(q, where('isTemplate', '==', filters.isTemplate));
      }

      // Apply sorting
      const sortField = filters.sortBy || 'createdAt';
      const sortDirection = filters.sortOrder || 'desc';
      q = query(q, orderBy(sortField, sortDirection));

      // Apply pagination
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      // Execute query
      const querySnapshot = await getDocs(q);
      const maps: MapData[] = [];
      let lastDoc: QueryDocumentSnapshot | null = null;

      querySnapshot.forEach((doc) => {
        maps.push(this.firestoreToMapData(doc.id, doc.data()));
        lastDoc = doc;
      });

      // Filter by location if specified (client-side for now)
      if (filters.location) {
        const filteredMaps = maps.filter(map => {
          if (!map.metadata.location) return false;
          
          const distance = this.calculateDistance(
            filters.location!.latitude,
            filters.location!.longitude,
            map.metadata.location.latitude,
            map.metadata.location.longitude
          );
          
          return distance <= filters.location!.radius;
        });
        
        return { maps: filteredMaps, lastDoc };
      }

      return { maps, lastDoc };
    } catch (error) {
      console.error('Error querying maps:', error);
      throw error;
    }
  }

  // Delete a map
  static async deleteMap(mapId: string, userId: string): Promise<void> {
    try {
      // Get existing map to check ownership
      const existingMap = await this.getMap(mapId);
      if (!existingMap) {
        throw new Error('Map not found');
      }

      if (existingMap.createdBy !== userId) {
        throw new Error('Unauthorized to delete this map');
      }

      // Delete from Firestore
      const docRef = doc(db, this.COLLECTION_NAME, mapId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting map:', error);
      throw error;
    }
  }

  // Get user's maps
  static async getUserMaps(userId: string): Promise<MapData[]> {
    const result = await this.queryMaps({ 
      createdBy: userId,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
    return result.maps;
  }

  // Publish/unpublish a map
  static async togglePublishStatus(
    mapId: string, 
    userId: string
  ): Promise<MapData> {
    const map = await this.getMap(mapId);
    if (!map) {
      throw new Error('Map not found');
    }

    return this.updateMap(
      mapId, 
      { isPublished: !map.isPublished }, 
      userId
    );
  }

  // Calculate distance between two coordinates (Haversine formula)
  private static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
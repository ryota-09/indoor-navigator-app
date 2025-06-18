import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Grid configuration
const GRID_SIZE = 20;
const CANVAS_WIDTH = screenWidth * 2;
const CANVAS_HEIGHT = screenHeight * 2;

// Template element types
export type ElementType = 'corridor' | 'shop' | 'stairs' | 'entrance' | 'restroom';

export interface MapElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export default function EditorScreen() {
  const colorScheme = useColorScheme();
  const [elements, setElements] = useState<MapElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ElementType | null>(null);
  
  // Undo/Redo state
  const [history, setHistory] = useState<MapElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const templates: { type: ElementType; name: string; color: string }[] = [
    { type: 'corridor', name: '通路', color: '#E0E0E0' },
    { type: 'shop', name: '店舗', color: '#FFE0B2' },
    { type: 'stairs', name: '階段', color: '#C8E6C9' },
    { type: 'entrance', name: '入口', color: '#FFCDD2' },
    { type: 'restroom', name: 'トイレ', color: '#E1BEE7' },
  ];

  const snapToGrid = (value: number): number => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const saveToHistory = (newElements: MapElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setElements(newElements);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements([...history[newIndex]]);
      setSelectedElement(null);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements([...history[newIndex]]);
      setSelectedElement(null);
    }
  };

  const generateGrid = () => {
    const gridLines: React.ReactNode[] = [];
    
    // Vertical lines
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      gridLines.push(
        <View
          key={`v-${x}`}
          style={[
            styles.gridLine,
            {
              left: x,
              height: CANVAS_HEIGHT,
              width: 1,
              backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault,
            },
          ]}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      gridLines.push(
        <View
          key={`h-${y}`}
          style={[
            styles.gridLine,
            {
              top: y,
              width: CANVAS_WIDTH,
              height: 1,
              backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault,
            },
          ]}
        />
      );
    }

    return gridLines;
  };

  const handleCanvasPress = (event: any) => {
    if (!selectedTemplate) return;

    const { locationX, locationY } = event.nativeEvent;
    const snappedX = snapToGrid(locationX);
    const snappedY = snapToGrid(locationY);

    const newElement: MapElement = {
      id: Date.now().toString(),
      type: selectedTemplate,
      x: snappedX,
      y: snappedY,
      width: GRID_SIZE * 3,
      height: GRID_SIZE * 2,
      rotation: 0,
    };

    saveToHistory([...elements, newElement]);
  };

  const handleElementPress = (elementId: string) => {
    setSelectedElement(elementId === selectedElement ? null : elementId);
  };

  const rotateElement = (elementId: string) => {
    const newElements = elements.map(element => 
      element.id === elementId 
        ? { ...element, rotation: (element.rotation + 30) % 360 }
        : element
    );
    saveToHistory(newElements);
  };

  const deleteElement = (elementId: string) => {
    const newElements = elements.filter(element => element.id !== elementId);
    saveToHistory(newElements);
    setSelectedElement(null);
  };

  const getElementColor = (type: ElementType): string => {
    return templates.find(t => t.type === type)?.color || '#E0E0E0';
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">マップエディタ</ThemedText>
        <View style={styles.undoRedoButtons}>
          <Pressable
            style={[
              styles.undoRedoButton,
              { 
                backgroundColor: historyIndex > 0 
                  ? Colors[colorScheme ?? 'light'].tint 
                  : Colors[colorScheme ?? 'light'].tabIconDefault,
              },
            ]}
            onPress={undo}
            disabled={historyIndex <= 0}
          >
            <Text style={[
              styles.undoRedoButtonText,
              { opacity: historyIndex > 0 ? 1 : 0.5 }
            ]}>
              元に戻す
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.undoRedoButton,
              { 
                backgroundColor: historyIndex < history.length - 1 
                  ? Colors[colorScheme ?? 'light'].tint 
                  : Colors[colorScheme ?? 'light'].tabIconDefault,
              },
            ]}
            onPress={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Text style={[
              styles.undoRedoButtonText,
              { opacity: historyIndex < history.length - 1 ? 1 : 0.5 }
            ]}>
              やり直し
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Template selector */}
      <ScrollView 
        horizontal 
        style={styles.templateSelector}
        showsHorizontalScrollIndicator={false}
      >
        {templates.map((template) => (
          <Pressable
            key={template.type}
            style={[
              styles.templateButton,
              selectedTemplate === template.type && styles.selectedTemplate,
            ]}
            onPress={() => setSelectedTemplate(
              selectedTemplate === template.type ? null : template.type
            )}
          >
            <View
              style={[
                styles.templatePreview,
                { backgroundColor: template.color },
              ]}
            />
            <Text style={styles.templateText}>{template.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Canvas */}
      <ScrollView
        style={styles.canvasContainer}
        contentContainerStyle={styles.canvasContent}
        maximumZoomScale={3}
        minimumZoomScale={0.5}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <Pressable
          style={[
            styles.canvas,
            { 
              width: CANVAS_WIDTH, 
              height: CANVAS_HEIGHT,
              backgroundColor: Colors[colorScheme ?? 'light'].background,
            },
          ]}
          onPress={handleCanvasPress}
        >
          {/* Grid */}
          {generateGrid()}

          {/* Elements */}
          {elements.map((element) => (
            <Pressable
              key={element.id}
              style={[
                styles.element,
                {
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  backgroundColor: getElementColor(element.type),
                  transform: [{ rotate: `${element.rotation}deg` }],
                  borderColor: selectedElement === element.id 
                    ? Colors[colorScheme ?? 'light'].tint 
                    : 'transparent',
                  borderWidth: selectedElement === element.id ? 2 : 0,
                },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleElementPress(element.id);
              }}
            >
              <Text style={styles.elementText}>
                {templates.find(t => t.type === element.type)?.name}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </ScrollView>

      {/* Action buttons */}
      {selectedElement && (
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => rotateElement(selectedElement)}
          >
            <Text style={styles.actionButtonText}>回転</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
            onPress={() => deleteElement(selectedElement)}
          >
            <Text style={styles.actionButtonText}>削除</Text>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  undoRedoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  undoRedoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  undoRedoButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  templateSelector: {
    maxHeight: 80,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  templateButton: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTemplate: {
    borderColor: '#007AFF',
  },
  templatePreview: {
    width: 40,
    height: 30,
    borderRadius: 4,
    marginBottom: 4,
  },
  templateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  canvasContainer: {
    flex: 1,
  },
  canvasContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  canvas: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  gridLine: {
    position: 'absolute',
    opacity: 0.3,
  },
  element: {
    position: 'absolute',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  elementText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
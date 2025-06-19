import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Grid configuration
const GRID_SIZE = 20;
const CANVAS_WIDTH = screenWidth * 2;
const CANVAS_HEIGHT = screenHeight * 2;

// Template element types
export type ElementType =
  | "corridor"
  | "shop"
  | "stairs"
  | "entrance"
  | "restroom";

export interface MapElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

// Map template interfaces
export type TemplateCategory =
  | "station"
  | "office"
  | "mall"
  | "hospital"
  | "school"
  | "restaurant";

export interface MapTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  thumbnail?: string;
  elements: MapElement[];
  metadata: {
    width: number;
    height: number;
    floors: number;
    tags: string[];
  };
}

// Template data
const mapTemplates: MapTemplate[] = [
  {
    id: "station_basic",
    name: "基本的な駅構内",
    category: "station",
    description: "駅の基本的なレイアウト（ホーム、改札、階段、トイレ）",
    elements: [
      {
        id: "1",
        type: "corridor",
        x: 100,
        y: 100,
        width: 200,
        height: 60,
        rotation: 0,
      },
      {
        id: "2",
        type: "entrance",
        x: 50,
        y: 100,
        width: 40,
        height: 60,
        rotation: 0,
      },
      {
        id: "3",
        type: "stairs",
        x: 320,
        y: 80,
        width: 60,
        height: 100,
        rotation: 0,
      },
      {
        id: "4",
        type: "restroom",
        x: 150,
        y: 200,
        width: 80,
        height: 60,
        rotation: 0,
      },
    ],
    metadata: {
      width: 400,
      height: 300,
      floors: 1,
      tags: ["駅", "基本", "交通"],
    },
  },
  {
    id: "office_basic",
    name: "オフィスビル基本レイアウト",
    category: "office",
    description: "オフィスビルの基本的なフロア構成",
    elements: [
      {
        id: "1",
        type: "corridor",
        x: 80,
        y: 120,
        width: 240,
        height: 40,
        rotation: 0,
      },
      {
        id: "2",
        type: "entrance",
        x: 180,
        y: 60,
        width: 40,
        height: 60,
        rotation: 0,
      },
      {
        id: "3",
        type: "stairs",
        x: 40,
        y: 80,
        width: 60,
        height: 120,
        rotation: 0,
      },
      {
        id: "4",
        type: "restroom",
        x: 340,
        y: 100,
        width: 60,
        height: 80,
        rotation: 0,
      },
    ],
    metadata: {
      width: 420,
      height: 220,
      floors: 1,
      tags: ["オフィス", "ビル", "ビジネス"],
    },
  },
  {
    id: "mall_basic",
    name: "ショッピングモール",
    category: "mall",
    description: "ショッピングモールの基本的な店舗配置",
    elements: [
      {
        id: "1",
        type: "corridor",
        x: 120,
        y: 100,
        width: 160,
        height: 40,
        rotation: 0,
      },
      {
        id: "2",
        type: "shop",
        x: 60,
        y: 60,
        width: 100,
        height: 80,
        rotation: 0,
      },
      {
        id: "3",
        type: "shop",
        x: 240,
        y: 60,
        width: 100,
        height: 80,
        rotation: 0,
      },
      {
        id: "4",
        type: "entrance",
        x: 190,
        y: 160,
        width: 40,
        height: 60,
        rotation: 0,
      },
      {
        id: "5",
        type: "restroom",
        x: 300,
        y: 160,
        width: 60,
        height: 60,
        rotation: 0,
      },
    ],
    metadata: {
      width: 380,
      height: 240,
      floors: 1,
      tags: ["ショッピング", "モール", "店舗"],
    },
  },
  {
    id: "hospital_basic",
    name: "病院基本レイアウト",
    category: "hospital",
    description: "病院の基本的なフロア構成",
    elements: [
      {
        id: "1",
        type: "corridor",
        x: 100,
        y: 120,
        width: 200,
        height: 40,
        rotation: 0,
      },
      {
        id: "2",
        type: "entrance",
        x: 190,
        y: 60,
        width: 40,
        height: 60,
        rotation: 0,
      },
      {
        id: "3",
        type: "stairs",
        x: 320,
        y: 80,
        width: 60,
        height: 100,
        rotation: 0,
      },
      {
        id: "4",
        type: "restroom",
        x: 40,
        y: 140,
        width: 60,
        height: 60,
        rotation: 0,
      },
    ],
    metadata: {
      width: 400,
      height: 220,
      floors: 1,
      tags: ["病院", "医療", "ヘルスケア"],
    },
  },
  {
    id: "school_basic",
    name: "学校基本レイアウト",
    category: "school",
    description: "学校の基本的な校舎レイアウト",
    elements: [
      {
        id: "1",
        type: "corridor",
        x: 80,
        y: 100,
        width: 240,
        height: 40,
        rotation: 0,
      },
      {
        id: "2",
        type: "entrance",
        x: 190,
        y: 40,
        width: 40,
        height: 60,
        rotation: 0,
      },
      {
        id: "3",
        type: "stairs",
        x: 40,
        y: 60,
        width: 60,
        height: 120,
        rotation: 0,
      },
      {
        id: "4",
        type: "restroom",
        x: 340,
        y: 80,
        width: 60,
        height: 80,
        rotation: 0,
      },
    ],
    metadata: {
      width: 420,
      height: 180,
      floors: 1,
      tags: ["学校", "教育", "キャンパス"],
    },
  },
  {
    id: "restaurant_basic",
    name: "レストラン基本レイアウト",
    category: "restaurant",
    description: "レストランの基本的な店舗レイアウト",
    elements: [
      {
        id: "1",
        type: "corridor",
        x: 120,
        y: 80,
        width: 160,
        height: 40,
        rotation: 0,
      },
      {
        id: "2",
        type: "entrance",
        x: 190,
        y: 40,
        width: 40,
        height: 60,
        rotation: 0,
      },
      {
        id: "3",
        type: "shop",
        x: 60,
        y: 140,
        width: 120,
        height: 80,
        rotation: 0,
      },
      {
        id: "4",
        type: "shop",
        x: 220,
        y: 140,
        width: 120,
        height: 80,
        rotation: 0,
      },
      {
        id: "5",
        type: "restroom",
        x: 360,
        y: 100,
        width: 60,
        height: 60,
        rotation: 0,
      },
    ],
    metadata: {
      width: 440,
      height: 240,
      floors: 1,
      tags: ["レストラン", "飲食", "店舗"],
    },
  },
];

export default function EditorScreen() {
  const colorScheme = useColorScheme();
  const [elements, setElements] = useState<MapElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ElementType | null>(
    "corridor"
  );
  const [draggingElement, setDraggingElement] = useState<string | null>(null);

  // Template selection modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory>("station");

  // ScrollView reference for auto-scrolling
  const canvasScrollViewRef = useRef<ScrollView>(null);

  // ドラッグ中の要素の表示状態
  const [draggedElementInfo, setDraggedElementInfo] = useState<{
    elementId: string;
    element: MapElement;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Chrome DevToolsでタッチイベントを有効にする手順:
  // 1. F12でDevToolsを開く
  // 2. Device Toolbarアイコン（📱）をクリック（Ctrl/Cmd + Shift + M）
  // 3. デバイスを iPhone に設定
  // 4. 3点メニュー（⋮）→ More tools → Sensors をクリック
  // 5. Touch の項目を "Force touch" に設定
  // 6. ページをリロード

  // Undo/Redo state
  const [history, setHistory] = useState<MapElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // プレビュー機能
  const [previewPosition, setPreviewPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isCanvasHovered, setIsCanvasHovered] = useState(false);

  // ツールモード
  const [toolMode, setToolMode] = useState<"select" | "place">("place");

  // 初期スクロール位置の設定（アプリ起動時にキャンバス中央を表示）
  useEffect(() => {
    const initializeScrollPosition = () => {
      if (canvasScrollViewRef.current) {
        const contentPadding = 40;
        const viewportWidth = screenWidth;
        const viewportHeight = screenHeight - 200; // ヘッダーやツールバーの高さを考慮
        
        // キャンバス中央が画面中央に来るようにスクロール位置を計算
        const scrollX = (CANVAS_WIDTH + contentPadding * 2 - viewportWidth) / 2;
        const scrollY = (CANVAS_HEIGHT + contentPadding * 2 - viewportHeight) / 2;
        
        canvasScrollViewRef.current.scrollTo({ 
          x: Math.max(0, scrollX), 
          y: Math.max(0, scrollY), 
          animated: false 
        });
      }
    };
    
    // 少し遅らせて実行（レンダリング完了後）
    setTimeout(initializeScrollPosition, 100);
  }, []);

  // クイックアクション
  const clearAll = () => {
    if (elements.length === 0) return;
    Alert.alert("全て削除", "すべての要素を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => saveToHistory([]) },
    ]);
  };

  const duplicateSelected = () => {
    if (!selectedElement) return;
    const elementToDuplicate = elements.find((e) => e.id === selectedElement);
    if (!elementToDuplicate) return;

    const newElement: MapElement = {
      ...elementToDuplicate,
      id: Date.now().toString(),
      x: elementToDuplicate.x + 20,
      y: elementToDuplicate.y + 20,
    };

    saveToHistory([...elements, newElement]);
  };

  const templates: { type: ElementType; name: string; color: string }[] = [
    { type: "corridor", name: "通路", color: "#F0F0F0" },
    { type: "shop", name: "店舗", color: "#FFE0B2" },
    { type: "stairs", name: "階段", color: "#C8E6C9" },
    { type: "entrance", name: "入口", color: "#FFCDD2" },
    { type: "restroom", name: "トイレ", color: "#E1BEE7" },
  ];

  const templateCategories: {
    category: TemplateCategory;
    name: string;
    icon: string;
  }[] = [
    { category: "station", name: "駅", icon: "🚉" },
    { category: "office", name: "オフィス", icon: "🏢" },
    { category: "mall", name: "モール", icon: "🛍️" },
    { category: "hospital", name: "病院", icon: "🏥" },
    { category: "school", name: "学校", icon: "🏫" },
    { category: "restaurant", name: "レストラン", icon: "🍽️" },
  ];

  // Template functions
  const loadMapTemplate = (template: MapTemplate) => {
    // テンプレートが空でないことを確認
    if (!template.elements || template.elements.length === 0) {
      console.error("❌ Template has no elements");
      return;
    }

    // テンプレートの境界を計算
    const templateBounds = template.elements.reduce(
      (bounds, element) => ({
        minX: Math.min(bounds.minX, element.x),
        minY: Math.min(bounds.minY, element.y),
        maxX: Math.max(bounds.maxX, element.x + element.width),
        maxY: Math.max(bounds.maxY, element.y + element.height),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    // テンプレートのサイズを計算
    const templateWidth = templateBounds.maxX - templateBounds.minX;
    const templateHeight = templateBounds.maxY - templateBounds.minY;

    // キャンバス中央に配置するためのオフセットを計算
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const offsetX = centerX - templateWidth / 2 - templateBounds.minX;
    const offsetY = centerY - templateHeight / 2 - templateBounds.minY;

    // 要素を中央に配置して新しいIDを付与
    const newElements = template.elements.map((element) => ({
      ...element,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      x: snapToGrid(element.x + offsetX),
      y: snapToGrid(element.y + offsetY),
    }));

    saveToHistory(newElements);
    setShowTemplateModal(false);
    setSelectedElement(null);

    // テンプレートロード後、配置された要素の中央が画面の中央に来るようにスクロール
    setTimeout(() => {
      if (canvasScrollViewRef.current && newElements.length > 0) {
        // 実際に配置された要素の境界を計算
        const placedBounds = newElements.reduce(
          (bounds, element) => ({
            minX: Math.min(bounds.minX, element.x),
            minY: Math.min(bounds.minY, element.y),
            maxX: Math.max(bounds.maxX, element.x + element.width),
            maxY: Math.max(bounds.maxY, element.y + element.height),
          }),
          { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
        );

        // 配置された要素群の中央座標を計算
        const placedCenterX = (placedBounds.minX + placedBounds.maxX) / 2;
        const placedCenterY = (placedBounds.minY + placedBounds.maxY) / 2;

        // contentContainerStyleのpaddingを考慮
        const contentPadding = 20;

        // ビューポートのサイズを取得（ScrollViewの表示領域）
        const viewportWidth = screenWidth;
        const viewportHeight = screenHeight - 200; // ヘッダーやツールバーの高さを考慮

        // スクロール位置を計算（配置された要素の中央が画面中央に来るように）
        const scrollX = placedCenterX - viewportWidth / 2 + contentPadding;
        const scrollY = placedCenterY - viewportHeight / 2 + contentPadding;

        console.log("Scroll Debug:", {
          placedCenterX,
          placedCenterY,
          viewportWidth,
          viewportHeight,
          scrollX,
          scrollY,
          canvasWidth: CANVAS_WIDTH,
          canvasHeight: CANVAS_HEIGHT,
        });

        // スクロール可能な最大値を計算
        const maxScrollX = Math.max(
          0,
          CANVAS_WIDTH + contentPadding * 2 - viewportWidth
        );
        const maxScrollY = Math.max(
          0,
          CANVAS_HEIGHT + contentPadding * 2 - viewportHeight
        );

        canvasScrollViewRef.current.scrollTo({
          x: Math.min(Math.max(0, scrollX), maxScrollX),
          y: Math.min(Math.max(0, scrollY), maxScrollY),
          animated: true,
        });
      }
    }, 200); // タイミングを少し遅らせる
  };

  const getTemplatesByCategory = (
    category: TemplateCategory
  ): MapTemplate[] => {
    return mapTemplates.filter((template) => template.category === category);
  };

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
              backgroundColor: Colors[colorScheme ?? "light"].tabIconDefault,
              zIndex: 1,
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
              backgroundColor: Colors[colorScheme ?? "light"].tabIconDefault,
              zIndex: 1,
            },
          ]}
        />
      );
    }

    return gridLines;
  };

  // マウス移動でプレビュー位置更新
  const handleCanvasMouseMove = (event: any) => {
    if (!selectedTemplate || !isCanvasHovered || draggingElement) return;

    let locationX, locationY;

    if (event.nativeEvent && event.nativeEvent.offsetX !== undefined) {
      locationX = event.nativeEvent.offsetX;
      locationY = event.nativeEvent.offsetY;
    } else {
      return;
    }

    const snappedX = snapToGrid(locationX);
    const snappedY = snapToGrid(locationY);

    setPreviewPosition({ x: snappedX, y: snappedY });
  };

  const handleCanvasMouseEnter = () => {
    setIsCanvasHovered(true);
  };

  const handleCanvasMouseLeave = () => {
    setIsCanvasHovered(false);
    setPreviewPosition(null);
  };

  const handleCanvasPress = (event: any) => {
    // ドラッグ中は新しい要素を作成しない
    if (draggingElement) return;

    // 既存の要素がクリックされた場合はスキップ
    if (
      event.target !== event.currentTarget &&
      event.target.getAttribute &&
      event.target.getAttribute("data-draggable-element")
    ) {
      return;
    }

    if (!selectedTemplate) {
      console.log("No template selected");
      return;
    }

    console.log("Canvas pressed with template:", selectedTemplate);

    let locationX, locationY;

    if (event.nativeEvent && event.nativeEvent.locationX !== undefined) {
      // React Native環境
      locationX = event.nativeEvent.locationX;
      locationY = event.nativeEvent.locationY;
    } else if (event.nativeEvent && event.nativeEvent.offsetX !== undefined) {
      // Web環境（マウス）
      locationX = event.nativeEvent.offsetX;
      locationY = event.nativeEvent.offsetY;
    } else if (
      event.nativeEvent &&
      event.nativeEvent.touches &&
      event.nativeEvent.touches[0]
    ) {
      // Web環境（タッチ）
      const touch = event.nativeEvent.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      locationX = touch.clientX - rect.left;
      locationY = touch.clientY - rect.top;
    } else {
      console.log("Could not get click coordinates", event.nativeEvent);
      return;
    }

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

    console.log("Creating element:", newElement);
    saveToHistory([...elements, newElement]);

    setPreviewPosition({ x: snappedX, y: snappedY });
  };

  const handleElementPress = (elementId: string) => {
    setSelectedElement(elementId === selectedElement ? null : elementId);
  };

  const rotateElement = (elementId: string) => {
    const newElements = elements.map((element) =>
      element.id === elementId
        ? { ...element, rotation: (element.rotation + 30) % 360 }
        : element
    );
    saveToHistory(newElements);
  };

  const deleteElement = (elementId: string) => {
    const newElements = elements.filter((element) => element.id !== elementId);
    saveToHistory(newElements);
    setSelectedElement(null);
  };

  const getElementColor = (type: ElementType): string => {
    return templates.find((t) => t.type === type)?.color || "#E0E0E0";
  };

  // 要素の位置更新（ドラッグ終了時）
  const updateElementPosition = (
    elementId: string,
    newX: number,
    newY: number
  ) => {
    const snappedX = snapToGrid(newX);
    const snappedY = snapToGrid(newY);

    console.log(
      `📍 updateElementPosition: ${elementId} to (${snappedX}, ${snappedY})`
    );

    const newElements = elements.map((element) =>
      element.id === elementId
        ? { ...element, x: snappedX, y: snappedY }
        : element
    );

    console.log("New elements array:", newElements);
    saveToHistory(newElements);
  };

  // 直感的な要素操作機能
  const [lastTapTime, setLastTapTime] = useState(0);

  // ダブルタップで回転
  const handleDoubleTap = (elementId: string) => {
    const newElements = elements.map((element) =>
      element.id === elementId
        ? { ...element, rotation: (element.rotation + 30) % 360 }
        : element
    );
    saveToHistory(newElements);
  };

  // ドラッグ終了時の処理
  const handleDragEnd = () => {
    setDraggedElementInfo(null);
  };

  // 改良されたWeb/Native両対応のドラッグ要素コンポーネント
  const DraggableElement = ({ element }: { element: MapElement }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const elementRef = useRef<View>(null);
    const isDraggingRef = useRef(false);
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const elementStartPosRef = useRef({ x: 0, y: 0 });
    const elementOffsetRef = useRef({ x: 0, y: 0 });

    // Web環境でのみDOM操作を行う（改良版）
    useEffect(() => {
      if (Platform.OS !== "web" || !elementRef.current) return;

      // React Native WebでDOM要素を取得する改良版
      // @ts-ignore
      let domElement = elementRef.current;

      // 複数の方法でDOM要素の取得を試行
      try {
        // 方法1: _nativeTagを使用（古いRN Web）
        // @ts-ignore
        if (
          elementRef.current._nativeTag &&
          typeof elementRef.current._nativeTag === "object"
        ) {
          // @ts-ignore
          domElement = elementRef.current._nativeTag;
        }
        // 方法2: getDOMNodeを使用（新しいRN Web）
        // @ts-ignore
        else if (
          elementRef.current.getDOMNode &&
          typeof elementRef.current.getDOMNode === "function"
        ) {
          // @ts-ignore
          domElement = elementRef.current.getDOMNode();
        }
        // 方法3: 直接DOM要素を確認
        // @ts-ignore
        else if (elementRef.current.nodeType) {
          // @ts-ignore
          domElement = elementRef.current;
        }
      } catch (error) {
        console.error("Failed to get DOM element:", error);
      }

      if (!domElement || typeof domElement.addEventListener !== "function") {
        console.log("DOM element not accessible for element:", element.id);
        // フォールバック: 直接elementRefを使用
        // @ts-ignore
        domElement = elementRef.current;
      }

      console.log("DOM element found for:", element.id, domElement);

      const handleStart = (
        clientX: number,
        clientY: number,
        elementRect?: DOMRect
      ) => {
        console.log("Drag start", element.id);

        // ダブルタップ検出
        const currentTime = Date.now();
        if (currentTime - lastTapTime < 300) {
          handleDoubleTap(element.id);
          setLastTapTime(0);
          return;
        }
        setLastTapTime(currentTime);

        isDraggingRef.current = true;

        // ドラッグ開始位置を記録
        dragStartPosRef.current = { x: clientX, y: clientY };
        elementStartPosRef.current = { x: element.x, y: element.y };

        // 要素内でのクリック位置を計算
        let offsetX = element.width / 2;
        let offsetY = element.height / 2;

        if (elementRect) {
          offsetX = clientX - elementRect.left;
          offsetY = clientY - elementRect.top;
        }

        elementOffsetRef.current = { x: offsetX, y: offsetY };

        setSelectedElement(element.id);
        runOnJS(setDraggingElement)(element.id);

        // ドラッグ情報を設定
        runOnJS(setDraggedElementInfo)({
          elementId: element.id,
          element: element,
          x: element.x,
          y: element.y,
          offsetX: offsetX,
          offsetY: offsetY,
        });

        scale.value = withSpring(1.1);
      };

      const handleMove = (clientX: number, clientY: number) => {
        if (!isDraggingRef.current) return;

        // ドラッグ開始位置からの移動量を計算
        const dx = clientX - dragStartPosRef.current.x;
        const dy = clientY - dragStartPosRef.current.y;

        translateX.value = dx;
        translateY.value = dy;

        // Canvas座標でのプレビュー位置更新
        const newX = elementStartPosRef.current.x + dx;
        const newY = elementStartPosRef.current.y + dy;

        runOnJS(setDraggedElementInfo)((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            x: newX,
            y: newY,
          };
        });
      };

      const handleEnd = () => {
        if (!isDraggingRef.current) return;

        console.log("Drag end", element.id);

        // 最終位置を計算
        const finalX = elementStartPosRef.current.x + translateX.value;
        const finalY = elementStartPosRef.current.y + translateY.value;

        // Canvasの範囲内に制限
        const boundedX = Math.max(
          0,
          Math.min(CANVAS_WIDTH - element.width, finalX)
        );
        const boundedY = Math.max(
          0,
          Math.min(CANVAS_HEIGHT - element.height, finalY)
        );

        runOnJS(updateElementPosition)(element.id, boundedX, boundedY);

        // アニメーションをリセット
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);

        isDraggingRef.current = false;
        runOnJS(setDraggingElement)(null);
        runOnJS(handleDragEnd)();
      };

      // マウスイベント
      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const elementRect = domElement.getBoundingClientRect();
        handleStart(e.clientX, e.clientY, elementRect);

        const onMouseMove = (e: MouseEvent) => {
          e.preventDefault();
          handleMove(e.clientX, e.clientY);
        };

        const onMouseUp = () => {
          handleEnd();
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      // タッチイベント
      const onTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        const elementRect = domElement.getBoundingClientRect();
        handleStart(touch.clientX, touch.clientY, elementRect);

        const onTouchMove = (e: TouchEvent) => {
          e.preventDefault();
          const touch = e.touches[0];
          handleMove(touch.clientX, touch.clientY);
        };

        const onTouchEnd = () => {
          handleEnd();
          document.removeEventListener("touchmove", onTouchMove);
          document.removeEventListener("touchend", onTouchEnd);
        };

        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", onTouchEnd);
      };

      try {
        domElement.addEventListener("mousedown", onMouseDown);
        domElement.addEventListener("touchstart", onTouchStart, {
          passive: false,
        });

        // スタイル設定（より確実な方法）
        if (domElement.style) {
          domElement.style.cursor = "move";
          domElement.style.touchAction = "none";
          domElement.style.userSelect = "none";
          domElement.style.webkitUserSelect = "none";
          domElement.style.webkitTouchCallout = "none";
          domElement.style.webkitUserDrag = "none";
          domElement.style.mozUserSelect = "none";
          domElement.style.msUserSelect = "none";
          domElement.style.pointerEvents = "auto";
        }

        // データ属性を追加してデバッグを容易にする
        if (domElement.setAttribute) {
          domElement.setAttribute("data-draggable-element", element.id);
          domElement.setAttribute("data-element-type", element.type);
        }
      } catch (error) {
        console.error("Failed to set up drag handlers:", error);
      }

      return () => {
        try {
          domElement.removeEventListener("mousedown", onMouseDown);
          domElement.removeEventListener("touchstart", onTouchStart);
        } catch (error) {
          console.error("Failed to cleanup event listeners:", error);
        }
      };
    }, [element.id]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotate: `${element.rotation}deg` },
          { scale: scale.value },
        ],
      };
    });

    return (
      <Animated.View
        ref={elementRef}
        style={[
          styles.element,
          {
            position: "absolute",
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            backgroundColor: getElementColor(element.type),
            borderColor:
              selectedElement === element.id
                ? Colors[colorScheme ?? "light"].tint
                : "#666",
            borderWidth: selectedElement === element.id ? 2 : 1,
            zIndex: draggingElement === element.id ? 200 : 100,
            opacity: draggingElement === element.id ? 0.3 : 1,
          },
          animatedStyle,
        ]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(event) => {
          if (Platform.OS !== "web") {
            // React Native環境でのタッチ処理
            const currentTime = Date.now();
            if (currentTime - lastTapTime < 300) {
              handleDoubleTap(element.id);
              setLastTapTime(0);
              return;
            }
            setLastTapTime(currentTime);
            setSelectedElement(element.id);
          }
        }}
      >
        <Text style={styles.elementText}>
          {templates.find((t) => t.type === element.type)?.name}
        </Text>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">
          マップエディタ ({elements.length}個)
        </ThemedText>
        <View style={styles.headerActions}>
          <Pressable
            style={[
              styles.templateButton,
              { backgroundColor: Colors[colorScheme ?? "light"].tint },
            ]}
            onPress={() => setShowTemplateModal(true)}
          >
            <Text style={styles.templateButtonText}>📋 テンプレート</Text>
          </Pressable>
          <View style={styles.undoRedoButtons}>
            <Pressable
              style={[
                styles.undoRedoButton,
                {
                  backgroundColor:
                    historyIndex > 0
                      ? Colors[colorScheme ?? "light"].tint
                      : Colors[colorScheme ?? "light"].tabIconDefault,
                },
              ]}
              onPress={undo}
              disabled={historyIndex <= 0}
            >
              <Text
                style={[
                  styles.undoRedoButtonText,
                  { opacity: historyIndex > 0 ? 1 : 0.5 },
                ]}
              >
                元に戻す
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.undoRedoButton,
                {
                  backgroundColor:
                    historyIndex < history.length - 1
                      ? Colors[colorScheme ?? "light"].tint
                      : Colors[colorScheme ?? "light"].tabIconDefault,
                },
              ]}
              onPress={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Text
                style={[
                  styles.undoRedoButtonText,
                  { opacity: historyIndex < history.length - 1 ? 1 : 0.5 },
                ]}
              >
                やり直し
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 改良されたツールバー */}
      <View style={styles.toolbar}>
        {/* テンプレート選択 */}
        <ScrollView
          horizontal
          style={styles.templateSection}
          showsHorizontalScrollIndicator={false}
        >
          {templates.map((template) => (
            <Pressable
              key={template.type}
              style={[
                styles.elementTemplateButton,
                selectedTemplate === template.type && styles.selectedTemplate,
              ]}
              onPress={() =>
                setSelectedTemplate(
                  selectedTemplate === template.type ? null : template.type
                )
              }
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

        {/* クイックアクションボタン */}
        <View style={styles.quickActions}>
          {selectedElement && (
            <>
              <Pressable
                style={[
                  styles.quickActionButton,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
                onPress={duplicateSelected}
              >
                <Text style={styles.quickActionText}>複製</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.quickActionButton,
                  { backgroundColor: "#FF6B6B" },
                ]}
                onPress={() => deleteElement(selectedElement)}
              >
                <Text style={styles.quickActionText}>削除</Text>
              </Pressable>
            </>
          )}
          {elements.length > 0 && (
            <Pressable
              style={[styles.quickActionButton, { backgroundColor: "#FFA726" }]}
              onPress={clearAll}
            >
              <Text style={styles.quickActionText}>全削除</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Canvas */}
      <ScrollView
        ref={canvasScrollViewRef}
        style={styles.canvasContainer}
        contentContainerStyle={styles.canvasContent}
        maximumZoomScale={3}
        minimumZoomScale={0.5}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={true}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View
          data-canvas="true"
          style={[
            styles.canvas,
            {
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              backgroundColor: Colors[colorScheme ?? "light"].background,
            },
          ]}
          ref={(ref) => {
            if (Platform.OS === "web" && ref) {
              // Web環境でCanvas要素に直接イベントリスナーを追加
              const setupCanvasEvents = () => {
                // @ts-ignore
                let canvasElement = ref;

                // DOM要素を取得
                try {
                  // @ts-ignore
                  if (ref._nativeTag && typeof ref._nativeTag === "object") {
                    // @ts-ignore
                    canvasElement = ref._nativeTag;
                  }
                  // @ts-ignore
                  else if (
                    ref.getDOMNode &&
                    typeof ref.getDOMNode === "function"
                  ) {
                    // @ts-ignore
                    canvasElement = ref.getDOMNode();
                  }
                } catch (error) {
                  console.error("Failed to get canvas DOM element:", error);
                }

                if (canvasElement && canvasElement.addEventListener) {
                  // クリックイベント
                  const handleClick = (e: MouseEvent) => {
                    // 要素がクリックされた場合はスキップ
                    const target = e.target as HTMLElement;
                    if (
                      target.getAttribute &&
                      target.getAttribute("data-draggable-element")
                    ) {
                      return;
                    }

                    const rect = canvasElement.getBoundingClientRect();
                    const mockEvent = {
                      nativeEvent: {
                        offsetX: e.clientX - rect.left,
                        offsetY: e.clientY - rect.top,
                      },
                      target: e.target,
                      currentTarget: canvasElement,
                    };
                    handleCanvasPress(mockEvent);
                  };

                  // マウス移動イベント
                  const handleMouseMove = (e: MouseEvent) => {
                    const rect = canvasElement.getBoundingClientRect();
                    const mockEvent = {
                      nativeEvent: {
                        offsetX: e.clientX - rect.left,
                        offsetY: e.clientY - rect.top,
                      },
                    };
                    handleCanvasMouseMove(mockEvent);
                  };

                  canvasElement.addEventListener("click", handleClick);
                  canvasElement.addEventListener("mousemove", handleMouseMove);
                  canvasElement.addEventListener(
                    "mouseenter",
                    handleCanvasMouseEnter
                  );
                  canvasElement.addEventListener(
                    "mouseleave",
                    handleCanvasMouseLeave
                  );

                  // クリーンアップ関数を保存
                  // @ts-ignore
                  canvasElement._cleanup = () => {
                    canvasElement.removeEventListener("click", handleClick);
                    canvasElement.removeEventListener(
                      "mousemove",
                      handleMouseMove
                    );
                    canvasElement.removeEventListener(
                      "mouseenter",
                      handleCanvasMouseEnter
                    );
                    canvasElement.removeEventListener(
                      "mouseleave",
                      handleCanvasMouseLeave
                    );
                  };
                }
              };

              // 次のフレームで実行
              setTimeout(setupCanvasEvents, 0);
            }
          }}
        >
          {/* Native環境用のPressable */}
          {Platform.OS !== "web" && (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={handleCanvasPress}
            />
          )}
          {/* Grid */}
          {generateGrid()}

          {/* Elements */}
          {elements.map((element) => (
            <DraggableElement key={element.id} element={element} />
          ))}

          {/* プレビュー要素 */}
          {selectedTemplate &&
            previewPosition &&
            isCanvasHovered &&
            !draggingElement && (
              <View
                style={[
                  styles.previewElement,
                  {
                    position: "absolute",
                    left: previewPosition.x,
                    top: previewPosition.y,
                    width: GRID_SIZE * 3,
                    height: GRID_SIZE * 2,
                    backgroundColor: getElementColor(selectedTemplate),
                    borderColor: Colors[colorScheme ?? "light"].tint,
                    borderWidth: 2,
                    borderStyle: "dashed",
                    opacity: 0.7,
                    zIndex: 50,
                  },
                ]}
                pointerEvents="none"
              >
                <Text style={styles.previewElementText}>
                  {templates.find((t) => t.type === selectedTemplate)?.name}
                </Text>
              </View>
            )}

          {/* Canvas内ドラッグプレビュー */}
          {draggingElement && draggedElementInfo && (
            <View
              style={[
                styles.dragPreviewInCanvas,
                {
                  position: "absolute",
                  left: snapToGrid(draggedElementInfo.x),
                  top: snapToGrid(draggedElementInfo.y),
                  width: draggedElementInfo.element.width,
                  height: draggedElementInfo.element.height,
                  backgroundColor: getElementColor(
                    draggedElementInfo.element.type
                  ),
                  borderColor: Colors[colorScheme ?? "light"].tint,
                  borderWidth: 2,
                  borderStyle: "dashed",
                  opacity: 0.8,
                  zIndex: 150,
                  transform: [
                    { rotate: `${draggedElementInfo.element.rotation}deg` },
                  ],
                },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.dragPreviewText}>
                {
                  templates.find(
                    (t) => t.type === draggedElementInfo.element.type
                  )?.name
                }
              </Text>
              <Text style={styles.dragCoordinateText}>
                ({snapToGrid(draggedElementInfo.x)},{" "}
                {snapToGrid(draggedElementInfo.y)})
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          要素数: {elements.length} | 選択中: {selectedTemplate || "なし"}
          {selectedElement && " | 選択要素あり"}
          {draggingElement && " | ドラッグ中"}
        </Text>
      </View>

      {/* Template Selection Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">マップテンプレート</ThemedText>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowTemplateModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            {/* Category Tabs */}
            <ScrollView
              horizontal
              style={styles.categoryTabs}
              showsHorizontalScrollIndicator={false}
            >
              {templateCategories.map((category) => (
                <Pressable
                  key={category.category}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category.category &&
                      styles.selectedCategoryTab,
                  ]}
                  onPress={() => setSelectedCategory(category.category)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.category &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Template List */}
            <ScrollView style={styles.templateList}>
              {getTemplatesByCategory(selectedCategory).map((template) => (
                <View key={template.id} style={styles.templateCard}>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateTitle}>{template.name}</Text>
                    <Text style={styles.templateDescription}>
                      {template.description}
                    </Text>
                    <View style={styles.templateMeta}>
                      <Text style={styles.templateMetaText}>
                        要素数: {template.elements.length} | サイズ:{" "}
                        {template.metadata.width}×{template.metadata.height}
                      </Text>
                    </View>
                    <View style={styles.templateTags}>
                      {template.metadata.tags.map((tag, index) => (
                        <View key={index} style={styles.templateTag}>
                          <Text style={styles.templateTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Template Preview */}
                  <View style={styles.templatePreviewContainer}>
                    <View style={styles.templatePreviewCanvas}>
                      {template.elements.map((element) => (
                        <View
                          key={element.id}
                          style={[
                            styles.templatePreviewElement,
                            {
                              left: (element.x / template.metadata.width) * 120,
                              top: (element.y / template.metadata.height) * 80,
                              width: Math.max(
                                4,
                                (element.width / template.metadata.width) * 120
                              ),
                              height: Math.max(
                                4,
                                (element.height / template.metadata.height) * 80
                              ),
                              backgroundColor: getElementColor(element.type),
                              transform: [{ rotate: `${element.rotation}deg` }],
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Pressable
                      style={styles.useTemplateButton}
                      onPress={() => loadMapTemplate(template)}
                    >
                      <Text style={styles.useTemplateButtonText}>使用する</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </ThemedView>
        </SafeAreaView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  templateButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  templateButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  undoRedoButtons: {
    flexDirection: "row",
    gap: 8,
  },
  undoRedoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  undoRedoButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  toolbar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  templateSection: {
    flex: 1,
    maxHeight: 80,
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  quickActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },
  quickActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  elementTemplateButton: {
    alignItems: "center",
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedTemplate: {
    borderColor: "#007AFF",
  },
  templatePreview: {
    width: 40,
    height: 30,
    borderRadius: 4,
    marginBottom: 4,
  },
  templateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  canvasContainer: {
    flex: 1,
  },
  canvasContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    minWidth: CANVAS_WIDTH + 80,
    minHeight: CANVAS_HEIGHT + 80,
  },
  canvas: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  gridLine: {
    position: "absolute",
    opacity: 0.3,
    zIndex: 1,
    pointerEvents: "none",
  },
  element: {
    position: "absolute",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  elementText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  previewElement: {
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  previewElementText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
    opacity: 0.8,
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  dragPreviewInCanvas: {
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  dragPreviewText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  dragCoordinateText: {
    fontSize: 8,
    color: "#666",
    fontWeight: "500",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  categoryTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 80,
  },
  categoryTab: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    minWidth: 80,
  },
  selectedCategoryTab: {
    backgroundColor: "#007AFF",
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  selectedCategoryText: {
    color: "white",
  },
  templateList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  templateCard: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  templateInfo: {
    flex: 1,
    marginRight: 16,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  templateMeta: {
    marginBottom: 8,
  },
  templateMetaText: {
    fontSize: 11,
    color: "#888",
  },
  templateTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  templateTag: {
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  templateTagText: {
    fontSize: 10,
    color: "#007AFF",
    fontWeight: "500",
  },
  templatePreviewContainer: {
    alignItems: "center",
  },
  templatePreviewCanvas: {
    width: 120,
    height: 80,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    position: "relative",
    marginBottom: 8,
  },
  templatePreviewElement: {
    position: "absolute",
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "#999",
  },
  useTemplateButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  useTemplateButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});

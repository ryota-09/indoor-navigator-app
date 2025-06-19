import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
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
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { MapService } from "@/services/mapService";
import { MapModel } from "@/models/MapModel";
import {
  ElementType,
  MapElement,
  MapTemplate,
  TemplateCategory,
  MapSaveRequest,
  MapData,
} from "@/types/map";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Grid configuration
const GRID_SIZE = 20;
const CANVAS_WIDTH = screenWidth * 2;
const CANVAS_HEIGHT = screenHeight * 2;


// Template data
const mapTemplates: MapTemplate[] = [
  {
    id: "station_basic",
    name: "基本的な駅構内",
    category: TemplateCategory.STATION,
    description: "駅の基本的なレイアウト（ホーム、改札、階段、トイレ）",
    elements: [
      {
        id: "1",
        type: ElementType.CORRIDOR,
        x: 100,
        y: 100,
        width: 200,
        height: 60,
        rotation: 0,
        floor: 0,
      },
      {
        id: "2",
        type: ElementType.ENTRANCE,
        x: 50,
        y: 100,
        width: 40,
        height: 60,
        rotation: 0,
        floor: 0,
      },
      {
        id: "3",
        type: ElementType.STAIRS,
        x: 320,
        y: 80,
        width: 60,
        height: 100,
        rotation: 0,
        floor: 0,
      },
      {
        id: "4",
        type: ElementType.RESTROOM,
        x: 150,
        y: 200,
        width: 80,
        height: 60,
        rotation: 0,
        floor: 0,
      },
    ],
    metadata: {
      width: 400,
      height: 300,
      floors: 1,
      tags: ["駅", "基本", "交通"],
    },
    isOfficial: true,
    isPremium: false,
  },
  {
    id: "office_basic",
    name: "オフィスビル基本レイアウト",
    category: TemplateCategory.OFFICE,
    description: "オフィスビルの基本的なフロア構成",
    elements: [
      {
        id: "1",
        type: ElementType.CORRIDOR,
        x: 80,
        y: 120,
        width: 240,
        height: 40,
        rotation: 0,
        floor: 0,
      },
      {
        id: "2",
        type: ElementType.ENTRANCE,
        x: 180,
        y: 60,
        width: 40,
        height: 60,
        rotation: 0,
        floor: 0,
      },
      {
        id: "3",
        type: ElementType.STAIRS,
        x: 40,
        y: 80,
        width: 60,
        height: 120,
        rotation: 0,
        floor: 0,
      },
      {
        id: "4",
        type: ElementType.RESTROOM,
        x: 340,
        y: 100,
        width: 60,
        height: 80,
        rotation: 0,
        floor: 0,
      },
    ],
    metadata: {
      width: 420,
      height: 220,
      floors: 1,
      tags: ["オフィス", "ビル", "ビジネス"],
    },
    isOfficial: true,
    isPremium: false,
  },
  {
    id: "mall_basic",
    name: "ショッピングモール",
    category: TemplateCategory.SHOPPING,
    description: "ショッピングモールの基本的な店舗配置",
    elements: [
      {
        id: "1",
        type: ElementType.CORRIDOR,
        x: 120,
        y: 100,
        width: 160,
        height: 40,
        rotation: 0,
        floor: 0,
      },
      {
        id: "2",
        type: ElementType.SHOP,
        x: 60,
        y: 60,
        width: 100,
        height: 80,
        rotation: 0,
        floor: 0,
      },
      {
        id: "3",
        type: ElementType.SHOP,
        x: 240,
        y: 60,
        width: 100,
        height: 80,
        rotation: 0,
        floor: 0,
      },
      {
        id: "4",
        type: ElementType.ENTRANCE,
        x: 190,
        y: 160,
        width: 40,
        height: 60,
        rotation: 0,
        floor: 0,
      },
      {
        id: "5",
        type: ElementType.RESTROOM,
        x: 300,
        y: 160,
        width: 60,
        height: 60,
        rotation: 0,
        floor: 0,
      },
    ],
    metadata: {
      width: 380,
      height: 240,
      floors: 1,
      tags: ["ショッピング", "モール", "店舗"],
    },
    isOfficial: true,
    isPremium: false,
  },
  {
    id: "hospital_basic",
    name: "病院基本レイアウト",
    category: TemplateCategory.HOSPITAL,
    description: "病院の基本的なフロア構成",
    elements: [
      {
        id: "1",
        type: ElementType.CORRIDOR,
        x: 100,
        y: 120,
        width: 200,
        height: 40,
        rotation: 0,
        floor: 0,
      },
      {
        id: "2",
        type: ElementType.ENTRANCE,
        x: 190,
        y: 60,
        width: 40,
        height: 60,
        rotation: 0,
        floor: 0,
      },
      {
        id: "3",
        type: ElementType.STAIRS,
        x: 320,
        y: 80,
        width: 60,
        height: 100,
        rotation: 0,
        floor: 0,
      },
      {
        id: "4",
        type: ElementType.RESTROOM,
        x: 40,
        y: 140,
        width: 60,
        height: 60,
        rotation: 0,
        floor: 0,
      },
    ],
    metadata: {
      width: 400,
      height: 220,
      floors: 1,
      tags: ["病院", "医療", "ヘルスケア"],
    },
    isOfficial: true,
    isPremium: false,
  },
  {
    id: "school_basic",
    name: "学校基本レイアウト",
    category: TemplateCategory.EDUCATION,
    description: "学校の基本的な校舎レイアウト",
    elements: [
      {
        id: "1",
        type: ElementType.CORRIDOR,
        x: 80,
        y: 100,
        width: 240,
        height: 40,
        rotation: 0,
        floor: 0,
      },
      {
        id: "2",
        type: ElementType.ENTRANCE,
        x: 190,
        y: 40,
        width: 40,
        height: 60,
        rotation: 0,
        floor: 0,
      },
      {
        id: "3",
        type: ElementType.STAIRS,
        x: 40,
        y: 60,
        width: 60,
        height: 120,
        rotation: 0,
        floor: 0,
      },
      {
        id: "4",
        type: ElementType.RESTROOM,
        x: 340,
        y: 80,
        width: 60,
        height: 80,
        rotation: 0,
        floor: 0,
      },
    ],
    metadata: {
      width: 420,
      height: 180,
      floors: 1,
      tags: ["学校", "教育", "キャンパス"],
    },
    isOfficial: true,
    isPremium: false,
  },
  {
    id: "restaurant_basic",
    name: "レストラン基本レイアウト",
    category: TemplateCategory.CUSTOM,
    description: "レストランの基本的な店舗レイアウト",
    elements: [
      {
        id: "1",
        type: ElementType.CORRIDOR,
        x: 120,
        y: 80,
        width: 160,
        height: 40,
        rotation: 0,
        floor: 0,
      },
      {
        id: "2",
        type: ElementType.ENTRANCE,
        x: 190,
        y: 40,
        width: 40,
        height: 60,
        rotation: 0,
        floor: 0,
      },
      {
        id: "3",
        type: ElementType.SHOP,
        x: 60,
        y: 140,
        width: 120,
        height: 80,
        rotation: 0,
        floor: 0,
      },
      {
        id: "4",
        type: ElementType.SHOP,
        x: 220,
        y: 140,
        width: 120,
        height: 80,
        rotation: 0,
        floor: 0,
      },
      {
        id: "5",
        type: ElementType.RESTROOM,
        x: 360,
        y: 100,
        width: 60,
        height: 60,
        rotation: 0,
        floor: 0,
      },
    ],
    metadata: {
      width: 440,
      height: 240,
      floors: 1,
      tags: ["レストラン", "飲食", "店舗"],
    },
    isOfficial: true,
    isPremium: false,
  },
];

export default function EditorScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [elements, setElements] = useState<MapElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ElementType | null>(
    ElementType.CORRIDOR
  );
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  
  // Map metadata
  const [mapName, setMapName] = useState<string>("");
  const [mapDescription, setMapDescription] = useState<string>("");
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [userMaps, setUserMaps] = useState<MapData[]>([]);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Template selection modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory>(TemplateCategory.STATION);

  // ScrollView reference for auto-scrolling
  const canvasScrollViewRef = useRef<ScrollView>(null);


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

  // ツールモード (将来の機能拡張用に残す)
  // const [toolMode, setToolMode] = useState<"select" | "place">("place");
  
  // Load user maps when component mounts
  useEffect(() => {
    const loadUserMaps = async () => {
      if (user) {
        try {
          const maps = await MapService.getUserMaps(user.uid);
          setUserMaps(maps);
        } catch (err) {
          console.error("Failed to load user maps:", err);
        }
      }
    };
    loadUserMaps();
  }, [user]);

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

  const templates = useMemo(() => [
    { type: ElementType.CORRIDOR, name: "通路", color: "#F0F0F0" },
    { type: ElementType.SHOP, name: "店舗", color: "#FFE0B2" },
    { type: ElementType.STAIRS, name: "階段", color: "#C8E6C9" },
    { type: ElementType.ENTRANCE, name: "入口", color: "#FFCDD2" },
    { type: ElementType.RESTROOM, name: "トイレ", color: "#E1BEE7" },
    { type: ElementType.ELEVATOR, name: "エレベーター", color: "#B3E5FC" },
    { type: ElementType.ESCALATOR, name: "エスカレーター", color: "#C5E1A5" },
    { type: ElementType.EXIT, name: "出口", color: "#FFCCBC" },
    { type: ElementType.INFORMATION, name: "案内所", color: "#D1C4E9" },
  ], []);

  const templateCategories: {
    category: TemplateCategory;
    name: string;
    icon: string;
  }[] = [
    { category: TemplateCategory.STATION, name: "駅", icon: "🚉" },
    { category: TemplateCategory.OFFICE, name: "オフィス", icon: "🏢" },
    { category: TemplateCategory.SHOPPING, name: "ショッピング", icon: "🛍️" },
    { category: TemplateCategory.HOSPITAL, name: "病院", icon: "🏥" },
    { category: TemplateCategory.EDUCATION, name: "教育施設", icon: "🏫" },
    { category: TemplateCategory.CUSTOM, name: "カスタム", icon: "🔧" },
  ];

  // Template functions
  const loadMapTemplate = (template: MapTemplate) => {
    try {
      console.log("🔄 Loading template:", template.name);
      
      // テンプレートが空でないことを確認
      if (!template.elements || template.elements.length === 0) {
        console.error("❌ Template has no elements");
        Alert.alert("エラー", "このテンプレートには要素がありません");
        return;
      }

      // 要素を簡単に中央に配置
      const centerX = CANVAS_WIDTH / 2;
      const centerY = CANVAS_HEIGHT / 2;
      const baseOffsetX = centerX - 100; // 簡単なオフセット
      const baseOffsetY = centerY - 100;

      // 要素を配置して新しいIDを付与
      const newElements = template.elements.map((element, index) => {
        // floor プロパティがない場合は追加
        const updatedElement = {
          ...element,
          floor: element.floor ?? 0, // floor プロパティを追加
          id: `template_${Date.now()}_${index}`,
          x: snapToGrid(element.x + baseOffsetX),
          y: snapToGrid(element.y + baseOffsetY),
        };
        
        console.log("📍 Element created:", updatedElement);
        return updatedElement;
      });

      console.log("✅ All elements created:", newElements.length);
      
      // ヒストリーに保存
      saveToHistory(newElements);
      setShowTemplateModal(false);
      setSelectedElement(null);
      
      console.log("✅ Template loaded successfully");
    } catch (error) {
      console.error("❌ Error loading template:", error);
      Alert.alert("エラー", "テンプレートの読み込みに失敗しました");
    }
  };

  const getTemplatesByCategory = (
    category: TemplateCategory
  ): MapTemplate[] => {
    try {
      const filtered = mapTemplates.filter((template) => template.category === category);
      console.log(`📁 Found ${filtered.length} templates for category:`, category);
      return filtered;
    } catch (error) {
      console.error("❌ Error filtering templates:", error);
      return [];
    }
  };

  const snapToGrid = useCallback((value: number): number => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }, []);

  const saveToHistory = useCallback((newElements: MapElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setElements(newElements);
  }, [history, historyIndex]);

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

  const gridLines = useMemo(() => {
    const lines: React.ReactNode[] = [];
    const gridColor = Colors[colorScheme ?? "light"].tabIconDefault;

    // Vertical lines
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      lines.push(
        <View
          key={`v-${x}`}
          style={[
            styles.gridLine,
            {
              left: x,
              height: CANVAS_HEIGHT,
              width: 1,
              backgroundColor: gridColor,
              zIndex: 1,
            },
          ]}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      lines.push(
        <View
          key={`h-${y}`}
          style={[
            styles.gridLine,
            {
              top: y,
              width: CANVAS_WIDTH,
              height: 1,
              backgroundColor: gridColor,
              zIndex: 1,
            },
          ]}
        />
      );
    }

    return lines;
  }, [colorScheme]);

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

  const handleCanvasPress = useCallback((event: any) => {
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
      floor: 0,
    };

    console.log("Creating element:", newElement);
    
    // 緊急度の低い更新をstartTransitionでラップ
    startTransition(() => {
      saveToHistory([...elements, newElement]);
      setPreviewPosition({ x: snappedX, y: snappedY });
    });
  }, [selectedTemplate, elements, draggingElement, saveToHistory, snapToGrid]);

  // const handleElementPress = (elementId: string) => {
  //   setSelectedElement(elementId === selectedElement ? null : elementId);
  // };

  // const rotateElement = (elementId: string) => {
  //   const newElements = elements.map((element) =>
  //     element.id === elementId
  //       ? { ...element, rotation: (element.rotation + 30) % 360 }
  //       : element
  //   );
  //   saveToHistory(newElements);
  // };

  const deleteElement = (elementId: string) => {
    const newElements = elements.filter((element) => element.id !== elementId);
    saveToHistory(newElements);
    setSelectedElement(null);
  };

  const getElementColor = useCallback((type: ElementType): string => {
    return templates.find((t) => t.type === type)?.color || "#E0E0E0";
  }, [templates]);

  // 要素の位置更新（ドラッグ終了時）
  const updateElementPosition = useCallback((
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
    
    // 位置更新も緊急度を下げる
    startTransition(() => {
      saveToHistory(newElements);
    });
  }, [elements, saveToHistory, snapToGrid]);

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


  // 軽量化されたドラッグ要素コンポーネント
  const DraggableElement = React.memo(function DraggableElement({ element }: { element: MapElement }) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const elementRef = useRef<View>(null);

    // Web環境での軽量化されたドラッグ処理
    const handleDragStart = useCallback((e: any) => {
      e.preventDefault();
      e.stopPropagation();
      
      // ダブルタップ検出
      const currentTime = Date.now();
      if (currentTime - lastTapTime < 300) {
        handleDoubleTap(element.id);
        setLastTapTime(0);
        return;
      }
      setLastTapTime(currentTime);

      setSelectedElement(element.id);
      setDraggingElement(element.id);
      scale.value = withSpring(1.1);
      
      // 簡略化されたドラッグ処理をグローバルレベルで処理
      const startX = e.clientX || e.touches?.[0]?.clientX || 0;
      const startY = e.clientY || e.touches?.[0]?.clientY || 0;
      
      let lastX = startX;
      let lastY = startY;
      
      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        const clientX = 'clientX' in moveEvent ? moveEvent.clientX : moveEvent.touches[0].clientX;
        const clientY = 'clientY' in moveEvent ? moveEvent.clientY : moveEvent.touches[0].clientY;
        
        const dx = clientX - lastX;
        const dy = clientY - lastY;
        
        translateX.value += dx;
        translateY.value += dy;
        
        lastX = clientX;
        lastY = clientY;
      };
      
      const handleEnd = () => {
        const finalX = element.x + translateX.value;
        const finalY = element.y + translateY.value;
        
        const boundedX = Math.max(0, Math.min(CANVAS_WIDTH - element.width, finalX));
        const boundedY = Math.max(0, Math.min(CANVAS_HEIGHT - element.height, finalY));
        
        // ドラッグ終了時の状態更新を最適化
        setDraggingElement(null);
        
        // アニメーション終了を即座に実行
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        
        // 位置更新は緊急度を下げる
        startTransition(() => {
          updateElementPosition(element.id, boundedX, boundedY);
        });
        
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove as any);
        document.removeEventListener('touchend', handleEnd);
      };
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove as any, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }, [element, translateX, translateY, scale]);

    // Web環境でのイベント設定を最小限に
    useEffect(() => {
      if (Platform.OS !== 'web' || !elementRef.current) return;
      
      const element_dom = (elementRef.current as any)?._nativeTag || 
                         (elementRef.current as any)?.getDOMNode?.() || 
                         elementRef.current;
      
      if (!element_dom?.addEventListener) return;
      
      element_dom.addEventListener('mousedown', handleDragStart);
      element_dom.addEventListener('touchstart', handleDragStart, { passive: false });
      element_dom.style.cursor = 'move';
      element_dom.style.touchAction = 'none';
      element_dom.style.userSelect = 'none';
      element_dom.setAttribute('data-draggable-element', element.id);
      
      return () => {
        element_dom.removeEventListener('mousedown', handleDragStart);
        element_dom.removeEventListener('touchstart', handleDragStart);
      };
    }, [handleDragStart, element.id]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${element.rotation}deg` },
        { scale: scale.value },
      ],
    }), [element.rotation]);

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
  }, (prevProps, nextProps) => {
    return (
      prevProps.element.id === nextProps.element.id &&
      prevProps.element.x === nextProps.element.x &&
      prevProps.element.y === nextProps.element.y &&
      prevProps.element.width === nextProps.element.width &&
      prevProps.element.height === nextProps.element.height &&
      prevProps.element.type === nextProps.element.type &&
      prevProps.element.rotation === nextProps.element.rotation
    );
  });

  return (
    <ThemedView style={styles.container}>
      {/* Overlay to close actions menu */}
      {showActionsMenu && (
        <Pressable
          style={styles.overlay}
          onPress={() => setShowActionsMenu(false)}
        />
      )}
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="title">
            マップエディタ
          </ThemedText>
          <Text style={styles.elementCount}>({elements.length}個)</Text>
        </View>
        
        <View style={styles.headerRight}>
          {/* Undo/Redo buttons */}
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
              <Text style={styles.undoRedoIcon}>↶</Text>
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
              <Text style={styles.undoRedoIcon}>↷</Text>
            </Pressable>
          </View>
          
          {/* Actions menu */}
          <View style={styles.actionsMenuContainer}>
            <Pressable
              style={[
                styles.actionsMenuButton,
                { backgroundColor: Colors[colorScheme ?? "light"].tint },
              ]}
              onPress={() => setShowActionsMenu(!showActionsMenu)}
            >
              <Text style={styles.actionsMenuButtonText}>⋯</Text>
            </Pressable>
            
            {showActionsMenu && (
              <View style={[styles.actionsDropdown, {
                borderColor: Colors[colorScheme ?? "light"].border || "#E0E0E0",
                borderWidth: 1,
              }]}>
                <Pressable
                  style={styles.actionItem}
                  onPress={() => {
                    try {
                      console.log("📋 Opening template modal");
                      setShowTemplateModal(true);
                      setShowActionsMenu(false);
                    } catch (error) {
                      console.error("❌ Error opening template modal:", error);
                    }
                  }}
                >
                  <Text style={styles.actionItemIcon}>📋</Text>
                  <Text style={styles.actionItemText}>テンプレート</Text>
                </Pressable>
                
                <Pressable
                  style={[
                    styles.actionItem,
                    (!user || elements.length === 0) && styles.actionItemDisabled
                  ]}
                  onPress={() => {
                    if (user && elements.length > 0) {
                      setShowSaveModal(true);
                      setShowActionsMenu(false);
                    }
                  }}
                  disabled={!user || elements.length === 0}
                >
                  <Text style={styles.actionItemIcon}>💾</Text>
                  <Text style={[
                    styles.actionItemText,
                    (!user || elements.length === 0) && styles.actionItemTextDisabled
                  ]}>保存</Text>
                </Pressable>
                
                <Pressable
                  style={[
                    styles.actionItem,
                    !user && styles.actionItemDisabled
                  ]}
                  onPress={async () => {
                    if (user) {
                      const maps = await MapService.getUserMaps(user.uid);
                      setUserMaps(maps);
                      setShowLoadModal(true);
                      setShowActionsMenu(false);
                    }
                  }}
                  disabled={!user}
                >
                  <Text style={styles.actionItemIcon}>📂</Text>
                  <Text style={[
                    styles.actionItemText,
                    !user && styles.actionItemTextDisabled
                  ]}>読み込み</Text>
                </Pressable>
                
                {elements.length > 0 && (
                  <Pressable
                    style={styles.actionItem}
                    onPress={() => {
                      clearAll();
                      setShowActionsMenu(false);
                    }}
                  >
                    <Text style={styles.actionItemIcon}>🗑️</Text>
                    <Text style={styles.actionItemText}>全削除</Text>
                  </Pressable>
                )}
              </View>
            )}
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
                <Text style={styles.quickActionText}>📋 複製</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.quickActionButton,
                  { backgroundColor: "#FF6B6B" },
                ]}
                onPress={() => deleteElement(selectedElement)}
              >
                <Text style={styles.quickActionText}>🗑️ 削除</Text>
              </Pressable>
            </>
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
          {gridLines}

          {/* Elements - 仮想化を考慮した描画 */}
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

          {/* Canvas内ドラッグプレビュー - 簡略化 */}
          {false && (
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
          選択ツール: {templates.find(t => t.type === selectedTemplate)?.name || "なし"}
          {selectedElement && " | 要素選択中"}
          {draggingElement && " | ドラッグ中"}
          {mapName && ` | ${mapName}`}
        </Text>
      </View>

      {/* Template Selection Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
        onRequestClose={() => {
          console.log("🔒 Template modal closing");
          setShowTemplateModal(false);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">マップテンプレート</ThemedText>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => {
                  console.log("✕ Template modal close button pressed");
                  setShowTemplateModal(false);
                }}
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
                      {template.elements && template.elements.length > 0 ? (
                        template.elements.slice(0, 10).map((element, index) => {
                          try {
                            const previewWidth = 120;
                            const previewHeight = 80;
                            
                            // 安全な計算でプレビューサイズを決定
                            const scaleX = template.metadata?.width > 0 ? previewWidth / template.metadata.width : 0.5;
                            const scaleY = template.metadata?.height > 0 ? previewHeight / template.metadata.height : 0.5;
                            
                            return (
                              <View
                                key={`preview_${template.id}_${index}`}
                                style={[
                                  styles.templatePreviewElement,
                                  {
                                    left: Math.max(0, Math.min((element.x || 0) * scaleX, previewWidth - 4)),
                                    top: Math.max(0, Math.min((element.y || 0) * scaleY, previewHeight - 4)),
                                    width: Math.max(4, Math.min((element.width || 20) * scaleX, previewWidth)),
                                    height: Math.max(4, Math.min((element.height || 20) * scaleY, previewHeight)),
                                    backgroundColor: getElementColor(element.type),
                                  },
                                ]}
                              />
                            );
                          } catch (error) {
                            console.error("Error rendering preview element:", error);
                            return null;
                          }
                        })
                      ) : (
                        <View style={styles.emptyPreview}>
                          <Text style={styles.emptyPreviewText}>プレビューなし</Text>
                        </View>
                      )}
                    </View>
                    <Pressable
                      style={styles.useTemplateButton}
                      onPress={() => {
                        console.log("🎯 Template button pressed:", template.name);
                        loadMapTemplate(template);
                      }}
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

      {/* Save Map Modal */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "formSheet" : "fullScreen"}
        onRequestClose={() => setShowSaveModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">マップを保存</ThemedText>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.saveModalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>マップ名 *</Text>
                <TextInput
                  style={styles.formInput}
                  value={mapName}
                  onChangeText={setMapName}
                  placeholder="例: 東京駅構内図"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>説明</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={mapDescription}
                  onChangeText={setMapDescription}
                  placeholder="マップの説明を入力"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>カテゴリ</Text>
                <ScrollView
                  horizontal
                  style={styles.categorySelector}
                  showsHorizontalScrollIndicator={false}
                >
                  {templateCategories.map((cat) => (
                    <Pressable
                      key={cat.category}
                      style={[
                        styles.categorySelectorItem,
                        selectedCategory === cat.category &&
                          styles.selectedCategorySelectorItem,
                      ]}
                      onPress={() => setSelectedCategory(cat.category)}
                    >
                      <Text style={styles.categorySelectorIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categorySelectorText,
                          selectedCategory === cat.category &&
                            styles.selectedCategorySelectorText,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <Pressable
                style={[
                  styles.saveConfirmButton,
                  {
                    backgroundColor: mapName.trim()
                      ? Colors[colorScheme ?? "light"].tint
                      : "#CCC",
                  },
                ]}
                onPress={async () => {
                  if (!user || !mapName.trim()) return;

                  setIsSaving(true);
                  try {
                    const mapRequest: MapSaveRequest = {
                      name: mapName,
                      description: mapDescription,
                      category: selectedCategory,
                      floors: [
                        {
                          id: MapModel.generateId(),
                          level: 0,
                          name: "Ground Floor",
                          elements: elements,
                          connections: [],
                        },
                      ],
                      metadata: {
                        totalWidth: CANVAS_WIDTH,
                        totalHeight: CANVAS_HEIGHT,
                        tags: [],
                      },
                    };

                    if (currentMapId) {
                      await MapService.updateMap(
                        currentMapId,
                        mapRequest,
                        user.uid
                      );
                    } else {
                      const savedMap = await MapService.saveMap(
                        mapRequest,
                        user.uid
                      );
                      setCurrentMapId(savedMap.id);
                    }

                    Alert.alert("成功", "マップが保存されました");
                    setShowSaveModal(false);
                  } catch (err) {
                    Alert.alert("エラー", "保存に失敗しました");
                    console.error("Save error:", err);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={!mapName.trim() || isSaving}
              >
                <Text style={styles.saveConfirmButtonText}>
                  {isSaving ? "保存中..." : "保存"}
                </Text>
              </Pressable>
            </ScrollView>
          </ThemedView>
        </SafeAreaView>
      </Modal>

      {/* Load Map Modal */}
      <Modal
        visible={showLoadModal}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
        onRequestClose={() => setShowLoadModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">マップを読み込み</ThemedText>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowLoadModal(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.loadModalList}>
              {userMaps.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    保存されたマップがありません
                  </Text>
                </View>
              ) : (
                userMaps.map((map) => (
                  <Pressable
                    key={map.id}
                    style={styles.mapListItem}
                    onPress={() => {
                      // Load map data
                      if (map.floors && map.floors.length > 0) {
                        const floor = map.floors[0];
                        setElements(floor.elements || []);
                        setMapName(map.name);
                        setMapDescription(map.description || "");
                        setCurrentMapId(map.id);
                        setSelectedCategory(map.category);
                        setShowLoadModal(false);
                      }
                    }}
                  >
                    <View style={styles.mapListItemInfo}>
                      <Text style={styles.mapListItemName}>{map.name}</Text>
                      {map.description && (
                        <Text style={styles.mapListItemDescription}>
                          {map.description}
                        </Text>
                      )}
                      <Text style={styles.mapListItemMeta}>
                        更新: {new Date(map.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.mapListItemActions}>
                      <Pressable
                        style={styles.mapDeleteButton}
                        onPress={async () => {
                          Alert.alert(
                            "確認",
                            `"${map.name}"を削除しますか？`,
                            [
                              { text: "キャンセル", style: "cancel" },
                              {
                                text: "削除",
                                style: "destructive",
                                onPress: async () => {
                                  if (user) {
                                    await MapService.deleteMap(map.id, user.uid);
                                    const updatedMaps =
                                      await MapService.getUserMaps(user.uid);
                                    setUserMaps(updatedMaps);
                                  }
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <Text style={styles.mapDeleteButtonText}>🗑</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))
              )}
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
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    zIndex: 1000,
    backgroundColor: "white",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flex: 1,
  },
  elementCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "normal",
  },
  headerRight: {
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  undoRedoIcon: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  toolbar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    marginRight: 8,
  },
  quickActionText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  elementTemplateButton: {
    alignItems: "center",
    marginRight: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#F8F9FA",
  },
  selectedTemplate: {
    borderColor: "#007AFF",
    backgroundColor: "#E8F4FD",
  },
  templatePreview: {
    width: 40,
    height: 30,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  templateText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
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
  // Save Modal styles
  saveModalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#FFF",
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categorySelector: {
    flexDirection: "row",
    marginTop: 8,
  },
  categorySelectorItem: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCategorySelectorItem: {
    borderColor: "#007AFF",
    backgroundColor: "#E8F4FD",
  },
  categorySelectorIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categorySelectorText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#666",
  },
  selectedCategorySelectorText: {
    color: "#007AFF",
  },
  saveConfirmButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveConfirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Load Modal styles
  loadModalList: {
    padding: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
  },
  mapListItem: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mapListItemInfo: {
    flex: 1,
  },
  mapListItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  mapListItemDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  mapListItemMeta: {
    fontSize: 11,
    color: "#999",
  },
  mapListItemActions: {
    justifyContent: "center",
  },
  mapDeleteButton: {
    padding: 8,
  },
  mapDeleteButtonText: {
    fontSize: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
    backgroundColor: "transparent",
  },
  actionsMenuContainer: {
    position: "relative",
    zIndex: 10000,
  },
  actionsMenuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsMenuButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  actionsDropdown: {
    position: "absolute",
    top: 42,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 10001,
    ...(Platform.OS === "web" && {
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    }),
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionItemDisabled: {
    opacity: 0.5,
  },
  actionItemIcon: {
    fontSize: 16,
  },
  actionItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  actionItemTextDisabled: {
    color: "#999",
  },
  emptyPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPreviewText: {
    fontSize: 10,
    color: "#999",
  },
});

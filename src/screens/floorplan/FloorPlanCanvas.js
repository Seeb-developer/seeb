import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BrickBorder from '../../component/floorplan/BrickBorder';
import GridLines from '../../component/floorplan/GridLines';
import { apiRequest } from '../../utils/api';
import {  API_URL, PROD_API_URL } from '@env';
import { captureRef } from 'react-native-view-shot';
import RNPrint from 'react-native-print';

const SCALE = 30;
const palette = [
  {
    id: 'bed',
    label: 'Bed',
    widthFt: 6,
    heightFt: 7,
    src: require('../../asset/bed.png'),
  },
  {
    id: 'sofa',
    label: 'Sofa',
    widthFt: 5,
    heightFt: 2.5,
    src: require('../../asset/sofa.png'),
  },
];

const BRICK_WIDTH = 15;
const BRICK_HEIGHT = 15;

export default function FloorPlanScreen({ route }) {

  const { id, name } = route.params;
  const [elements, setElements] = useState([]);
  const [roomWidthFt, setRoomWidthFt] = useState(15);
  const [roomHeightFt, setRoomHeightFt] = useState(10);
  const [selectedId, setSelectedId] = useState(null);
  const zoomRef = useRef();
  const panRef = useRef();
  const roomWidthPx = roomWidthFt * SCALE;
  const roomHeightPx = roomHeightFt * SCALE;

  const [isDragging, setIsDragging] = useState(false);
  const [assets, setAssets] = useState([]);
  const canvasRef = useRef();

  const captureCanvasAsImage = async () => {
    try {
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
      });

      // Send the image to print
      await RNPrint.print({ filePath: uri });
    } catch (error) {
      console.error('Error capturing and printing canvas:', error);
    }
  };


  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    const response = await apiRequest("GET", `/assets/room/${id}`);
    if (response) {
      setAssets(response);
    } else {
      setAssets([])
      console.log("Error fetching assets", response);
    }
  }


  const canvasScale = useSharedValue(1);
  const pinchGesture = Gesture.Pinch().onUpdate((e) => {
    canvasScale.value = Math.max(0.5, Math.min(e.scale, 3));
  });

  const animatedCanvasStyle = useAnimatedStyle(() => ({
    transform: [{ scale: canvasScale.value }],
  }));

  const addElement = (item) => {
    const width = item.width * SCALE;
    const height = item.length * SCALE;
    const randomX = 20 + Math.random() * (roomWidthPx - width - 40);
    const randomY = 20 + Math.random() * (roomHeightPx - height - 40);

    setElements((prev) => [
      ...prev,
      {
        src: API_URL + item.file,
        ...item,
        id: `${item.id}-${Date.now()}`,
        width,
        height,
        x: randomX,
        y: randomY,
      },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Inputs */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Width (ft):</Text>
            <TextInput
              style={styles.input}
              value={roomWidthFt.toString()}
              onChangeText={(val) => setRoomWidthFt(val)}
              keyboardType="numeric"
              inputMode="decimal"
            />
            <Text style={styles.label}>length (ft):</Text>
            <TextInput
              style={styles.input}
              value={roomHeightFt.toString()}
              onChangeText={(val) => setRoomHeightFt(val)}
              keyboardType="numeric"
              inputMode="decimal"
            />
            <TouchableOpacity onPress={captureCanvasAsImage} style={styles.printBtn}>
              <Icon name="printer" size={22} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Scroll + Zoom */}
          <ReactNativeZoomableView
            ref={canvasRef}
            maxZoom={1.5}
            minZoom={0.5}
            zoomStep={0.5}
            initialZoom={1}
            bindToBorders={true}
            contentWidth={roomWidthPx + BRICK_WIDTH * 2}
            contentHeight={roomHeightPx + BRICK_HEIGHT * 2}
            // onZoomAfter={this.logOutZoomState}
            style={{
              // padding: 10,
              // backgroundColor: '#f0eae2',
            }}
          >
            {/* <ZoomableCanvas contentWidth={roomWidthPx} contentHeight={roomHeightPx}> */}
            <TouchableWithoutFeedback onPress={() => setSelectedId(null)}>
              <View

                style={[
                  styles.canvas,
                  {
                    width: roomWidthPx + BRICK_WIDTH * 2,
                    height: roomHeightPx + BRICK_HEIGHT * 2,
                  },
                ]}
              >
                <BrickBorder width={roomWidthPx} height={roomHeightPx} />

                {/* This shifts the grid and elements inside the brick border */}
                <View
                  style={{
                    position: 'absolute',
                    top: BRICK_HEIGHT,
                    left: BRICK_WIDTH,
                    width: roomWidthPx,
                    height: roomHeightPx,
                  }}
                >
                  <GridLines width={roomWidthPx} height={roomHeightPx} />

                  <Text style={styles.roomLabel}>
                    {name} ({roomWidthFt}ft x {roomHeightFt}ft)
                  </Text>

                  {elements.map((item) => (
                    <DraggableItem
                      key={item.id}
                      {...item}
                      canvasWidth={roomWidthPx}
                      canvasHeight={roomHeightPx}
                      isSelected={item.id === selectedId}
                      onSelect={() => setSelectedId(item.id)}
                      zoomRef={zoomRef}
                      panRef={panRef}
                      setIsDragging={setIsDragging}
                      panEnabled={isDragging}
                      setElements={setElements}
                    />
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
            {/* </ZoomableCanvas> */}

          </ReactNativeZoomableView>

          {/* Bottom palette */}
            <TouchableOpacity style={styles.printButton} onPress={captureCanvasAsImage}>
              <Text style={styles.printButtonText}>Submit</Text>
            </TouchableOpacity>
          <View style={styles.palette}>
            <FlatList
              horizontal
              data={assets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.paletteItem}
                  onPress={() => addElement(item)}
                >
                  <Image source={{ uri: API_URL + item.file }} style={{ width: 40, height: 40 }} />
                  <Text>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView >
  );
}


function DraggableItem({
  id,
  src,
  width,
  height,
  x,
  y,
  canvasWidth,
  canvasHeight,
  title,
  panRef,
  zoomRef,
  setIsDragging,
  isSelected,
  onSelect,
  setElements
}) {
  const tx = useSharedValue(x);
  const ty = useSharedValue(y);
  const w = useSharedValue(width);
  const h = useSharedValue(height);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const startX = useSharedValue(x);
  const startY = useSharedValue(y);

  const pan = Gesture.Pan()
    .onBegin(() => runOnJS(setIsDragging)(false))
    .onStart(() => {
      startX.value = tx.value;
      startY.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = startX.value + e.translationX;
      ty.value = startY.value + e.translationY;
    })
    .onFinalize(() => runOnJS(setIsDragging)(true))
    .withRef(panRef);

  const resizeRight = Gesture.Pan()
    .onStart(() => {
      startX.value = w.value;
    })
    .onUpdate((e) => {
      w.value = Math.max(20, startX.value + e.translationX);
    });

  const resizeBottom = Gesture.Pan()
    .onStart(() => {
      startY.value = h.value;
    })
    .onUpdate((e) => {
      h.value = Math.max(20, startY.value + e.translationY);
    });

  const gesture = Gesture.Simultaneous(pan);
  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: w.value,
    height: h.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: ty.value + 20, // slightly above the item
    left: tx.value + w.value / 2, // move to center
    transform: [{ translateX: -w.value / 2 }], // shift back to center align
  }));



  return (
    <>
      <Animated.Text
        style={[styles.elementLabel, labelStyle]}
        pointerEvents="none"
      >
        {title + '\n' + `(${(w.value / SCALE).toFixed(1)}ft x ${(h.value / SCALE).toFixed(1)}ft)`}
      </Animated.Text>

      <GestureDetector gesture={gesture} simultaneousHandlers={zoomRef}>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={onSelect}
            style={{ width: '100%', height: '100%' }}
          >
            <Image source={{ uri: src }} style={{ width: '100%', height: '100%' }} />
          </TouchableOpacity>
          {/* Rotate */}
          {isSelected && (
            <>
              <TouchableOpacity
                style={styles.rotateBtn}
                onPress={() => {
                  rotation.value += Math.PI / 2;
                  // const temp = w.value;
                  // w.value = h.value;
                  // h.value = temp;
                }}
              >
                <Text style={{ fontSize: 25 }}>⟳</Text>
              </TouchableOpacity>

              {/* Resize Right */}
              <GestureDetector gesture={resizeRight}>
                <Animated.View style={styles.resizeHandleRight}>
                  <Icon name="arrow-collapse-horizontal" size={25} color="#333" />
                </Animated.View>
              </GestureDetector>

              {/* Resize Bottom */}
              <GestureDetector gesture={resizeBottom}>
                <Animated.View style={styles.resizeHandleBottom}>
                  <Icon name="arrow-collapse-vertical" size={25} color="#333" />
                </Animated.View>
              </GestureDetector>

              {/* Delete Icon */}
              <TouchableOpacity
                style={styles.deleteIcon}
                onPress={() => {
                  runOnJS(setElements)((prev) => prev.filter((el) => el.id !== id));
                  runOnJS(setIsDragging)(false);
                }}
              >
                <Icon name="delete" size={25} color="red" />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </GestureDetector>
    </>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  canvas: {
    backgroundColor: '#ffffff',
    // borderWidth: 2,
    // borderColor: '#aaa',
    margin: 20,
    position: 'relative',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  palette: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fafafa',
  },
  paletteItem: {
    alignItems: 'center',
    marginRight: 12,
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fafafa',
  },
  label: { fontSize: 14, marginRight: 5 },
  input: {
    width: 60,
    height: 35,
    borderWidth: 1,
    borderColor: '#aaa',
    paddingHorizontal: 6,
    marginRight: 15,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  elementLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: 'rgba(255,255,255,0.5)', // subtle background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textAlign: 'center',
    zIndex: 999,
    position: 'absolute',
  },
  roomLabel: {
    position: 'absolute',
    top: -70,
    left: 80,
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold',
  },
  rotateBtn: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 20,
    elevation: 5,
    zIndex: 10,
  },
  resizeHandleRight: {
    position: 'absolute',
    right: -12,
    top: '50%',
    marginTop: -10,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
  },
  resizeHandleBottom: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    marginLeft: -10,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
  },
  deleteIcon: {
    position: 'absolute',
    top: -12,
    left: -12,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 20,
    elevation: 5,
    zIndex: 10,
  },
  printBtn: {
    marginLeft: 10,
    backgroundColor: '#eaeaea',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
  },
  printButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 10,
    marginLeft: 10,
  },
  printButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

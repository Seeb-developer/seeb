import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ZoomableCanvas({ children, contentWidth, contentHeight }) {
  const scale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translationX.value;
      startY.value = translationY.value;
    })
    .onUpdate((e) => {
      const maxOffsetX = Math.max(0, (contentWidth * scale.value - SCREEN_WIDTH) / 2);
      const maxOffsetY = Math.max(0, (contentHeight * scale.value - SCREEN_HEIGHT) / 2);

      const nextX = startX.value + e.translationX;
      const nextY = startY.value + e.translationY;

      translationX.value = Math.min(Math.max(nextX, -maxOffsetX), maxOffsetX);
      translationY.value = Math.min(Math.max(nextY, -maxOffsetY), maxOffsetY);
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = Math.min(Math.max(e.scale, 0.5), 3);
      scale.value = newScale;
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translationX.value },
        { translateY: translationY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.canvasContainer, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  canvasContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

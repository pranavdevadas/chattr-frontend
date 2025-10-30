import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { LoaderKitView } from 'react-native-loader-kit';
import { BlurView } from '@react-native-community/blur';

interface LoaderProps {
  visible: boolean;
  onFadeComplete?: () => void;
}

const Loader: React.FC<LoaderProps> = ({ visible, onFadeComplete }) => {
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) setShow(true);

    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) {
        setShow(false);
        onFadeComplete?.();
      }
    });
  }, [visible, fadeAnim, onFadeComplete]);

  if (!show) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, { opacity: fadeAnim }]}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      <LoaderKitView
        name="BallGridPulse"
        animationSpeedMultiplier={1.5}
        color="#5A0FC8"
        style={{ width: 50, height: 50 } as ViewStyle}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loader;

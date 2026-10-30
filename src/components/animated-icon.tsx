import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Keyframe,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Gradients } from '@/constants/theme';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const HOLD_DURATION = 1500;
const DURATION = 650;

const logoEnter = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0.6 }],
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.9),
  },
});

const textEnter = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ translateY: 14 }],
  },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }],
    easing: Easing.out(Easing.cubic),
  },
});

function SplashContent() {
  return (
    <>
      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />

      <View style={styles.center}>
        <Animated.View entering={logoEnter.duration(800)} style={styles.logoCard}>
          <Image
            style={styles.logo}
            source={require('@/assets/images/erp.png')}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View entering={textEnter.duration(600).delay(250)} style={styles.textBlock}>
          <Text style={styles.brand}>ERP Banking</Text>
          <Text style={styles.caption}>Veuillez patienter</Text>
          <ActivityIndicator color="rgba(255,255,255,0.85)" style={styles.spinner} />
        </Animated.View>
      </View>

      <Animated.View entering={textEnter.duration(600).delay(450)} style={styles.footer}>
        <Text style={styles.footerText}>Espace client sécurisé</Text>
      </Animated.View>
    </>
  );
}

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);
  const hidden = useRef(false);
  const exit = useSharedValue(0);

  useEffect(() => {
    if (!animate) return;
    exit.value = withTiming(
      1,
      { duration: DURATION, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      }
    );
  }, [animate, exit]);

  const exitStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.value,
    transform: [{ scale: 1 + exit.value * 0.04 }],
  }));

  if (!visible) return null;

  const handleReady = () => {
    if (hidden.current) return;
    hidden.current = true;

    SplashScreen.hideAsync().finally(() => {
      setTimeout(() => setAnimate(true), HOLD_DURATION);
    });
  };

  return (
    <Animated.View onLayout={handleReady} style={[styles.splashOverlay, exitStyle]}>
      <LinearGradient colors={Gradients.hero} style={StyleSheet.absoluteFill} />
      <SplashContent />
    </Animated.View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image
          style={styles.iconLogo}
          source={require('@/assets/images/erp.png')}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0B2A5B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    overflow: 'hidden',
  },
  decorTop: {
    position: 'absolute',
    top: -140,
    right: -110,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(98,166,255,0.16)',
  },
  decorBottom: {
    position: 'absolute',
    bottom: -160,
    left: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(21,87,184,0.28)',
  },
  center: {
    alignItems: 'center',
  },
  logoCard: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#04122B',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  logo: {
    width: 74,
    height: 74,
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 26,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  caption: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    letterSpacing: 0.6,
    marginTop: 8,
  },
  spinner: {
    marginTop: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 56,
  },
  footerText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  iconLogo: {
    width: 76,
    height: 76,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #2F80ED, #071A3A)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
});

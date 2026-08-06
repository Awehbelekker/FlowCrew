import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/designSystem';

const LoadingSpinner = ({
  size = 'medium',
  message = 'Loading...',
  showMessage = true,
  color = Colors.primary[500],
  style
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pulsing animation for the center
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Fade in animation
    const fadeAnimation = Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });

    fadeAnimation.start();
    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 40, height: 40 },
          outer: { width: 40, height: 40, borderWidth: 3 },
          inner: { width: 20, height: 20 },
          text: { fontSize: Typography.fontSize.sm, marginTop: Spacing.sm },
        };
      case 'large':
        return {
          container: { width: 80, height: 80 },
          outer: { width: 80, height: 80, borderWidth: 4 },
          inner: { width: 40, height: 40 },
          text: { fontSize: Typography.fontSize.lg, marginTop: Spacing.lg },
        };
      default: // medium
        return {
          container: { width: 60, height: 60 },
          outer: { width: 60, height: 60, borderWidth: 3 },
          inner: { width: 30, height: 30 },
          text: { fontSize: Typography.fontSize.base, marginTop: Spacing.md },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Animated.View style={[styles.wrapper, style, { opacity: fadeValue }]}>
      <View style={[styles.container, sizeStyles.container]}>
        {/* Outer spinning ring */}
        <Animated.View
          style={[
            styles.outerRing,
            sizeStyles.outer,
            {
              borderColor: color + '30',
              borderTopColor: color,
              transform: [{ rotate: spin }],
            },
          ]}
        />

        {/* Inner pulsing circle */}
        <Animated.View
          style={[
            styles.innerCircle,
            sizeStyles.inner,
            {
              backgroundColor: color + '20',
              transform: [{ scale: pulseValue }],
            },
          ]}
        >
          <View style={[styles.centerDot, { backgroundColor: color }]} />
        </Animated.View>
      </View>

      {showMessage && (
        <Animated.Text
          style={[
            styles.message,
            sizeStyles.text,
            { opacity: fadeValue },
          ]}
        >
          {message}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

// Skeleton loading component for coach cards
export const CoachCardSkeleton = () => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.header}>
        <Animated.View
          style={[skeletonStyles.namePlaceholder, { opacity: shimmerOpacity }]}
        />
        <Animated.View
          style={[skeletonStyles.scorePlaceholder, { opacity: shimmerOpacity }]}
        />
      </View>

      <View style={skeletonStyles.content}>
        <View style={skeletonStyles.tagsRow}>
          <Animated.View
            style={[skeletonStyles.tagPlaceholder, { opacity: shimmerOpacity }]}
          />
          <Animated.View
            style={[skeletonStyles.tagPlaceholder, { opacity: shimmerOpacity }]}
          />
        </View>

        <View style={skeletonStyles.statsRow}>
          {[1, 2, 3].map((item) => (
            <Animated.View
              key={item}
              style={[skeletonStyles.statPlaceholder, { opacity: shimmerOpacity }]}
            />
          ))}
        </View>

        <Animated.View
          style={[skeletonStyles.buttonPlaceholder, { opacity: shimmerOpacity }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderStyle: 'solid',
  },
  innerCircle: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
});

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  namePlaceholder: {
    width: 120,
    height: 20,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
  },
  scorePlaceholder: {
    width: 50,
    height: 30,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
  },
  content: {
    gap: Spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tagPlaceholder: {
    width: 60,
    height: 24,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statPlaceholder: {
    width: 60,
    height: 40,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
  },
  buttonPlaceholder: {
    width: '100%',
    height: 44,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
  },
});

export default LoadingSpinner;

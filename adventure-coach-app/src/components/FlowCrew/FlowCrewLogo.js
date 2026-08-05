import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * A properly styled FlowCrew logo component that matches the design
 */
const FlowCrewLogo = ({ size = 'medium', showText = true, style }) => {
  // Size variants
  const sizes = {
    small: {
      container: { width: 24, height: 24 },
      logo: { width: 24, height: 12 },
      text: { fontSize: 12, marginTop: 2 }
    },
    medium: {
      container: { width: 48, height: 48 },
      logo: { width: 48, height: 24 },
      text: { fontSize: 24, marginTop: 8 }
    },
    large: {
      container: { width: 80, height: 80 },
      logo: { width: 80, height: 40 },
      text: { fontSize: 36, marginTop: 16 }
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <View style={[styles.container, style]}>
      {/* Logo with wave accent */}
      <View style={[styles.logoContainer, currentSize.logo]}>
        {/* This is a simplified representation of the logo */}
        {/* In a real app, we would use an SVG or proper image */}
        <View style={styles.logoGradient}>
          <View style={styles.waveAccent} />
        </View>
      </View>

      {/* Text */}
      {showText && (
        <Text style={[styles.logoText, currentSize.text]}>FlowCrew</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 48,
    height: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#2196F3',
    // In a real app, we would use a proper gradient:
    // background: linear-gradient(90deg, #7ED321 0%, #00D4AA 50%, #2196F3 100%),
  },
  waveAccent: {
    position: 'absolute',
    right: '30%',
    top: '30%',
    width: '10%',
    height: '30%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E2A39',
    letterSpacing: -0.5,
  }
});

export default FlowCrewLogo;

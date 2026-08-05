import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

/**
 * FlowCrewLogo
 *
 * Renders the real FlowCrew brand mark (infinity/wave, green->blue gradient),
 * pulled from the icon-only crop of the uploaded logo lockup.
 *
 * - showText=true uses the full lockup image (mark + "FlowCrew" wordmark
 *   baked in as a single asset) - use at larger sizes where the wordmark
 *   stays legible (headers, splash/hero contexts).
 * - showText=false uses the icon-only crop - use at small sizes (tab bars,
 *   compact headers, nav icons) where the wordmark would be illegible.
 */
const ICON_ONLY = require('../../../assets/flowcrew-icon.png');
const FULL_LOCKUP = require('../../../assets/flowcrew-logo.png');

const FlowCrewLogo = ({ size = 'medium', showText = true, style }) => {
  const sizes = {
    small: { width: 28, height: 28 },
    medium: { width: 56, height: 56 },
    large: { width: 96, height: 96 },
  };

  // Allow numeric size (e.g. size={32} as used by Header.js) as well as
  // the named presets used elsewhere (HomeScreen, LessonSelectionScreen).
  const dims = typeof size === 'number'
    ? { width: size, height: size }
    : (sizes[size] || sizes.medium);

  if (showText) {
    // Full lockup includes the wordmark in the image itself, so it needs
    // more horizontal room than a square icon slot.
    return (
      <View style={[styles.container, style]}>
        <Image
          source={FULL_LOCKUP}
          style={{ width: dims.width * 2.2, height: dims.width * 2.2 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={ICON_ONLY}
        style={{ width: dims.width, height: dims.height }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FlowCrewLogo;

import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Platform, useWindowDimensions } from 'react-native';
import { Colors, Spacing, Shadows, Layout } from '../styles/FlowCrewDesignSystem';
import Text from './Text';
import { ArrowLeftIcon, FlowCrewLogo } from './Icons';

/**
 * Header Component
 *
 * A customizable header component that follows FlowCrew design principles
 *
 * @param {string} title - Header title
 * @param {boolean} showBackButton - Show back button
 * @param {function} onBackPress - Back button press handler
 * @param {node} leftAction - Custom left action component
 * @param {node} rightAction - Custom right action component
 * @param {boolean} transparent - Makes the header transparent
 * @param {object} style - Additional styles
 */
const Header = ({
  title,
  showBackButton = false,
  onBackPress,
  leftAction,
  rightAction,
  transparent = false,
  showLogo = false,
  style,
}) => {
  // Get screen dimensions for responsive adjustments
  const { width } = useWindowDimensions();
  // Back button component
  const renderBackButton = () => (
    <TouchableOpacity
      style={styles.backButton}
      onPress={onBackPress}
      activeOpacity={0.7}
    >
      <ArrowLeftIcon color={transparent ? Colors.text.inverse : Colors.text.primary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        transparent && styles.transparentBackground,
      ]}
    >
      <View
        style={[
          styles.container,
          transparent && styles.transparentBackground,
          style,
        ]}
      >
        {/* Left section */}
        <View style={styles.leftSection}>
          {showBackButton && renderBackButton()}
          {leftAction}
        </View>

        {/* Title or Logo section */}
        <View style={styles.titleSection}>
          {showLogo ? (
            <FlowCrewLogo size={width < 360 ? 28 : 32} />
          ) : title ? (
            <Text
              variant={width < 360 ? "h6" : "h5"}
              numberOfLines={1}
              style={{
                color: transparent ? Colors.text.inverse : Colors.text.heading,
              }}
            >
              {title}
            </Text>
          ) : null}
        </View>

        {/* Right section */}
        <View style={styles.rightSection}>
          {rightAction}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    backgroundColor: Colors.background.paper,
    ...Platform.select({
      ios: {
        ...Shadows.sm,
      },
      android: {
        elevation: 4,
      },
    }),
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.paper,
    width: '100%',
  },
  transparentBackground: {
    backgroundColor: 'transparent',
    ...Shadows.none,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
});

export default Header;

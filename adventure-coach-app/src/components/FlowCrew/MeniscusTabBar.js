/**
 * MeniscusTabBar
 *
 * Custom bottom tab bar for FlowCrew's Tab.Navigator, replacing the default
 * react-navigation tab bar. Ports the "liquid bead" concept originally
 * prototyped as a standalone web demo (SVG goo filter + drag-to-snap) into
 * React Native: an animated gradient bead slides beneath the active tab and
 * displays that tab's icon, riding on top of a rounded glass-style bar.
 *
 * True SVG goo-filter blending (feGaussianBlur + feColorMatrix) isn't
 * reliably supported across react-native-svg's iOS/Android renderers, so
 * this uses a solid bar + a bead with a soft shadow/glow and a spring
 * animation instead - visually close, fully native-safe.
 *
 * Usage (in App.FlowCrew.js):
 *   <Tab.Navigator tabBar={(props) => <MeniscusTabBar {...props} />} ...>
 */
import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../styles/FlowCrewDesignSystem';

const BAR_HEIGHT = 70;
const BAR_MARGIN_H = 20;
const BAR_MARGIN_BOTTOM = 24;
const BEAD_SIZE = 52;
const ICON_SIZE = 20;

// Minimal inline icon set (avoids depending on the not-yet-imported Icons.js)
const ICONS = {
  Discover: (color) => (
    <Path
      d="M4 11.5 12 4l8 7.5 M6.5 10v9.5h4.5v-6h2v6h4.5V10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  Map: (color) => (
    <>
      <Path
        d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx="12" cy="9.5" r="2.4" stroke={color} strokeWidth={2} fill="none" />
    </>
  ),
  Bookings: (color) => (
    <>
      <Rect x="4" y="5.5" width="16" height="14.5" rx="2.2" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M4 10h16M8.3 3.5v4M15.7 3.5v4" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  ),
  Messages: (color) => (
    <Path
      d="M4 5.5h16v10.2H9.2L5 19.5v-3.8H4z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  Profile: (color) => (
    <>
      <Circle cx="12" cy="8" r="3.6" stroke={color} strokeWidth={2} fill="none" />
      <Path
        d="M4.5 20c0-4.1 3.6-6.6 7.5-6.6s7.5 2.5 7.5 6.6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
};

const MeniscusTabBar = ({ state, descriptors, navigation }) => {
  const screenWidth = Dimensions.get('window').width;
  const barWidth = screenWidth - BAR_MARGIN_H * 2;
  const tabCount = state.routes.length;
  const tabWidth = barWidth / tabCount;

  const beadX = useRef(new Animated.Value(tabWidth * state.index + tabWidth / 2 - BEAD_SIZE / 2)).current;
  const [renderedIndex, setRenderedIndex] = useState(state.index);

  useEffect(() => {
    const target = tabWidth * state.index + tabWidth / 2 - BEAD_SIZE / 2;
    // Swap the icon shown inside the bead partway through the slide, not at the
    // very start, so it doesn't visually "jump" ahead of the motion.
    const swapTimer = setTimeout(() => setRenderedIndex(state.index), 90);
    Animated.spring(beadX, {
      toValue: target,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
    return () => clearTimeout(swapTimer);
  }, [state.index, tabWidth]);

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={[styles.bar, { width: barWidth }]}>
        <Svg width={barWidth} height={BAR_HEIGHT} style={StyleSheet.absoluteFill}>
          <Rect
            x={0}
            y={0}
            width={barWidth}
            height={BAR_HEIGHT}
            rx={BAR_HEIGHT / 2}
            fill={Colors.ui.card}
          />
        </Svg>

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const iconFn = ICONS[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || route.name}
              onPress={onPress}
              style={[styles.tabTouchable, { width: tabWidth }]}
              activeOpacity={0.7}
            >
              {/* Icon is hidden under the bead when this tab is active */}
              <View style={{ opacity: isFocused ? 0 : 1 }}>
                <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
                  {iconFn && iconFn(Colors.text.tertiary)}
                </Svg>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* The liquid bead - brand gradient (green -> teal -> blue) */}
        <Animated.View
          style={[
            styles.bead,
            {
              transform: [{ translateX: beadX }],
            },
          ]}
        >
          <Svg width={BEAD_SIZE} height={BEAD_SIZE} viewBox="0 0 52 52" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="beadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={Colors.brand.green} />
                <Stop offset="55%" stopColor={Colors.brand.teal} />
                <Stop offset="100%" stopColor={Colors.brand.blue} />
              </LinearGradient>
            </Defs>
            <Circle cx="26" cy="26" r="26" fill="url(#beadGradient)" />
          </Svg>
          <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
            {ICONS[state.routes[renderedIndex].name] &&
              ICONS[state.routes[renderedIndex].name]('#FFFFFF')}
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    height: BAR_HEIGHT,
    marginBottom: BAR_MARGIN_BOTTOM,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: Colors.ui.card,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
    shadowColor: '#1E2A39',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  tabTouchable: {
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bead: {
    position: 'absolute',
    top: (BAR_HEIGHT - BEAD_SIZE) / 2,
    left: 0,
    width: BEAD_SIZE,
    height: BEAD_SIZE,
    borderRadius: BEAD_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default MeniscusTabBar;

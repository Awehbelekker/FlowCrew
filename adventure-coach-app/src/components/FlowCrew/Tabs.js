import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '../styles/FlowCrewDesignSystem';
import Text from './Text';

/**
 * Tabs Component
 *
 * A customizable tabs component that follows FlowCrew design principles
 *
 * @param {array} tabs - Array of tab objects { id, label, icon? }
 * @param {string} activeTab - Active tab ID
 * @param {function} onTabChange - Tab change handler
 * @param {string} variant - 'default', 'pills', 'underlined'
 * @param {boolean} scrollable - Allow horizontal scrolling
 * @param {object} style - Additional styles
 */
const Tabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  variant = 'default',
  scrollable = false,
  style,
}) => {
  // Wrapper component based on scrollable prop
  const WrapperComponent = scrollable ? ScrollView : View;
  const wrapperProps = scrollable ? {
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: styles.scrollContainer,
  } : {};

  // Get container styles based on variant
  const getContainerStyles = () => {
    switch (variant) {
      case 'pills':
        return styles.pillsContainer;
      case 'underlined':
        return styles.underlinedContainer;
      default:
        return styles.defaultContainer;
    }
  };

  // Get tab styles based on variant and active state
  const getTabStyles = (isActive) => {
    switch (variant) {
      case 'pills':
        return isActive ? styles.activePillTab : styles.inactivePillTab;
      case 'underlined':
        return isActive ? styles.activeUnderlinedTab : styles.inactiveUnderlinedTab;
      default:
        return isActive ? styles.activeDefaultTab : styles.inactiveDefaultTab;
    }
  };

  // Get text styles based on variant and active state
  const getTextStyles = (isActive) => {
    return isActive ? styles.activeTabText : styles.inactiveTabText;
  };

  return (
    <View style={[styles.container, getContainerStyles(), style]}>
      <WrapperComponent {...wrapperProps}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, getTabStyles(isActive)]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              {tab.icon && (
                <View style={styles.tabIcon}>
                  {tab.icon}
                </View>
              )}
              <Text
                variant={isActive ? 'label' : 'body-sm'}
                style={getTextStyles(isActive)}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </WrapperComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.xs,
  },
  defaultContainer: {
    backgroundColor: Colors.background.subtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    flexDirection: 'row',
  },
  pillsContainer: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
  },
  underlinedContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.xxs,
  },
  activeDefaultTab: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.sm,
  },
  inactiveDefaultTab: {
    // Default inactive styles
  },
  activePillTab: {
    backgroundColor: Colors.brand.green,
    borderRadius: BorderRadius.full,
  },
  inactivePillTab: {
    // Default inactive styles
  },
  activeUnderlinedTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.brand.blue,
  },
  inactiveUnderlinedTab: {
    // Default inactive styles
  },
  activeTabText: {
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  inactiveTabText: {
    color: Colors.text.secondary,
  },
  tabIcon: {
    marginRight: Spacing.xs,
  },
});

export default Tabs;

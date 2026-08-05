import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../styles/FlowCrewDesignSystem';
import Text from './Text';

/**
 * Badge Component
 *
 * A small badge component that follows FlowCrew design principles
 *
 * @param {string} variant - 'success', 'warning', 'error', 'info', 'neutral'
 * @param {string} size - 'sm', 'md'
 * @param {boolean} dot - Shows just a colored dot without text
 * @param {object} style - Additional styles
 */
const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  style,
}) => {
  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return Colors.feedback.successLight;
      case 'warning':
        return Colors.feedback.warningLight;
      case 'error':
        return Colors.feedback.errorLight;
      case 'info':
        return Colors.feedback.infoLight;
      case 'neutral':
      default:
        return Colors.background.subtle;
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return Colors.feedback.success;
      case 'warning':
        return Colors.feedback.warning;
      case 'error':
        return Colors.feedback.error;
      case 'info':
        return Colors.feedback.info;
      case 'neutral':
      default:
        return Colors.text.secondary;
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: dot ? Spacing.xs / 2 : Spacing.xs,
          paddingVertical: dot ? Spacing.xs / 2 : Spacing.xxs,
          fontSize: Typography.fontSize.xs,
        };
      case 'md':
      default:
        return {
          paddingHorizontal: dot ? Spacing.sm : Spacing.sm,
          paddingVertical: dot ? Spacing.sm : Spacing.xs / 2,
          fontSize: Typography.fontSize.sm,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          {
            backgroundColor: getBackgroundColor(),
            width: sizeStyles.paddingHorizontal * 2,
            height: sizeStyles.paddingHorizontal * 2,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        variant="caption"
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: Typography.fontWeight.medium,
  },
  dot: {
    borderRadius: BorderRadius.full,
  },
});

export default Badge;

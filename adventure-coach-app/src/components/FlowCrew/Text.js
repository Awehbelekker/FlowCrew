import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, VisualEffects } from '../../styles/FlowCrewDesignSystem';

export const Text = ({
  children,
  variant = 'body',
  color = 'primary',
  bold = false,
  center = false,
  style,
  numberOfLines,
  ...props
}) => {
  const textStyles = [
    styles.base,
    styles[variant],
    styles[`color_${color}`],
    bold && styles.bold,
    center && styles.center,
    style
  ];

  return (
    <RNText
      style={textStyles}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.fontFamily.base,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.normal,
  },

  // Variants
  h1: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.tight,
    letterSpacing: Typography.letterSpacing.tight,
  },

  h2: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.tight,
    letterSpacing: Typography.letterSpacing.tight,
  },

  h3: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semiBold,
    lineHeight: Typography.lineHeight.tight,
  },

  subtitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semiBold,
    lineHeight: Typography.lineHeight.normal,
  },

  body: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.lineHeight.relaxed,
  },

  caption: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.lineHeight.relaxed,
  },

  // Colors
  color_primary: {
    color: Colors.text.primary,
  },

  color_secondary: {
    color: Colors.text.secondary,
  },

  color_tertiary: {
    color: Colors.text.tertiary,
  },

  color_inverse: {
    color: Colors.text.inverse,
  },

  color_success: {
    color: Colors.status.success,
  },

  color_warning: {
    color: Colors.status.warning,
  },

  color_error: {
    color: Colors.status.error,
  },

  color_brand: {
    color: Colors.brand.green,
  },

  // Modifiers
  bold: {
    fontWeight: Typography.fontWeight.bold,
  },

  center: {
    textAlign: 'center',
  },
});

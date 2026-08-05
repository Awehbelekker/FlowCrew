import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { Colors, Spacing, BorderRadius, Typography, VisualEffects } from '../../styles/FlowCrewDesignSystem';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.textDisabled,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={textStyles}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Variants
  primary: {
    backgroundColor: Colors.brand.green,
    shadowColor: Colors.brand.green,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.brand.green,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },

  md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 44,
  },

  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 52,
  },

  // States
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
    elevation: 1,
  },

  // Text styles
  text: {
    fontWeight: Typography.fontWeight.semiBold,
    textAlign: 'center',
  },

  text_primary: {
    color: Colors.text.inverse,
  },

  text_secondary: {
    color: Colors.brand.green,
  },

  text_outline: {
    color: Colors.text.primary,
  },

  text_ghost: {
    color: Colors.text.primary,
  },

  text_sm: {
    fontSize: Typography.fontSize.sm,
  },

  text_md: {
    fontSize: Typography.fontSize.base,
  },

  text_lg: {
    fontSize: Typography.fontSize.lg,
  },

  textDisabled: {
    color: Colors.text.tertiary,
  },
});

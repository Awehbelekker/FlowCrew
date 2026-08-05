import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, VisualEffects } from '../../styles/FlowCrewDesignSystem';

export const Card = ({
  children,
  variant = 'default',
  interactive = false,
  onPress,
  style,
  ...props
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    interactive && styles.interactive,
    style
  ];

  if (interactive && onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.ui.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  default: {
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },

  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  filled: {
    backgroundColor: Colors.ui.lightBg,
    borderWidth: 0,
  },

  interactive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});

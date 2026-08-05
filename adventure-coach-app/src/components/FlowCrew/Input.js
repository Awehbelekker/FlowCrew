import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Typography, Spacing, Shadows } from '../styles/FlowCrewDesignSystem';
import Text from './Text';

/**
 * Input Component
 *
 * A customizable input component that follows FlowCrew design principles
 *
 * @param {string} label - Input label
 * @param {string} placeholder - Input placeholder
 * @param {string} value - Input value
 * @param {function} onChangeText - Value change handler
 * @param {string} error - Error message
 * @param {boolean} disabled - Disables the input
 * @param {string} helper - Helper text below input
 * @param {node} leftIcon - Icon to show on the left
 * @param {node} rightIcon - Icon to show on the right
 * @param {object} style - Additional styles
 * @param {string} type - Input type
 */
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  helper,
  leftIcon,
  rightIcon,
  style,
  type = 'text',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Handle focus event
  const handleFocus = () => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus();
    }
  };

  // Handle blur event
  const handleBlur = () => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur();
    }
  };

  // Get text input props based on type
  const getTypeProps = () => {
    switch (type) {
      case 'password':
        return {
          secureTextEntry: true,
          autoCapitalize: 'none',
          autoCorrect: false,
        };
      case 'email':
        return {
          keyboardType: 'email-address',
          autoCapitalize: 'none',
          autoCorrect: false,
        };
      case 'number':
        return {
          keyboardType: 'numeric',
        };
      case 'phone':
        return {
          keyboardType: 'phone-pad',
        };
      default:
        return {};
    }
  };

  // Get border color based on state
  const getBorderColor = () => {
    if (error) return Colors.feedback.error;
    if (isFocused) return Colors.brand.blue;
    return Colors.border.default;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: disabled ? Colors.background.subtle : Colors.background.paper,
          },
          isFocused && styles.focused,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            { color: disabled ? Colors.text.tertiary : Colors.text.primary },
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          {...getTypeProps()}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {/* Error or Helper Text */}
      {(error || helper) && (
        <Text
          variant="caption"
          style={[
            styles.helperText,
            error && { color: Colors.feedback.error },
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  focused: {
    borderWidth: 2,
    ...Shadows.sm,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    height: Spacing.xl,
    padding: 0, // Reset default padding
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  helperText: {
    marginTop: Spacing.xs,
  },
});

export default Input;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';

const FormInput = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  secureTextEntry = false,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const renderPasswordToggle = () => {
    if (!secureTextEntry) return null;

    return (
      <TouchableOpacity
        style={styles.passwordToggle}
        onPress={togglePasswordVisibility}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.passwordToggleText}>
          {isPasswordVisible ? '🙈' : '👁️'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return renderPasswordToggle();
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={onRightIconPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {rightIcon}
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[
          styles.label,
          error && styles.labelError,
          isFocused && styles.labelFocused,
        ]}>
          {label}
        </Text>
      )}

      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        !editable && styles.inputContainerDisabled,
      ]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {renderRightIcon()}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  labelFocused: {
    color: Colors.flowcrew.gradientStart,
  },
  labelError: {
    color: Colors.error[600],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.flowcrew.white,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: Colors.flowcrew.gradientStart,
    backgroundColor: Colors.primary[50],
  },
  inputContainerError: {
    borderColor: Colors.error[500],
    backgroundColor: Colors.error[50],
  },
  inputContainerDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[300],
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    paddingVertical: Spacing.sm,
    textAlignVertical: 'top',
  },
  inputWithLeftIcon: {
    marginLeft: Spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: Spacing.sm,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: Spacing.sm,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
  },
  passwordToggle: {
    padding: Spacing.xs,
  },
  passwordToggleText: {
    fontSize: Typography.fontSize.lg,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error[600],
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default FormInput;

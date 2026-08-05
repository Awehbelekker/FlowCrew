import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { Colors, BorderRadius, Shadows } from '../styles/FlowCrewDesignSystem';

/**
 * Avatar Component
 *
 * A customizable avatar component that follows FlowCrew design principles
 *
 * @param {string} src - Image source
 * @param {string} size - 'xs', 'sm', 'md', 'lg', 'xl'
 * @param {string} name - User name (for fallback)
 * @param {string} status - 'online', 'offline', 'away', 'busy'
 * @param {object} style - Additional styles
 */
const Avatar = ({
  src,
  size = 'md',
  name = '',
  status,
  style,
}) => {
  // Size variations in pixels
  const sizeValues = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  // Status color
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return Colors.feedback.success;
      case 'offline':
        return Colors.text.tertiary;
      case 'away':
        return Colors.feedback.warning;
      case 'busy':
        return Colors.feedback.error;
      default:
        return null;
    }
  };

  // Generate initials from name
  const getInitials = () => {
    if (!name) return '';

    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    } else {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
  };

  const avatarSize = sizeValues[size] || sizeValues.md;
  const statusSize = avatarSize / 4;
  const fontSize = avatarSize / 2.5;

  return (
    <View style={[styles.container, style]}>
      {src ? (
        <Image
          source={typeof src === 'string' ? { uri: src } : src}
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: avatarSize,
              height: avatarSize,
              backgroundColor: Colors.brand.blue,
            },
          ]}
        >
          <Text
            style={[
              styles.fallbackText,
              { fontSize },
            ]}
          >
            {getInitials()}
          </Text>
        </View>
      )}

      {status && (
        <View
          style={[
            styles.status,
            {
              width: statusSize,
              height: statusSize,
              backgroundColor: getStatusColor(),
              borderWidth: statusSize / 8,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    borderRadius: BorderRadius.full,
  },
  fallback: {
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: Colors.text.inverse,
    fontWeight: 'bold',
  },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: BorderRadius.full,
    borderColor: Colors.background.paper,
  },
});

export default Avatar;

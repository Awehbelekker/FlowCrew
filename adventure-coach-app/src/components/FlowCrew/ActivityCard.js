import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../styles/FlowCrewDesignSystem';
import Text from './Text';
import Badge from './Badge';

/**
 * ActivityCard Component
 *
 * A card component for displaying activities and lessons
 *
 * @param {string} title - Activity title
 * @param {string} subtitle - Activity subtitle or description
 * @param {string} imageSource - Image source (local or remote)
 * @param {string} duration - Activity duration
 * @param {string} difficulty - Activity difficulty level
 * @param {string} category - Activity category
 * @param {function} onPress - Card press handler
 * @param {object} style - Additional styles
 */
const ActivityCard = ({
  title,
  subtitle,
  imageSource,
  duration,
  difficulty,
  category,
  onPress,
  style,
}) => {
  // Get difficulty badge variant
  const getDifficultyVariant = () => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'moderate':
        return 'info';
      case 'hard':
        return 'warning';
      case 'expert':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Activity Image */}
      <View style={styles.imageContainer}>
        <Image
          source={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Category Badge */}
        {category && (
          <View style={styles.categoryBadge}>
            <Badge variant="neutral" size="sm">
              {category}
            </Badge>
          </View>
        )}
      </View>

      {/* Activity Info */}
      <View style={styles.infoContainer}>
        <Text variant="h5" numberOfLines={1}>
          {title}
        </Text>

        {subtitle && (
          <Text variant="body-sm" color={Colors.text.secondary} numberOfLines={2} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}

        {/* Additional Info */}
        <View style={styles.metaContainer}>
          {duration && (
            <View style={styles.metaItem}>
              <Text variant="caption" color={Colors.text.secondary}>
                {duration}
              </Text>
            </View>
          )}

          {difficulty && (
            <Badge variant={getDifficultyVariant()} size="sm">
              {difficulty}
            </Badge>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
    marginBottom: Spacing.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  infoContainer: {
    padding: Spacing.md,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: Spacing.xs,
  },
});

export default ActivityCard;

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../styles/FlowCrewDesignSystem';
import Text from './Text';

/**
 * SelectionGroup Component
 *
 * A component for displaying a list of selectable options
 *
 * @param {array} options - Array of option objects { id, label, description?, icon? }
 * @param {string|array} selected - Selected option ID or array of selected IDs
 * @param {function} onSelect - Selection change handler
 * @param {boolean} multiple - Allow multiple selection
 * @param {string} variant - 'default', 'compact'
 * @param {object} style - Additional styles
 */
const SelectionGroup = ({
  options = [],
  selected,
  onSelect,
  multiple = false,
  variant = 'default',
  style,
}) => {
  // Check if an option is selected
  const isSelected = (optionId) => {
    if (multiple && Array.isArray(selected)) {
      return selected.includes(optionId);
    }
    return selected === optionId;
  };

  // Handle option press
  const handleSelect = (optionId) => {
    if (multiple && Array.isArray(selected)) {
      if (selected.includes(optionId)) {
        // Remove from selection
        onSelect(selected.filter(id => id !== optionId));
      } else {
        // Add to selection
        onSelect([...selected, optionId]);
      }
    } else {
      onSelect(optionId);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => {
        const isItemSelected = isSelected(option.id);

        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              variant === 'compact' && styles.compactOption,
              isItemSelected && styles.selectedOption,
              index === 0 && styles.firstOption,
              index === options.length - 1 && styles.lastOption,
            ]}
            onPress={() => handleSelect(option.id)}
            activeOpacity={0.7}
          >
            {/* Option Content */}
            <View style={styles.optionContent}>
              {/* Icon if provided */}
              {option.icon && (
                <View style={styles.iconContainer}>
                  {option.icon}
                </View>
              )}

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text
                  variant="body"
                  style={[
                    isItemSelected && styles.selectedText
                  ]}
                >
                  {option.label}
                </Text>

                {option.description && variant !== 'compact' && (
                  <Text
                    variant="caption"
                    color={Colors.text.secondary}
                  >
                    {option.description}
                  </Text>
                )}
              </View>
            </View>

            {/* Selection Indicator */}
            <View
              style={[
                styles.indicator,
                isItemSelected ? styles.selectedIndicator : styles.unselectedIndicator
              ]}
            >
              {isItemSelected && (
                <View style={styles.indicatorInner} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.subtle,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  compactOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  firstOption: {
    // Specific styles for the first option
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: Colors.background.paper,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  selectedText: {
    fontWeight: Typography.fontWeight.medium,
    color: Colors.brand.green,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    backgroundColor: Colors.brand.green,
  },
  unselectedIndicator: {
    backgroundColor: Colors.background.subtle,
    borderWidth: 2,
    borderColor: Colors.border.default,
  },
  indicatorInner: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.paper,
  },
});

export default SelectionGroup;

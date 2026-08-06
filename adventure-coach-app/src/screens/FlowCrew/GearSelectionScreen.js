import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, VisualEffects, EnhancedSpacing } from '../../styles/FlowCrewDesignSystem';
import {
  Text,
  Button,
  Header,
  Card,
  SelectionGroup
} from '../../components/FlowCrew';
import { FlowCrewLogo } from '../../components/FlowCrew/Icons';

// Sample gear data
const GEAR_ITEMS = [
  {
    id: 1,
    name: 'Surfboard',
    type: 'Board',
    size: '6\'2"',
    price: 20,
    available: true,
    image: require('../../../assets/placeholder-image.jpg'),
  },
  {
    id: 2,
    name: 'Wetsuit',
    type: 'Clothing',
    size: 'M',
    price: 15,
    available: true,
    image: require('../../../assets/placeholder-image.jpg'),
  },
  {
    id: 3,
    name: 'Wetsuit',
    type: 'Clothing',
    size: 'L',
    price: 15,
    available: false,
    image: require('../../../assets/placeholder-image.jpg'),
  },
  {
    id: 4,
    name: 'Surfboard',
    type: 'Board',
    size: '5\'10"',
    price: 18,
    available: true,
    image: require('../../../assets/placeholder-image.jpg'),
  },
];

const GearSelectionScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('type');
  const [selectedGear, setSelectedGear] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const filters = [
    { id: 'type', label: 'Type' },
    { id: 'size', label: 'Size' },
  ];

  const handleGearSelect = (gearId) => {
    setSelectedGear(prev =>
      prev.includes(gearId)
        ? prev.filter(id => id !== gearId)
        : [...prev, gearId]
    );
  };

  const renderGearItem = (item, index) => (
    <Animated.View
      key={item.id}
      style={[
        styles.gearItem,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.gearCard,
          selectedGear.includes(item.id) && styles.selectedGear,
          !item.available && styles.unavailableGear,
        ]}
        onPress={() => item.available && handleGearSelect(item.id)}
        disabled={!item.available}
        activeOpacity={0.8}
      >
        <Image source={item.image} style={styles.gearImage} />
        <View style={styles.gearInfo}>
          <Text variant="subtitle" bold style={styles.gearName}>
            {item.name}
          </Text>
          <Text variant="caption" color="secondary">
            {item.size}
          </Text>
          {item.available ? (
            <Text variant="caption" color="brand" bold>
              ${item.price}
            </Text>
          ) : (
            <Text variant="caption" color="tertiary">
              Unavailable
            </Text>
          )}
        </View>
        {selectedGear.includes(item.id) && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <Header
        title="Gear Selection"
        showLogo={true}
        leftAction={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text>←</Text>
          </TouchableOpacity>
        }
      />

      {/* Enhanced Filter Section */}
      <Animated.View
        style={[
          styles.filterSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SelectionGroup
          options={filters}
          selectedValue={selectedFilter}
          onSelectionChange={setSelectedFilter}
          variant="segmented"
        />
      </Animated.View>

      {/* Gear Grid with Enhanced Visual Effects */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.gearGrid}>
          {GEAR_ITEMS.map((item, index) => renderGearItem(item, index))}
        </View>
      </ScrollView>

      {/* Enhanced Continue Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Button
          variant="primary"
          size="lg"
          onPress={() => {}}
          style={styles.continueButton}
          disabled={selectedGear.length === 0}
        >
          Continue
        </Button>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui.background,
  },

  filterSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: EnhancedSpacing.sectionGap,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  gearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gearItem: {
    width: '48%',
    marginBottom: EnhancedSpacing.componentGap,
  },

  gearCard: {
    backgroundColor: Colors.ui.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },

  selectedGear: {
    borderColor: Colors.brand.green,
    shadowColor: Colors.brand.green,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },

  unavailableGear: {
    opacity: 0.5,
    shadowOpacity: 0.05,
    elevation: 1,
  },

  gearImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },

  gearInfo: {
    alignItems: 'center',
  },

  gearName: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },

  selectedIndicator: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.brand.green,
    borderRadius: BorderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.brand.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  checkmark: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: 'bold',
  },

  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  continueButton: {
    shadowColor: Colors.brand.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default GearSelectionScreen;

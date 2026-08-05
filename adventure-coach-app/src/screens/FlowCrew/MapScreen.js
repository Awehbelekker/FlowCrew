import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../styles/FlowCrewDesignSystem';
import {
  Text,
  Button,
  Card,
  Header,
  Badge
} from '../../components/FlowCrew';
import {
  MapIcon,
  SearchIcon,
  BikeIcon,
  HikeIcon,
  ClimbIcon,
  WaterIcon
} from '../../components/FlowCrew/Icons';

// Sample data for nearby activities
const NEARBY_ACTIVITIES = [
  {
    id: 1,
    title: 'Sunset Peak Trail',
    type: 'hiking',
    distance: '1.2 mi',
    rating: 4.8,
    reviews: 24,
    coordinate: { latitude: 40.0183, longitude: -105.2812 },
  },
  {
    id: 2,
    title: 'Red Rocks Biking Loop',
    type: 'biking',
    distance: '0.8 mi',
    rating: 4.6,
    reviews: 42,
    coordinate: { latitude: 40.0303, longitude: -105.2576 },
  },
  {
    id: 3,
    title: 'Boulder Canyon Climbing',
    type: 'climbing',
    distance: '1.5 mi',
    rating: 4.9,
    reviews: 16,
    coordinate: { latitude: 40.0120, longitude: -105.3023 },
  },
  {
    id: 4,
    title: 'Clear Creek Kayaking',
    type: 'water',
    distance: '2.3 mi',
    rating: 4.7,
    reviews: 31,
    coordinate: { latitude: 40.0410, longitude: -105.2734 },
  },
];

const MapScreen = ({ navigation }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(['hiking', 'biking', 'climbing', 'water']);

  // Get activity icon based on type
  const getActivityIcon = (type, size = 24) => {
    switch (type) {
      case 'biking':
        return <BikeIcon size={size} color={Colors.text.primary} />;
      case 'hiking':
        return <HikeIcon size={size} color={Colors.text.primary} />;
      case 'climbing':
        return <ClimbIcon size={size} color={Colors.text.primary} />;
      case 'water':
        return <WaterIcon size={size} color={Colors.text.primary} />;
      default:
        return <MapIcon size={size} color={Colors.text.primary} />;
    }
  };

  // Toggle a filter
  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Explore Nearby"
        transparent
        rightAction={
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {}}
          >
            <SearchIcon color={Colors.text.inverse} />
          </TouchableOpacity>
        }
      />

      {/* Map Placeholder - Would be replaced with actual map component */}
      <View style={styles.mapContainer}>
        <Text variant="body" color={Colors.text.inverse} style={styles.mapPlaceholder}>
          Interactive Map would be displayed here
        </Text>

        {/* Activity Markers would be placed here */}
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilters.includes('hiking') && styles.filterButtonActive
          ]}
          onPress={() => toggleFilter('hiking')}
        >
          <HikeIcon
            color={selectedFilters.includes('hiking') ? Colors.text.inverse : Colors.text.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilters.includes('biking') && styles.filterButtonActive
          ]}
          onPress={() => toggleFilter('biking')}
        >
          <BikeIcon
            color={selectedFilters.includes('biking') ? Colors.text.inverse : Colors.text.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilters.includes('climbing') && styles.filterButtonActive
          ]}
          onPress={() => toggleFilter('climbing')}
        >
          <ClimbIcon
            color={selectedFilters.includes('climbing') ? Colors.text.inverse : Colors.text.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilters.includes('water') && styles.filterButtonActive
          ]}
          onPress={() => toggleFilter('water')}
        >
          <WaterIcon
            color={selectedFilters.includes('water') ? Colors.text.inverse : Colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Activity Cards */}
      <View style={styles.activityCardsContainer}>
        {NEARBY_ACTIVITIES.filter(activity => selectedFilters.includes(activity.type)).map(activity => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityCard,
              selectedActivity === activity.id && styles.activityCardSelected
            ]}
            onPress={() => setSelectedActivity(activity.id)}
          >
            <View style={styles.activityCardContent}>
              <View style={styles.activityIconContainer}>
                {getActivityIcon(activity.type, 20)}
              </View>
              <View style={styles.activityDetails}>
                <Text
                  variant="body-sm"
                  bold
                  numberOfLines={1}
                  style={styles.activityTitle}
                >
                  {activity.title}
                </Text>
                <View style={styles.activityMetrics}>
                  <Text variant="caption" color={Colors.text.secondary}>
                    {activity.distance} • ★ {activity.rating}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Sheet - Selected Activity Details */}
      {selectedActivity && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />

          {(() => {
            const activity = NEARBY_ACTIVITIES.find(a => a.id === selectedActivity);
            return (
              <>
                <View style={styles.selectedActivityHeader}>
                  <View style={styles.selectedActivityIcon}>
                    {getActivityIcon(activity.type, 24)}
                  </View>
                  <View style={styles.selectedActivityDetails}>
                    <Text variant="h5">{activity.title}</Text>
                    <Text variant="body-sm" color={Colors.text.secondary}>
                      {activity.distance} away • {activity.rating} ★ ({activity.reviews} reviews)
                    </Text>
                  </View>
                </View>

                <View style={styles.bottomSheetActions}>
                  <Button
                    variant="outline"
                    style={styles.directionsButton}
                    onPress={() => {}}
                  >
                    Get Directions
                  </Button>
                  <Button
                    variant="primary"
                    style={styles.detailsButton}
                    onPress={() => navigation.navigate('ActivityDetails', { activityId: activity.id })}
                  >
                    View Details
                  </Button>
                </View>
              </>
            );
          })()}
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#97CADB', // Placeholder color for map
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholder: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    position: 'absolute',
    top: 100,
    right: Spacing.lg,
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: Colors.brand.green,
  },
  activityCardsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  activityCard: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: (width - Spacing.lg * 2 - Spacing.sm * 2) / 2,
    maxWidth: (width - Spacing.lg * 2 - Spacing.sm * 2) / 2,
  },
  activityCardSelected: {
    borderColor: Colors.brand.green,
    borderWidth: 2,
  },
  activityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: Colors.background.subtle,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    marginBottom: 2,
  },
  activityMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.paper,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border.default,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  selectedActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  selectedActivityIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.background.subtle,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  selectedActivityDetails: {
    flex: 1,
  },
  bottomSheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  directionsButton: {
    flex: 1,
  },
  detailsButton: {
    flex: 1,
  },
});

export default MapScreen;

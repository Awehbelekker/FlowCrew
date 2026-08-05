import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const ActivityTabs = ({ activities, selectedActivity, onSelectActivity }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {activities.map((activity) => (
        <TouchableOpacity
          key={activity}
          onPress={() => onSelectActivity(activity)}
          style={[
            styles.tab,
            selectedActivity === activity && styles.selectedTab
          ]}
        >
          <Text
            style={[
              styles.tabText,
              selectedActivity === activity && styles.selectedTabText
            ]}
          >
            {activity}
          </Text>
          {selectedActivity === activity && <View style={styles.indicator} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 50,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 16,
    position: 'relative',
  },
  selectedTab: {
    // No background color change - just the indicator below
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6D7A8C',
  },
  selectedTabText: {
    fontWeight: '600',
    color: '#1E2A39',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: '#2196F3',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});

export default ActivityTabs;

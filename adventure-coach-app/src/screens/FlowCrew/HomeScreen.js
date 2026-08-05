import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import FlowCrewLogo from '../../components/FlowCrew/FlowCrewLogo';

// Note: In a real app, these would be imported properly
const ACTIVITY_ICONS = {
  surfing: require('../../assets/surfing-icon.png'),
  sailing: require('../../assets/sailing-icon.png'),
  kitesurfing: require('../../assets/kitesurfing-icon.png'),
  kayaking: require('../../assets/kayaking-icon.png'),
};

const HomeScreen = ({ navigation }) => {
  const handleBookNow = () => {
    navigation.navigate('LessonSelection');
  };

  const handleBrowse = () => {
    navigation.navigate('ActivityBrowser');
  };

  const handleActivityPress = (activity) => {
    navigation.navigate('LessonSelection', { initialActivity: activity.toLowerCase() });
  };

  const handleBottomNavPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <FlowCrewLogo size="large" />

      {/* Title */}
      <Text style={styles.title}>Upcoming Activities</Text>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.bookNowButton} onPress={handleBookNow}>
          <Text style={styles.bookNowText}>Book now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.browseButton} onPress={handleBrowse}>
          <Text style={styles.browseText}>Browse</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Grid */}
      <View style={styles.activityGrid}>
        <View style={styles.activityRow}>
          <TouchableOpacity
            style={styles.activityCard}
            onPress={() => handleActivityPress('surfing')}
          >
            <View style={styles.activityIconContainer}>
              <Image source={ACTIVITY_ICONS.surfing} style={styles.activityIcon} />
            </View>
            <Text style={styles.activityName}>Surfing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityCard}
            onPress={() => handleActivityPress('sailing')}
          >
            <View style={styles.activityIconContainer}>
              <Image source={ACTIVITY_ICONS.sailing} style={styles.activityIcon} />
            </View>
            <Text style={styles.activityName}>Sailing</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityRow}>
          <TouchableOpacity
            style={styles.activityCard}
            onPress={() => handleActivityPress('kitesurfing')}
          >
            <View style={styles.activityIconContainer}>
              <Image source={ACTIVITY_ICONS.kitesurfing} style={styles.activityIcon} />
            </View>
            <Text style={styles.activityName}>Kitesurfing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityCard}
            onPress={() => handleActivityPress('kayaking')}
          >
            <View style={styles.activityIconContainer}>
              <Image source={ACTIVITY_ICONS.kayaking} style={styles.activityIcon} />
            </View>
            <Text style={styles.activityName}>Kayaking</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleBottomNavPress('Home')}
        >
          <View style={styles.navIcon}>
            <Text>🏠</Text>
          </View>
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleBottomNavPress('Schedule')}
        >
          <View style={styles.navIcon}>
            <Text>📅</Text>
          </View>
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleBottomNavPress('Book')}
        >
          <View style={[styles.navIcon, styles.bookIcon]}>
            <FlowCrewLogo size="small" showText={false} />
          </View>
          <Text style={styles.navText}>Book</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleBottomNavPress('Messages')}
        >
          <View style={styles.navIcon}>
            <Text>💬</Text>
          </View>
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleBottomNavPress('Settings')}
        >
          <View style={styles.navIcon}>
            <Text>⚙️</Text>
          </View>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1E2A39',
    marginTop: 24,
    marginBottom: 32,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 32,
  },
  bookNowButton: {
    flex: 1,
    backgroundColor: '#7ED321',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginRight: 8,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  browseButton: {
    flex: 1,
    backgroundColor: '#E6F4FF',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  browseText: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: '600',
  },
  activityGrid: {
    paddingHorizontal: 24,
    width: '100%',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  activityIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 48,
    height: 48,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2A39',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookIcon: {
    backgroundColor: '#2196F3',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  navText: {
    fontSize: 12,
    color: '#6D7A8C',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#1E2A39',
    fontWeight: '600',
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#1E2A39',
    borderRadius: 2.5,
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -67, // half width for centering
  },
});

export default HomeScreen;

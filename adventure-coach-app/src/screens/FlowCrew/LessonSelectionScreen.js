import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import FlowCrewLogo from '../../components/FlowCrew/FlowCrewLogo';
import ActivityTabs from '../../components/FlowCrew/ActivityTabs';
import LessonCard from '../../components/FlowCrew/LessonCard';

const ACTIVITIES = ['Surfing', 'Sailing', 'Kitesurfing', 'Kayaking'];

const INSTRUCTORS = [
  {
    id: 1,
    name: 'Daniel',
    photoUrl: 'https://example.com/daniel.jpg', // This would be a real image path
    rating: 4.9,
    time: '9:00 AM',
    availability: 'available'
  },
  {
    id: 2,
    name: 'Clara',
    photoUrl: 'https://example.com/clara.jpg',
    rating: 4.8,
    time: '11:00 AM',
    availability: 'available'
  },
  {
    id: 3,
    name: 'Jeff',
    photoUrl: 'https://example.com/jeff.jpg',
    rating: 5.0,
    time: '2:00 PM',
    availability: 'available'
  }
];

const LessonSelectionScreen = ({ navigation }) => {
  const [selectedActivity, setSelectedActivity] = React.useState('Surfing');

  const handleBookLesson = (instructor) => {
    navigation.navigate('GearSelection', { instructor });
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <FlowCrewLogo size="medium" />

      {/* Activity Tabs */}
      <ActivityTabs
        activities={ACTIVITIES}
        selectedActivity={selectedActivity}
        onSelectActivity={setSelectedActivity}
      />

      {/* Lesson Selection Title */}
      <Text style={styles.title}>Select a Lesson</Text>

      {/* Instructor List */}
      <View style={styles.instructorsList}>
        {INSTRUCTORS.map(instructor => (
          <LessonCard
            key={instructor.id}
            instructor={instructor}
            rating={instructor.rating}
            time={instructor.time}
            onBook={() => handleBookLesson(instructor)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1E2A39',
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  instructorsList: {
    paddingHorizontal: 24,
  }
});

export default LessonSelectionScreen;

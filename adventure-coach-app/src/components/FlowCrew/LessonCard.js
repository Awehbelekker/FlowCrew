import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import FlowCrewLogo from './FlowCrewLogo';

const LessonCard = ({ instructor, rating, time, onBook }) => {
  return (
    <View style={styles.card}>
      <View style={styles.leftContent}>
        <Image
          source={{ uri: instructor.photoUrl }}
          style={styles.instructorImage}
        />
      </View>
      <View style={styles.middleContent}>
        <Text style={styles.instructorName}>{instructor.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.rating}>{rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>
      <View style={styles.rightContent}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            rating === 5.0 ? styles.blueButton : styles.greenButton
          ]}
          onPress={onBook}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leftContent: {
    marginRight: 16,
  },
  instructorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  middleContent: {
    flex: 1,
    justifyContent: 'center',
  },
  instructorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2A39',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starIcon: {
    color: '#7ED321',
    fontSize: 16,
    marginRight: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E2A39',
  },
  time: {
    fontSize: 16,
    color: '#6D7A8C',
  },
  rightContent: {
    justifyContent: 'center',
  },
  bookButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenButton: {
    backgroundColor: '#7ED321',
  },
  blueButton: {
    backgroundColor: '#2196F3',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LessonCard;

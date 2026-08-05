import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../styles/FlowCrewDesignSystem';
import {
  Text,
  Button,
  Header,
  Card,
  Tabs,
  Badge
} from '../../components/FlowCrew';
import { BookingIcon, BikeIcon, HikeIcon, ClimbIcon, WaterIcon } from '../../components/FlowCrew/Icons';

// Sample data for upcoming bookings
const UPCOMING_BOOKINGS = [
  {
    id: 1,
    title: 'Mountain Biking Adventure',
    date: 'Aug 15, 2025',
    time: '9:00 AM - 1:00 PM',
    instructor: 'Sarah Johnson',
    price: '$85',
    location: 'Red Rocks Trail',
    status: 'confirmed',
    type: 'biking',
  },
  {
    id: 2,
    title: 'Rock Climbing Class',
    date: 'Aug 22, 2025',
    time: '10:00 AM - 12:30 PM',
    instructor: 'Mike Peterson',
    price: '$65',
    location: 'Boulder Canyon',
    status: 'pending',
    type: 'climbing',
  },
];

// Sample data for past bookings
const PAST_BOOKINGS = [
  {
    id: 1,
    title: 'Kayaking Tour',
    date: 'Jul 30, 2025',
    time: '8:00 AM - 10:00 AM',
    instructor: 'Emily Davis',
    price: '$55',
    location: 'Clear Lake',
    status: 'completed',
    type: 'water',
  },
  {
    id: 2,
    title: 'Hiking at Bear Mountain',
    date: 'Jul 22, 2025',
    time: '9:00 AM - 3:00 PM',
    instructor: 'Tom Wilson',
    price: '$45',
    location: 'Bear Mountain Trail',
    status: 'completed',
    type: 'hiking',
  },
  {
    id: 3,
    title: 'Beginner Rock Climbing',
    date: 'Jul 15, 2025',
    time: '11:00 AM - 2:00 PM',
    instructor: 'Mike Peterson',
    price: '$60',
    location: 'Training Center',
    status: 'canceled',
    type: 'climbing',
  },
];

const BookingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
    { id: 'favorites', label: 'Favorites' },
  ];

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
        return <BookingIcon size={size} color={Colors.text.primary} />;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'info';
      case 'completed':
        return 'neutral';
      case 'canceled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  // Render a booking item
  const renderBookingItem = (item) => (
    <Card
      key={item.id}
      variant="elevated"
      style={styles.bookingCard}
      interactive
      onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.activityIcon}>
          {getActivityIcon(item.type)}
        </View>
        <View style={styles.bookingTitleContainer}>
          <Text variant="h5" numberOfLines={1}>
            {item.title}
          </Text>
          <Text variant="body-sm" color={Colors.text.secondary}>
            {item.date} • {item.time}
          </Text>
        </View>
        <Badge variant={getStatusVariant(item.status)}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      </View>

      <View style={styles.divider} />

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text variant="body-sm" color={Colors.text.secondary}>
            Instructor
          </Text>
          <Text variant="body-sm">{item.instructor}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text variant="body-sm" color={Colors.text.secondary}>
            Location
          </Text>
          <Text variant="body-sm">{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text variant="body-sm" color={Colors.text.secondary}>
            Price
          </Text>
          <Text variant="body-sm" bold color={Colors.brand.green}>
            {item.price}
          </Text>
        </View>
      </View>

      {item.status !== 'completed' && item.status !== 'canceled' && (
        <View style={styles.actionsContainer}>
          {item.status === 'confirmed' && (
            <Button
              variant="outline"
              size="sm"
              onPress={() => {}}
            >
              Reschedule
            </Button>
          )}
          <Button
            variant={item.status === 'confirmed' ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => {}}
          >
            {item.status === 'pending' ? 'Pay Now' : 'View Details'}
          </Button>
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        title="My Bookings"
        rightAction={
          <TouchableOpacity onPress={() => {}}>
            <Text variant="body" color={Colors.brand.blue}>Filter</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.tabContainer}>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
          variant="default"
        />
      </View>

      <ScrollView style={styles.contentContainer}>
        {activeTab === 'upcoming' && (
          <>
            {UPCOMING_BOOKINGS.length > 0 ? (
              UPCOMING_BOOKINGS.map(renderBookingItem)
            ) : (
              <View style={styles.emptyState}>
                <BookingIcon size={48} color={Colors.text.tertiary} />
                <Text variant="h5" style={styles.emptyStateTitle}>No Upcoming Bookings</Text>
                <Text variant="body" color={Colors.text.secondary} center style={styles.emptyStateDesc}>
                  Explore activities and book your next adventure!
                </Text>
                <Button
                  variant="primary"
                  style={styles.emptyStateButton}
                  onPress={() => navigation.navigate('Discover')}
                >
                  Discover Activities
                </Button>
              </View>
            )}
          </>
        )}

        {activeTab === 'past' && (
          <>
            {PAST_BOOKINGS.length > 0 ? (
              PAST_BOOKINGS.map(renderBookingItem)
            ) : (
              <View style={styles.emptyState}>
                <BookingIcon size={48} color={Colors.text.tertiary} />
                <Text variant="h5" style={styles.emptyStateTitle}>No Past Bookings</Text>
                <Text variant="body" color={Colors.text.secondary} center style={styles.emptyStateDesc}>
                  Your booking history will appear here
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'favorites' && (
          <View style={styles.emptyState}>
            <BookingIcon size={48} color={Colors.text.tertiary} />
            <Text variant="h5" style={styles.emptyStateTitle}>No Favorites Yet</Text>
            <Text variant="body" color={Colors.text.secondary} center style={styles.emptyStateDesc}>
              Save your favorite activities for quick booking
            </Text>
            <Button
              variant="primary"
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Discover')}
            >
              Explore Activities
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  tabContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  bookingCard: {
    marginBottom: Spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  activityIcon: {
    marginRight: Spacing.md,
  },
  bookingTitleContainer: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginBottom: Spacing.md,
  },
  bookingDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
  },
  emptyStateTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateDesc: {
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  emptyStateButton: {
    minWidth: 200,
  },
});

export default BookingsScreen;

import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Modal, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../styles/FlowCrewDesignSystem';
import {
  Text,
  Button,
  Header,
  Input,
  Card,
  Badge
} from '../../components/FlowCrew';
import { FlowCrewLogo, MessageIcon } from '../../components/FlowCrew/Icons';
import EnhancedChatInterface from '../../components/EnhancedChatInterface';

// Sample message data
const MESSAGES = [
  {
    id: 1,
    sender: 'Sarah Johnson',
    avatar: require('../../../assets/placeholder-coach.jpg'),
    lastMessage: 'Looking forward to our hiking session tomorrow!',
    timestamp: '10:23 AM',
    unread: true,
  },
  {
    id: 2,
    sender: 'Adventure Guides',
    avatar: require('../../../assets/placeholder-image.jpg'),
    lastMessage: 'Your booking for Rock Climbing Basics has been confirmed.',
    timestamp: 'Yesterday',
    unread: false,
  },
  {
    id: 3,
    sender: 'Mike Peterson',
    avatar: require('../../../assets/placeholder-coach.jpg'),
    lastMessage: 'Here are some warm-up exercises you can try before our session.',
    timestamp: 'Monday',
    unread: false,
  },
  {
    id: 4,
    sender: 'FlowCrew Support',
    avatar: require('../../../assets/placeholder-image.jpg'),
    lastMessage: "Thanks for reaching out! We'll get back to you shortly.",
    timestamp: 'Last week',
    unread: false,
  },
  {
    id: 5,
    sender: 'Emily Davis',
    avatar: require('../../../assets/placeholder-coach.jpg'),
    lastMessage: 'The kayaking trip was postponed due to weather. Let me suggest some alternative dates.',
    timestamp: 'Apr 15',
    unread: true,
  },
];

const MessageItem = ({ item, onPress }) => (
  <TouchableOpacity
    style={[styles.messageItem, item.unread && styles.unreadMessage]}
    onPress={onPress}
  >
    <Image source={item.avatar} style={styles.avatar} />
    <View style={styles.messageContent}>
      <View style={styles.messageHeader}>
        <Text variant="subtitle" numberOfLines={1} style={[styles.senderName, item.unread && styles.unreadText]}>
          {item.sender}
        </Text>
        <Text variant="caption" color={item.unread ? Colors.primary.default : Colors.text.secondary}>
          {item.timestamp}
        </Text>
      </View>
      <Text
        variant="body"
        numberOfLines={1}
        color={item.unread ? Colors.text.primary : Colors.text.secondary}
        style={item.unread && styles.unreadText}
      >
        {item.lastMessage}
      </Text>
    </View>
    {item.unread && <Badge size="sm" />}
  </TouchableOpacity>
);

const MessagesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatAnimation] = useState(new Animated.Value(0));

  const handleMessagePress = (messageId) => {
    // Find the conversation for this message
    const conversation = MESSAGES.find(msg => msg.id === messageId);
    if (conversation) {
      setSelectedConversation({
        id: conversation.id,
        name: conversation.sender,
        participants: [conversation.sender, 'current-user'],
        type: 'direct',
      });
      setShowChatModal(true);

      // Animate chat modal
      Animated.timing(chatAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleCloseChat = () => {
    Animated.timing(chatAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowChatModal(false);
      setSelectedConversation(null);
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <Header
        title="Messages"
        showLogo={true}
        rightAction={
          <TouchableOpacity onPress={() => {}} style={styles.headerAction}>
            <Text>➕</Text>
          </TouchableOpacity>
        }
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search messages"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="🔍"
          clearButton
          style={styles.searchInput}
        />
      </View>

      {/* Message Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <Button
          variant="primary"
          size="sm"
          style={styles.filterButton}
        >
          All
        </Button>
        <Button
          variant="secondary"
          size="sm"
          style={styles.filterButton}
        >
          Unread
        </Button>
        <Button
          variant="secondary"
          size="sm"
          style={styles.filterButton}
        >
          Coaches
        </Button>
        <Button
          variant="secondary"
          size="sm"
          style={styles.filterButton}
        >
          System
        </Button>
      </ScrollView>

      {/* Message List */}
      <FlatList
        data={MESSAGES}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MessageItem item={item} onPress={() => handleMessagePress(item.id)} />
        )}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Empty State (would conditionally render when no messages) */}
      {MESSAGES.length === 0 && (
        <View style={styles.emptyState}>
          <MessageIcon size={64} color={Colors.primary.light} />
          <Text variant="h3" style={styles.emptyStateTitle}>No Messages Yet</Text>
          <Text variant="body" color={Colors.text.secondary} style={styles.emptyStateSubtitle}>
            Your conversations with coaches and the community will appear here
          </Text>
          <Button
            variant="primary"
            size="lg"
            onPress={() => {}}
            style={styles.emptyStateButton}
          >
            Find Coaches
          </Button>
        </View>
      )}

      {/* Enhanced Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseChat}
      >
        <Animated.View
          style={[
            styles.chatModal,
            {
              opacity: chatAnimation,
              transform: [{
                translateY: chatAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              }],
            },
          ]}
        >
          {selectedConversation && (
            <EnhancedChatInterface
              conversation={selectedConversation}
              onClose={handleCloseChat}
              showWhatsApp={true}
              showVoiceMessages={true}
              showReactions={true}
            />
          )}
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  headerAction: {
    padding: Spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterContainer: {
    marginBottom: Spacing.md,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
  },
  filterButton: {
    marginRight: Spacing.md,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: Spacing.lg,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  unreadMessage: {
    backgroundColor: Colors.primary.faded,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs / 2,
  },
  senderName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadText: {
    fontFamily: Typography.fontWeight.medium,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.light,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyStateTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyStateButton: {
    minWidth: 200,
  },
  chatModal: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
});

export default MessagesScreen;

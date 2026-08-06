import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Image,
  Animated,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/designSystem';
import { VisualEffects, EnhancedSpacing } from '../styles/FlowCrewDesignSystem';
import { Button, Card, Text as FlowCrewText } from './FlowCrew';
import { AuthService } from '../services/AuthService';
import WhatsAppIntegrationService from '../services/WhatsAppIntegrationService';
import { CommunicationService } from '../services/CommunicationService';
import SubscriptionService from '../services/SubscriptionService';
import SubscriptionUpgradeModal from './SubscriptionUpgradeModal';
import LoadingSpinner from './LoadingSpinner';

const EnhancedChatInterface = ({
  conversation,
  onClose,
  onSendMessage,
  showWhatsApp = true,
  showVoiceMessages = true,
  showReactions = true,
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [voiceRecorder, setVoiceRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionInitialized, setSubscriptionInitialized] = useState(false);

  const scrollViewRef = useRef();
  const inputRef = useRef();
  const recordingTimerRef = useRef();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize subscription service
    initializeSubscription();

    // Load messages
    loadMessages();

    // Initialize voice recorder
    if (showVoiceMessages) {
      initializeVoiceRecorder();
    }
  }, []);

  // Load conversation messages
  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await CommunicationService.getMessages(conversation.id, 50, 0);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize subscription service
  const initializeSubscription = async () => {
    try {
      await SubscriptionService.initialize();
      setSubscriptionInitialized(true);

      // Check WhatsApp access after subscription is loaded
      if (showWhatsApp) {
        const hasWhatsAppAccess = SubscriptionService.hasFeatureAccess('whatsapp_integration');
        setWhatsappEnabled(hasWhatsAppAccess);

        if (!hasWhatsAppAccess) {
          console.log('WhatsApp integration requires subscription upgrade');
        }
      }
    } catch (error) {
      console.error('Failed to initialize subscription service:', error);
      setSubscriptionInitialized(false);
    }
  };

  // Initialize voice recorder
  const initializeVoiceRecorder = async () => {
    // This would integrate with a voice recording library
    // For now, we'll create a mock implementation
    setVoiceRecorder({
      startRecording: () => {
        setIsRecording(true);
        setRecordingTime(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      },
      stopRecording: () => {
        setIsRecording(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
        return { audioUrl: 'mock-audio-url', duration: recordingTime };
      },
    });
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const messageData = {
        content: message.trim(),
        type: 'text',
        timestamp: new Date().toISOString(),
      };

      // Send via in-app chat
      const result = await CommunicationService.sendMessage(
        conversation.id,
        messageData.content
      );

      // Add to local state
      setMessages(prev => [...prev, {
        id: result.id || Date.now(),
        content: messageData.content,
        sender: 'user',
        timestamp: messageData.timestamp,
        type: 'text',
      }]);

      setMessage('');

      // Auto-scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Call parent callback
      if (onSendMessage) {
        onSendMessage(messageData);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  // Send WhatsApp message
  const handleSendWhatsApp = async () => {
    if (!message.trim()) return;

    // Check if user has WhatsApp access
    if (!whatsappEnabled) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const phoneNumber = conversation.participants.find(p => p !== AuthService.getCurrentUser()?.id);

      if (!phoneNumber) {
        Alert.alert('Error', 'No valid phone number found for WhatsApp');
        return;
      }

      await WhatsAppIntegrationService.sendMessage(phoneNumber, {
        type: 'text',
        content: message.trim(),
      });

      Alert.alert('Success', 'Message sent via WhatsApp');
      setMessage('');
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      Alert.alert('Error', 'Failed to send WhatsApp message');
    }
  };

  // Start voice recording
  const handleStartRecording = () => {
    if (!voiceRecorder) return;

    try {
      voiceRecorder.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start voice recording');
    }
  };

  // Stop voice recording
  const handleStopRecording = async () => {
    if (!voiceRecorder || !isRecording) return;

    try {
      const recording = voiceRecorder.stopRecording();

      // Send voice message
      const messageData = {
        content: 'Voice message',
        type: 'audio',
        audioUrl: recording.audioUrl,
        duration: recording.duration,
        timestamp: new Date().toISOString(),
      };

      await CommunicationService.sendMessage(
        conversation.id,
        messageData.content,
        [{ type: 'audio', url: recording.audioUrl, duration: recording.duration }]
      );

      // Add to local state
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: messageData.content,
        sender: 'user',
        timestamp: messageData.timestamp,
        type: 'audio',
        audioUrl: recording.audioUrl,
        duration: recording.duration,
      }]);
    } catch (error) {
      console.error('Failed to send voice message:', error);
      Alert.alert('Error', 'Failed to send voice message');
    }
  };

  // Add reaction to message
  const handleAddReaction = async (messageId, reaction) => {
    try {
      await CommunicationService.addReaction(messageId, reaction);

      // Update local state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
          : msg
      ));
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  // Render message
  const renderMessage = (msg) => {
    const isOwnMessage = msg.sender === 'user';

    return (
      <Animated.View
        key={msg.id}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          { opacity: fadeAnim }
        ]}
      >
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}>
          {msg.type === 'text' && (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}>
              {msg.content}
            </Text>
          )}

          {msg.type === 'audio' && (
            <View style={styles.audioMessage}>
              <TouchableOpacity style={styles.playButton}>
                <Text>▶️</Text>
              </TouchableOpacity>
              <Text style={styles.audioDuration}>
                {Math.floor(msg.duration / 60)}:{(msg.duration % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}

          {msg.type === 'image' && (
            <Image source={{ uri: msg.imageUrl }} style={styles.messageImage} />
          )}

          <Text style={styles.messageTime}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Reactions */}
        {showReactions && msg.reactions && msg.reactions.length > 0 && (
          <View style={styles.reactionsContainer}>
            {msg.reactions.map((reaction, index) => (
              <Text key={index} style={styles.reaction}>
                {reaction}
              </Text>
            ))}
          </View>
        )}

        {/* Reaction button */}
        {showReactions && (
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => {
              setSelectedMessage(msg);
              setShowReactionPicker(true);
            }}
          >
            <Text>😊</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  // Render reaction picker
  const renderReactionPicker = () => {
    const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

    return (
      <Modal
        visible={showReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowReactionPicker(false)}
        >
          <View style={styles.reactionPicker}>
            {reactions.map((reaction, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reactionOption}
                onPress={() => {
                  if (selectedMessage) {
                    handleAddReaction(selectedMessage.id, reaction);
                  }
                  setShowReactionPicker(false);
                }}
              >
                <Text style={styles.reactionText}>{reaction}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {conversation.name || 'Chat'}
        </Text>
        <View style={styles.headerActions}>
          {whatsappEnabled && (
            <TouchableOpacity style={styles.whatsappButton}>
              <Text>📱</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          messages.map(renderMessage)
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            maxLength={1000}
          />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {showVoiceMessages && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isRecording && styles.recordingButton
                ]}
                onPress={isRecording ? handleStopRecording : handleStartRecording}
              >
                <Text style={styles.actionButtonText}>
                  {isRecording ? '⏹️' : '🎤'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.sendButton,
                message.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>

            {whatsappEnabled && (
              <TouchableOpacity
                style={[
                  styles.whatsappSendButton,
                  message.trim() ? styles.whatsappSendButtonActive : styles.whatsappSendButtonInactive
                ]}
                onPress={handleSendWhatsApp}
                disabled={!message.trim()}
              >
                <Text style={styles.whatsappSendButtonText}>📱</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <Text style={styles.recordingText}>
              Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => console.log('Schedule pressed')}>
            <Text style={styles.quickActionText}>📅 Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => console.log('Location pressed')}>
            <Text style={styles.quickActionText}>📍 Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => console.log('Conditions pressed')}>
            <Text style={styles.quickActionText}>🌊 Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => console.log('Payment pressed')}>
            <Text style={styles.quickActionText}>💰 Payment</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Reaction Picker Modal */}
      {renderReactionPicker()}

      {/* Subscription Upgrade Modal */}
      <SubscriptionUpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="whatsapp_integration"
        onUpgradeSuccess={() => {
          // Refresh subscription and re-enable WhatsApp
          SubscriptionService.refreshSubscription();
          const hasWhatsAppAccess = SubscriptionService.hasFeatureAccess('whatsapp_integration');
          setWhatsappEnabled(hasWhatsAppAccess);
          setShowUpgradeModal(false);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.surface,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappButton: {
    padding: Spacing.sm,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageContainer: {
    marginVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  ownBubble: {
    backgroundColor: Colors.primary.default,
    borderBottomRightRadius: BorderRadius.xs,
  },
  otherBubble: {
    backgroundColor: Colors.background.surface,
    borderBottomLeftRadius: BorderRadius.xs,
  },
  messageText: {
    fontSize: Typography.fontSize.md,
    lineHeight: Typography.lineHeight.md,
  },
  ownMessageText: {
    color: Colors.text.onPrimary,
  },
  otherMessageText: {
    color: Colors.text.primary,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioDuration: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.xs,
  },
  messageTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  reaction: {
    fontSize: Typography.fontSize.sm,
  },
  reactionButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.background.surface,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.default,
    borderRadius: BorderRadius.lg,
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: Colors.error.default,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.lg,
  },
  sendButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary.default,
  },
  sendButtonInactive: {
    backgroundColor: Colors.background.disabled,
  },
  sendButtonText: {
    color: Colors.text.onPrimary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontWeight.medium,
  },
  whatsappSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappSendButtonActive: {
    backgroundColor: '#25D366',
  },
  whatsappSendButtonInactive: {
    backgroundColor: Colors.background.disabled,
  },
  whatsappSendButtonText: {
    fontSize: Typography.fontSize.lg,
  },
  recordingIndicator: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  recordingText: {
    color: Colors.error.default,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontWeight.medium,
  },
  quickActions: {
    marginTop: Spacing.md,
  },
  quickAction: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary.light,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  quickActionText: {
    color: Colors.primary.default,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionPicker: {
    backgroundColor: Colors.background.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  reactionOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionText: {
    fontSize: Typography.fontSize.xl,
  },
});

export default EnhancedChatInterface;

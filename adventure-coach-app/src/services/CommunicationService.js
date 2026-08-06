import { AuthService } from './AuthService';
import { NotificationService } from './NotificationService';

/**
 * FlowCrew Enhanced Communication Service
 * Handles in-app chat, video calls, email notifications, and SMS
 */
class CommunicationServiceClass {
  constructor() {
    this.initialized = false;
    this.activeConversations = new Map();
    this.videoCallProvider = null; // Would integrate with Agora, Twilio, or WebRTC
    this.emailProvider = null; // Would integrate with SendGrid, Mailgun, etc.
    this.smsProvider = null; // Would integrate with Twilio SMS
  }

  // Initialize communication service
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize video calling SDK
      await this.initializeVideoCall();

      // Initialize email service
      await this.initializeEmailService();

      // Initialize SMS service
      await this.initializeSMSService();

      this.initialized = true;
      console.log('✅ Communication service initialized');
    } catch (error) {
      console.error('Failed to initialize communication service:', error);
      throw error;
    }
  }

  // Initialize video calling
  async initializeVideoCall() {
    try {
      // This would integrate with a video calling SDK like Agora or Twilio Video
      // For now, we'll create a mock implementation
      this.videoCallProvider = {
        createCall: async (participants) => {
          return {
            callId: Math.random().toString(36).substr(2, 9),
            participants,
            status: 'initiated',
            createdAt: new Date().toISOString(),
          };
        },
        joinCall: async (callId) => {
          return { joined: true, callId };
        },
        endCall: async (callId) => {
          return { ended: true, callId };
        },
      };
    } catch (error) {
      console.error('Failed to initialize video call service:', error);
    }
  }

  // Initialize email service
  async initializeEmailService() {
    try {
      // This would integrate with SendGrid, Mailgun, or similar
      this.emailProvider = {
        sendEmail: async (emailData) => {
          console.log('Mock email sent:', emailData);
          return { sent: true, messageId: Math.random().toString(36) };
        },
      };
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  // Initialize SMS service
  async initializeSMSService() {
    try {
      // This would integrate with Twilio SMS or similar
      this.smsProvider = {
        sendSMS: async (smsData) => {
          console.log('Mock SMS sent:', smsData);
          return { sent: true, messageId: Math.random().toString(36) };
        },
      };
    } catch (error) {
      console.error('Failed to initialize SMS service:', error);
    }
  }

  // Create or get conversation
  async createConversation(participants, type = 'direct') {
    try {
      await this.initialize();

      const conversationData = {
        participants,
        type, // 'direct', 'group', 'support'
        createdAt: new Date().toISOString(),
      };

      const response = await AuthService.apiRequest('/conversations', {
        method: 'POST',
        body: JSON.stringify(conversationData),
      });

      const conversation = response.conversation;
      this.activeConversations.set(conversation.id, conversation);

      // Join conversation room for real-time updates
      NotificationService.joinConversation(conversation.id);

      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  // Send message
  async sendMessage(conversationId, message, attachments = []) {
    try {
      const messageData = {
        conversationId,
        message,
        attachments,
        timestamp: new Date().toISOString(),
      };

      // Send via socket for real-time delivery
      const result = await NotificationService.sendMessage(
        conversationId,
        message,
        conversationId
      );

      // Also save to backend
      await AuthService.apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify(messageData),
      });

      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Get conversation messages
  async getMessages(conversationId, limit = 50, offset = 0) {
    try {
      const response = await AuthService.apiRequest(
        `/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
      );

      return response.messages;
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw error;
    }
  }

  // Start video call
  async startVideoCall(conversationId, participants) {
    try {
      await this.initialize();

      // Create video call session
      const call = await this.videoCallProvider.createCall(participants);

      // Notify participants
      for (const participantId of participants) {
        await NotificationService.sendMessage(participantId, 'video_call_invitation', {
          callId: call.callId,
          conversationId,
          initiator: AuthService.getCurrentUser()?.id,
        });
      }

      // Save call record
      await AuthService.apiRequest('/video-calls', {
        method: 'POST',
        body: JSON.stringify({
          callId: call.callId,
          conversationId,
          participants,
          status: 'initiated',
        }),
      });

      return call;
    } catch (error) {
      console.error('Failed to start video call:', error);
      throw error;
    }
  }

  // Join video call
  async joinVideoCall(callId) {
    try {
      const result = await this.videoCallProvider.joinCall(callId);

      // Update call status
      await AuthService.apiRequest(`/video-calls/${callId}/join`, {
        method: 'POST',
      });

      return result;
    } catch (error) {
      console.error('Failed to join video call:', error);
      throw error;
    }
  }

  // End video call
  async endVideoCall(callId) {
    try {
      const result = await this.videoCallProvider.endCall(callId);

      // Update call status
      await AuthService.apiRequest(`/video-calls/${callId}/end`, {
        method: 'POST',
      });

      return result;
    } catch (error) {
      console.error('Failed to end video call:', error);
      throw error;
    }
  }

  // Send email notification
  async sendEmailNotification(recipientEmail, templateId, templateData) {
    try {
      await this.initialize();

      const emailData = {
        to: recipientEmail,
        templateId,
        templateData,
        timestamp: new Date().toISOString(),
      };

      // Send via email provider
      const result = await this.emailProvider.sendEmail(emailData);

      // Log email sent
      await AuthService.apiRequest('/communications/email', {
        method: 'POST',
        body: JSON.stringify({
          ...emailData,
          messageId: result.messageId,
          status: 'sent',
        }),
      });

      return result;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw error;
    }
  }

  // Send SMS notification
  async sendSMSNotification(phoneNumber, message, templateId = null) {
    try {
      await this.initialize();

      const smsData = {
        to: phoneNumber,
        message,
        templateId,
        timestamp: new Date().toISOString(),
      };

      // Send via SMS provider
      const result = await this.smsProvider.sendSMS(smsData);

      // Log SMS sent
      await AuthService.apiRequest('/communications/sms', {
        method: 'POST',
        body: JSON.stringify({
          ...smsData,
          messageId: result.messageId,
          status: 'sent',
        }),
      });

      return result;
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      throw error;
    }
  }

  // Send booking confirmation
  async sendBookingConfirmation(booking) {
    try {
      const { student, coach, date, time, activity } = booking;

      // Email to student
      await this.sendEmailNotification(
        student.email,
        'booking_confirmation_student',
        {
          studentName: student.firstName,
          coachName: `${coach.firstName} ${coach.lastName}`,
          activity,
          date: new Date(date).toLocaleDateString(),
          time,
          bookingId: booking.id,
        }
      );

      // Email to coach
      await this.sendEmailNotification(
        coach.email,
        'booking_confirmation_coach',
        {
          coachName: coach.firstName,
          studentName: `${student.firstName} ${student.lastName}`,
          activity,
          date: new Date(date).toLocaleDateString(),
          time,
          bookingId: booking.id,
        }
      );

      // SMS reminders (if enabled)
      if (student.preferences?.notifications?.sms) {
        await this.sendSMSNotification(
          student.phone,
          `Hi ${student.firstName}! Your ${activity} session with ${coach.firstName} is confirmed for ${new Date(date).toLocaleDateString()} at ${time}. See you there!`
        );
      }

      if (coach.preferences?.notifications?.sms) {
        await this.sendSMSNotification(
          coach.phone,
          `New booking: ${activity} session with ${student.firstName} on ${new Date(date).toLocaleDateString()} at ${time}. Check your FlowCrew app for details.`
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
      throw error;
    }
  }

  // Send booking reminder
  async sendBookingReminder(booking, reminderType = '24h') {
    try {
      const { student, coach, date, time, activity } = booking;
      const reminderTime = reminderType === '24h' ? '24 hours' : '1 hour';

      // Email reminder to student
      await this.sendEmailNotification(
        student.email,
        'booking_reminder_student',
        {
          studentName: student.firstName,
          coachName: `${coach.firstName} ${coach.lastName}`,
          activity,
          date: new Date(date).toLocaleDateString(),
          time,
          reminderTime,
          bookingId: booking.id,
        }
      );

      // SMS reminder (if enabled)
      if (student.preferences?.notifications?.sms) {
        await this.sendSMSNotification(
          student.phone,
          `Reminder: Your ${activity} session with ${coach.firstName} is in ${reminderTime} (${new Date(date).toLocaleDateString()} at ${time}). Don't forget!`
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to send booking reminder:', error);
      throw error;
    }
  }

  // Send payment confirmation
  async sendPaymentConfirmation(payment) {
    try {
      const { user, amount, currency, bookings } = payment;

      await this.sendEmailNotification(
        user.email,
        'payment_confirmation',
        {
          userName: user.firstName,
          amount: this.formatCurrency(amount, currency),
          bookings: bookings.map(booking => ({
            activity: booking.activity,
            coachName: booking.coachName,
            date: new Date(booking.date).toLocaleDateString(),
            time: booking.time,
          })),
          paymentId: payment.id,
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      throw error;
    }
  }

  // Get user conversations
  async getUserConversations(userId, limit = 20, offset = 0) {
    try {
      const response = await AuthService.apiRequest(
        `/users/${userId}/conversations?limit=${limit}&offset=${offset}`
      );

      return response.conversations;
    } catch (error) {
      console.error('Failed to get user conversations:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId, messageIds) {
    try {
      await AuthService.apiRequest(`/conversations/${conversationId}/read`, {
        method: 'POST',
        body: JSON.stringify({ messageIds }),
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  }

  // Upload file attachment
  async uploadAttachment(file, conversationId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      const response = await AuthService.apiRequest('/attachments/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it for FormData
        },
      });

      return response.attachment;
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      throw error;
    }
  }

  // Format currency
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  }

  // Get communication analytics
  async getCommunicationAnalytics(period = '30d') {
    try {
      const response = await AuthService.apiRequest(`/communications/analytics?period=${period}`);
      return response.analytics;
    } catch (error) {
      console.error('Failed to get communication analytics:', error);
      throw error;
    }
  }

  // Schedule message
  async scheduleMessage(recipientId, message, scheduledFor, type = 'email') {
    try {
      const scheduleData = {
        recipientId,
        message,
        scheduledFor,
        type,
        status: 'scheduled',
      };

      const response = await AuthService.apiRequest('/communications/schedule', {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });

      return response.scheduledMessage;
    } catch (error) {
      console.error('Failed to schedule message:', error);
      throw error;
    }
  }
}

export const CommunicationService = new CommunicationServiceClass();

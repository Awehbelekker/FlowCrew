import { AuthService } from './AuthService';
import { NotificationService } from './NotificationService';

/**
 * FlowCrew WhatsApp Integration Service
 * Handles WhatsApp Business API integration, message templates, and contact management
 */
class WhatsAppIntegrationService {
  constructor() {
    this.initialized = false;
    this.whatsappConfig = null;
    this.messageTemplates = new Map();
    this.contactCache = new Map();
    this.webhookHandlers = new Map();
  }

  // Initialize WhatsApp service
  async initialize(config = {}) {
    if (this.initialized) return;

    try {
      this.whatsappConfig = {
        businessAccountId: config.businessAccountId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        accessToken: config.accessToken || process.env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID,
        webhookVerifyToken: config.webhookVerifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
        apiVersion: config.apiVersion || 'v18.0',
        baseUrl: 'https://graph.facebook.com',
      };

      // Validate configuration
      await this.validateConfiguration();

      // Load message templates
      await this.loadMessageTemplates();

      // Setup webhook handlers
      this.setupWebhookHandlers();

      this.initialized = true;
      console.log('✅ WhatsApp integration service initialized');
    } catch (error) {
      console.error('Failed to initialize WhatsApp service:', error);
      throw error;
    }
  }

  // Validate WhatsApp configuration
  async validateConfiguration() {
    const requiredFields = ['businessAccountId', 'accessToken', 'phoneNumberId'];

    for (const field of requiredFields) {
      if (!this.whatsappConfig[field]) {
        throw new Error(`Missing required WhatsApp configuration: ${field}`);
      }
    }

    // Test API connection
    try {
      await this.makeWhatsAppRequest('GET', `/v${this.whatsappConfig.apiVersion}/${this.whatsappConfig.phoneNumberId}`);
    } catch (error) {
      throw new Error(`WhatsApp API connection failed: ${error.message}`);
    }
  }

  // Load message templates
  async loadMessageTemplates() {
    try {
      const response = await this.makeWhatsAppRequest(
        'GET',
        `/v${this.whatsappConfig.apiVersion}/${this.whatsappConfig.phoneNumberId}/message_templates`
      );

      response.data.forEach(template => {
        this.messageTemplates.set(template.name, template);
      });

      console.log(`Loaded ${this.messageTemplates.size} WhatsApp message templates`);
    } catch (error) {
      console.error('Failed to load message templates:', error);
    }
  }

  // Setup webhook handlers
  setupWebhookHandlers() {
    this.webhookHandlers.set('message', this.handleIncomingMessage.bind(this));
    this.webhookHandlers.set('message_status', this.handleMessageStatus.bind(this));
    this.webhookHandlers.set('conversation', this.handleConversationUpdate.bind(this));
  }

  // Send WhatsApp message
  async sendMessage(phoneNumber, message, options = {}) {
    try {
      await this.initialize();

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: this.formatPhoneNumber(phoneNumber),
        type: message.type || 'text',
        ...this.buildMessagePayload(message, options),
      };

      const response = await this.makeWhatsAppRequest(
        'POST',
        `/v${this.whatsappConfig.apiVersion}/${this.whatsappConfig.phoneNumberId}/messages`,
        messageData
      );

      // Log message sent
      await this.logMessage(phoneNumber, message, response.messages[0].id, 'sent');

      return response.messages[0];
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }

  // Send template message
  async sendTemplateMessage(phoneNumber, templateName, languageCode = 'en_US', components = []) {
    try {
      const template = this.messageTemplates.get(templateName);
      if (!template) {
        throw new Error(`Template '${templateName}' not found`);
      }

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: this.formatPhoneNumber(phoneNumber),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components,
        },
      };

      const response = await this.makeWhatsAppRequest(
        'POST',
        `/v${this.whatsappConfig.apiVersion}/${this.whatsappConfig.phoneNumberId}/messages`,
        messageData
      );

      return response.messages[0];
    } catch (error) {
      console.error('Failed to send template message:', error);
      throw error;
    }
  }

  // Send booking confirmation via WhatsApp
  async sendBookingConfirmation(phoneNumber, bookingData) {
    try {
      const components = [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: bookingData.studentName,
            },
            {
              type: 'text',
              text: bookingData.coachName,
            },
            {
              type: 'text',
              text: bookingData.activity,
            },
            {
              type: 'text',
              text: bookingData.date,
            },
            {
              type: 'text',
              text: bookingData.time,
            },
          ],
        },
      ];

      return await this.sendTemplateMessage(
        phoneNumber,
        'booking_confirmation',
        'en_US',
        components
      );
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
      throw error;
    }
  }

  // Send booking reminder via WhatsApp
  async sendBookingReminder(phoneNumber, bookingData) {
    try {
      const components = [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: bookingData.studentName,
            },
            {
              type: 'text',
              text: bookingData.activity,
            },
            {
              type: 'text',
              text: bookingData.date,
            },
            {
              type: 'text',
              text: bookingData.time,
            },
          ],
        },
      ];

      return await this.sendTemplateMessage(
        phoneNumber,
        'booking_reminder',
        'en_US',
        components
      );
    } catch (error) {
      console.error('Failed to send booking reminder:', error);
      throw error;
    }
  }

  // Send payment confirmation via WhatsApp
  async sendPaymentConfirmation(phoneNumber, paymentData) {
    try {
      const components = [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: paymentData.userName,
            },
            {
              type: 'text',
              text: paymentData.amount,
            },
            {
              type: 'text',
              text: paymentData.currency,
            },
          ],
        },
      ];

      return await this.sendTemplateMessage(
        phoneNumber,
        'payment_confirmation',
        'en_US',
        components
      );
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      throw error;
    }
  }

  // Send coach match notification via WhatsApp
  async sendCoachMatchNotification(phoneNumber, matchData) {
    try {
      const components = [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: matchData.studentName,
            },
            {
              type: 'text',
              text: matchData.coachName,
            },
            {
              type: 'text',
              text: matchData.activity,
            },
            {
              type: 'text',
              text: matchData.matchScore + '%',
            },
          ],
        },
      ];

      return await this.sendTemplateMessage(
        phoneNumber,
        'coach_match_notification',
        'en_US',
        components
      );
    } catch (error) {
      console.error('Failed to send coach match notification:', error);
      throw error;
    }
  }

  // Handle incoming WhatsApp messages
  async handleIncomingMessage(messageData) {
    try {
      const { from, timestamp, type, text, image, document } = messageData;

      // Extract message content based on type
      let content = '';
      let attachments = [];

      if (type === 'text' && text) {
        content = text.body;
      } else if (type === 'image' && image) {
        content = image.caption || '';
        attachments.push({
          type: 'image',
          id: image.id,
          url: image.url,
        });
      } else if (type === 'document' && document) {
        content = document.caption || '';
        attachments.push({
          type: 'document',
          id: document.id,
          filename: document.filename,
          url: document.url,
        });
      }

      // Create or get conversation
      const conversation = await this.getOrCreateConversation(from);

      // Save message to database
      const savedMessage = await this.saveIncomingMessage(conversation.id, {
        from,
        content,
        attachments,
        timestamp,
        type,
        source: 'whatsapp',
      });

      // Send to in-app chat system
      await NotificationService.sendMessage(
        conversation.id,
        content,
        attachments
      );

      // Auto-reply for common queries
      await this.handleAutoReply(from, content);

      return savedMessage;
    } catch (error) {
      console.error('Failed to handle incoming message:', error);
      throw error;
    }
  }

  // Handle message status updates
  async handleMessageStatus(statusData) {
    try {
      const { message_id, status, timestamp } = statusData;

      // Update message status in database
      await this.updateMessageStatus(message_id, status);

      // Notify relevant systems
      if (status === 'delivered' || status === 'read') {
        await NotificationService.sendMessageStatusUpdate(message_id, status);
      }
    } catch (error) {
      console.error('Failed to handle message status:', error);
    }
  }

  // Handle conversation updates
  async handleConversationUpdate(conversationData) {
    try {
      const { conversation_id, status, timestamp } = conversationData;

      // Update conversation status
      await this.updateConversationStatus(conversation_id, status);
    } catch (error) {
      console.error('Failed to handle conversation update:', error);
    }
  }

  // Auto-reply for common queries
  async handleAutoReply(phoneNumber, message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('booking') || lowerMessage.includes('schedule')) {
      await this.sendTemplateMessage(phoneNumber, 'booking_help', 'en_US');
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      await this.sendTemplateMessage(phoneNumber, 'payment_help', 'en_US');
    } else if (lowerMessage.includes('coach') || lowerMessage.includes('instructor')) {
      await this.sendTemplateMessage(phoneNumber, 'coach_help', 'en_US');
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('conditions')) {
      await this.sendTemplateMessage(phoneNumber, 'weather_help', 'en_US');
    }
  }

  // Get or create conversation
  async getOrCreateConversation(phoneNumber) {
    try {
      // Check if conversation exists
      const existingConversation = await AuthService.apiRequest(
        `/conversations/whatsapp/${phoneNumber}`
      );

      if (existingConversation.conversation) {
        return existingConversation.conversation;
      }

      // Create new conversation
      const conversationData = {
        participants: [phoneNumber],
        type: 'whatsapp',
        source: 'whatsapp',
        metadata: {
          phoneNumber,
          platform: 'whatsapp',
        },
      };

      const response = await AuthService.apiRequest('/conversations', {
        method: 'POST',
        body: JSON.stringify(conversationData),
      });

      return response.conversation;
    } catch (error) {
      console.error('Failed to get or create conversation:', error);
      throw error;
    }
  }

  // Save incoming message
  async saveIncomingMessage(conversationId, messageData) {
    try {
      const response = await AuthService.apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          ...messageData,
        }),
      });

      return response.message;
    } catch (error) {
      console.error('Failed to save incoming message:', error);
      throw error;
    }
  }

  // Update message status
  async updateMessageStatus(messageId, status) {
    try {
      await AuthService.apiRequest(`/messages/${messageId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Failed to update message status:', error);
    }
  }

  // Update conversation status
  async updateConversationStatus(conversationId, status) {
    try {
      await AuthService.apiRequest(`/conversations/${conversationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Failed to update conversation status:', error);
    }
  }

  // Log message
  async logMessage(phoneNumber, message, messageId, status) {
    try {
      await AuthService.apiRequest('/communications/whatsapp/log', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber,
          message,
          messageId,
          status,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to log WhatsApp message:', error);
    }
  }

  // Build message payload
  buildMessagePayload(message, options) {
    switch (message.type) {
      case 'text':
        return {
          text: {
            body: message.content,
            preview_url: options.previewUrl || false,
          },
        };

      case 'image':
        return {
          image: {
            link: message.url,
            caption: message.caption,
          },
        };

      case 'document':
        return {
          document: {
            link: message.url,
            caption: message.caption,
            filename: message.filename,
          },
        };

      case 'audio':
        return {
          audio: {
            link: message.url,
          },
        };

      case 'video':
        return {
          video: {
            link: message.url,
            caption: message.caption,
          },
        };

      default:
        return {
          text: {
            body: message.content,
          },
        };
    }
  }

  // Format phone number for WhatsApp
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Ensure it starts with country code
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return cleaned;
    } else if (cleaned.length === 10) {
      return '1' + cleaned;
    }

    return cleaned;
  }

  // Make WhatsApp API request
  async makeWhatsAppRequest(method, endpoint, data = null) {
    try {
      const url = `${this.whatsappConfig.baseUrl}${endpoint}`;
      const headers = {
        'Authorization': `Bearer ${this.whatsappConfig.accessToken}`,
        'Content-Type': 'application/json',
      };

      const options = {
        method,
        headers,
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`);
      }

      return result;
    } catch (error) {
      console.error('WhatsApp API request failed:', error);
      throw error;
    }
  }

  // Get message templates
  getMessageTemplates() {
    return Array.from(this.messageTemplates.values());
  }

  // Get conversation history
  async getConversationHistory(phoneNumber, limit = 50) {
    try {
      const conversation = await this.getOrCreateConversation(phoneNumber);

      const response = await AuthService.apiRequest(
        `/conversations/${conversation.id}/messages?limit=${limit}`
      );

      return response.messages;
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      throw error;
    }
  }

  // Get WhatsApp analytics
  async getWhatsAppAnalytics(period = '30d') {
    try {
      const response = await AuthService.apiRequest(`/communications/whatsapp/analytics?period=${period}`);
      return response.analytics;
    } catch (error) {
      console.error('Failed to get WhatsApp analytics:', error);
      throw error;
    }
  }
}

const WhatsAppIntegrationServiceInstance = new WhatsAppIntegrationService();
export default WhatsAppIntegrationServiceInstance;

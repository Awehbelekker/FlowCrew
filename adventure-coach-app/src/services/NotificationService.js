import { Platform } from 'react-native';
import { AuthService } from './AuthService';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.fcmToken = null;
    this.notificationListeners = new Map();
    this.permissionGranted = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check if running on web
      if (Platform.OS === 'web') {
        await this.initializeWebNotifications();
      } else {
        await this.initializeMobileNotifications();
      }

      this.isInitialized = true;
      console.log('NotificationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
    }
  }

  async initializeWebNotifications() {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    // Request permission
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
    } else {
      this.permissionGranted = Notification.permission === 'granted';
    }

    if (this.permissionGranted) {
      // Register service worker for background notifications
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    }
  }

  async initializeMobileNotifications() {
    // For mobile platforms, implement native notification setup
    // This would typically use @react-native-firebase/messaging
    console.log('Mobile notifications would be initialized here');
  }

  async requestPermission() {
    if (Platform.OS === 'web') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    } else {
      // Mobile permission request
      return true; // Simplified for demo
    }
  }

  async getFCMToken() {
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return null;
    }

    try {
      // For web, generate a simple token
      if (Platform.OS === 'web') {
        this.fcmToken = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else {
        // For mobile, get actual FCM token
        this.fcmToken = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // Register token with backend
      await this.registerToken(this.fcmToken);
      return this.fcmToken;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  async registerToken(token) {
    try {
      await AuthService.apiRequest('/notifications/register', {
        method: 'POST',
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          userId: AuthService.getCurrentUser()?.id
        })
      });
    } catch (error) {
      console.error('Failed to register notification token:', error);
    }
  }

  async sendLocalNotification(title, body, data = {}) {
    if (!this.permissionGranted) return;

    if (Platform.OS === 'web') {
      // Web notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: data.tag || 'default',
          data
        });

        notification.onclick = () => {
          this.handleNotificationClick(data);
          notification.close();
        };
      }
    } else {
      // Mobile notifications
      console.log('Sending mobile notification:', { title, body, data });
    }
  }

  async sendPushNotification(userIds, notification) {
    try {
      await AuthService.apiRequest('/notifications/send', {
        method: 'POST',
        body: JSON.stringify({
          userIds,
          notification: {
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            type: notification.type || 'general'
          }
        })
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  // Specific notification types
  async sendBookingNotification(userId, bookingData) {
    const notification = {
      title: 'New Booking Request',
      body: `You have a new booking request for ${bookingData.activity}`,
      data: {
        type: 'booking',
        bookingId: bookingData.id,
        action: 'view_booking'
      }
    };

    await this.sendPushNotification([userId], notification);
  }

  async sendBookingConfirmation(userId, bookingData) {
    const notification = {
      title: 'Booking Confirmed',
      body: `Your ${bookingData.activity} session has been confirmed!`,
      data: {
        type: 'booking_confirmation',
        bookingId: bookingData.id,
        action: 'view_booking'
      }
    };

    await this.sendPushNotification([userId], notification);
  }

  async sendBookingReminder(userId, bookingData) {
    const notification = {
      title: 'Upcoming Session',
      body: `Your ${bookingData.activity} session starts in 1 hour`,
      data: {
        type: 'booking_reminder',
        bookingId: bookingData.id,
        action: 'view_booking'
      }
    };

    await this.sendPushNotification([userId], notification);
  }

  async sendPaymentNotification(userId, paymentData) {
    const notification = {
      title: 'Payment Received',
      body: `Payment of $${paymentData.amount} has been processed`,
      data: {
        type: 'payment',
        paymentId: paymentData.id,
        action: 'view_payment'
      }
    };

    await this.sendPushNotification([userId], notification);
  }

  async sendCoachMatchNotification(userId, coachData) {
    const notification = {
      title: 'New Coach Match',
      body: `You've been matched with ${coachData.name} for ${coachData.activity}`,
      data: {
        type: 'coach_match',
        coachId: coachData.id,
        action: 'view_coach'
      }
    };

    await this.sendPushNotification([userId], notification);
  }

  async sendWeatherAlert(userIds, weatherData) {
    const notification = {
      title: 'Weather Alert',
      body: `Perfect conditions for ${weatherData.activity} at ${weatherData.location}`,
      data: {
        type: 'weather_alert',
        location: weatherData.location,
        activity: weatherData.activity,
        action: 'view_weather'
      }
    };

    await this.sendPushNotification(userIds, notification);
  }

  // Notification handling
  handleNotificationClick(data) {
    // Handle notification clicks based on data
    switch (data.action) {
      case 'view_booking':
        // Navigate to booking details
        console.log('Navigate to booking:', data.bookingId);
        break;
      case 'view_payment':
        // Navigate to payment details
        console.log('Navigate to payment:', data.paymentId);
        break;
      case 'view_coach':
        // Navigate to coach profile
        console.log('Navigate to coach:', data.coachId);
        break;
      case 'view_weather':
        // Navigate to weather details
        console.log('Navigate to weather:', data.location);
        break;
      default:
        console.log('Unknown notification action:', data.action);
    }
  }

  // Background notification handling
  onBackgroundMessage(message) {
    console.log('Background message received:', message);

    // Handle background notifications
    const { data } = message;

    if (data.type === 'booking') {
      this.sendLocalNotification(
        'New Booking',
        'You have a new booking request',
        data
      );
    }
  }

  // Subscribe to notification topics
  async subscribeToTopic(topic) {
    try {
      await AuthService.apiRequest('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          token: this.fcmToken,
          topic
        })
      });
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
    }
  }

  // Unsubscribe from notification topics
  async unsubscribeFromTopic(topic) {
    try {
      await AuthService.apiRequest('/notifications/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({
          token: this.fcmToken,
          topic
        })
      });
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const response = await AuthService.apiRequest('/notifications/settings');
      return response.settings;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return {
        bookingNotifications: true,
        paymentNotifications: true,
        weatherAlerts: true,
        marketingNotifications: false
      };
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      await AuthService.apiRequest('/notifications/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  // Clear all notifications
  clearAllNotifications() {
    if (Platform.OS === 'web') {
      // Clear web notifications
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }
    } else {
      // Clear mobile notifications
      console.log('Clearing mobile notifications');
    }
  }
}

// Create singleton instance
const NotificationServiceInstance = new NotificationService();

export default NotificationServiceInstance;

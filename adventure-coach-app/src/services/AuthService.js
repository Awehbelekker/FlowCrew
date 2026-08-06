import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/constants';

class AuthenticationService {
  constructor() {
    this.baseURL = API_BASE_URL || 'http://localhost:3001/api';
  }

  // Get auth headers with token
  async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Make authenticated API request
  async apiRequest(endpoint, options = {}) {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return response;
  }

  async register(userData, password) {
    const response = await this.apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...userData, password }),
    });

    return response;
  }

  async logout() {
    try {
      await this.apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with local logout even if API fails
    }
  }

  async getCurrentUser() {
    return this.apiRequest('/auth/me');
  }

  async updateProfile(updates) {
    return this.apiRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async switchRole(newRole) {
    return this.apiRequest('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role: newRole }),
    });
  }

  // Email verification
  async sendEmailVerification() {
    return this.apiRequest('/auth/send-verification-email', {
      method: 'POST',
    });
  }

  async verifyEmail(token) {
    return this.apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Password reset
  async requestPasswordReset(email) {
    return this.apiRequest('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password: newPassword }),
    });
  }

  // Coach application methods
  async submitCoachApplication(applicationData) {
    return this.apiRequest('/coach-applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getCoachApplication(applicationId) {
    return this.apiRequest(`/coach-applications/${applicationId}`);
  }

  async updateCoachApplication(applicationId, updates) {
    return this.apiRequest(`/coach-applications/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async uploadApplicationDocument(applicationId, documentType, file) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);

    const token = await AsyncStorage.getItem('authToken');

    const response = await fetch(
      `${this.baseURL}/coach-applications/${applicationId}/documents`,
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message);
    }

    return response.json();
  }

  // Surf shop affiliation
  async requestSurfShopAffiliation(shopId, employmentType) {
    return this.apiRequest('/surf-shop-affiliations', {
      method: 'POST',
      body: JSON.stringify({ shopId, employmentType }),
    });
  }

  async getSurfShops(searchQuery = '') {
    const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    return this.apiRequest(`/surf-shops${params}`);
  }

  // Banking and payments setup
  async createStripeAccount(accountType = 'express') {
    return this.apiRequest('/payments/create-stripe-account', {
      method: 'POST',
      body: JSON.stringify({ accountType }),
    });
  }

  async getStripeAccountStatus() {
    return this.apiRequest('/payments/stripe-account-status');
  }

  async completeStripeOnboarding(accountId) {
    return this.apiRequest('/payments/complete-stripe-onboarding', {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  }

  // User search and discovery
  async searchCoaches(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.apiRequest(`/coaches/search?${params}`);
  }

  async getCoachProfile(coachId) {
    return this.apiRequest(`/coaches/${coachId}`);
  }

  async getCoachAvailability(coachId, startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate }).toString();
    return this.apiRequest(`/coaches/${coachId}/availability?${params}`);
  }

  // Booking methods
  async createBooking(bookingData) {
    return this.apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.apiRequest(`/bookings?${params}`);
  }

  async updateBooking(bookingId, updates) {
    return this.apiRequest(`/bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async cancelBooking(bookingId, reason) {
    return this.apiRequest(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Payment methods
  async processPayment(bookingId, paymentMethodId) {
    return this.apiRequest('/payments/process', {
      method: 'POST',
      body: JSON.stringify({ bookingId, paymentMethodId }),
    });
  }

  async getPaymentMethods() {
    return this.apiRequest('/payments/methods');
  }

  async addPaymentMethod(paymentMethodData) {
    return this.apiRequest('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethodData),
    });
  }

  async removePaymentMethod(paymentMethodId) {
    return this.apiRequest(`/payments/methods/${paymentMethodId}`, {
      method: 'DELETE',
    });
  }

  // Earnings and analytics
  async getEarnings(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate }).toString();
    return this.apiRequest(`/earnings?${params}`);
  }

  async getAnalytics(period = '30d') {
    return this.apiRequest(`/analytics?period=${period}`);
  }

  // Reviews and ratings
  async createReview(bookingId, rating, comment) {
    return this.apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify({ bookingId, rating, comment }),
    });
  }

  async getReviews(targetId, targetType = 'coach') {
    const params = new URLSearchParams({ targetId, targetType }).toString();
    return this.apiRequest(`/reviews?${params}`);
  }

  // Messaging
  async getConversations() {
    return this.apiRequest('/messages/conversations');
  }

  async getMessages(conversationId, page = 1, limit = 50) {
    const params = new URLSearchParams({ page, limit }).toString();
    return this.apiRequest(`/messages/conversations/${conversationId}/messages?${params}`);
  }

  async sendMessage(conversationId, content, type = 'text') {
    return this.apiRequest(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  // Notifications
  async getNotifications(page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit }).toString();
    return this.apiRequest(`/notifications?${params}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.apiRequest(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async updateNotificationSettings(settings) {
    return this.apiRequest('/notifications/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // Admin methods (for platform admins)
  async getUsers(filters = {}, page = 1, limit = 20) {
    const params = new URLSearchParams({ ...filters, page, limit }).toString();
    return this.apiRequest(`/admin/users?${params}`);
  }

  async updateUserStatus(userId, status, reason) {
    return this.apiRequest(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  async reviewCoachApplication(applicationId, decision, notes) {
    return this.apiRequest(`/admin/coach-applications/${applicationId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    });
  }

  async getPlatformAnalytics(period = '30d') {
    return this.apiRequest(`/admin/analytics?period=${period}`);
  }
}

export const AuthService = new AuthenticationService();

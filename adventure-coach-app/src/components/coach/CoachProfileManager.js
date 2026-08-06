import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { VisualEffects, EnhancedSpacing } from '../../styles/FlowCrewDesignSystem';
import { Button, Card, Text as FlowCrewText } from '../FlowCrew';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/AuthService';
import LoadingSpinner from '../LoadingSpinner';
import ImageUploadManager from './ImageUploadManager';

const CoachProfileManager = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const [formData, setFormData] = useState({
    bio: '',
    specialties: [],
    experienceYears: 0,
    hourlyRate: 0,
    location: {
      address: '',
      latitude: 0,
      longitude: 0,
      serviceRadius: 25,
    },
    certifications: [],
    languages: ['en'],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await AuthService.apiRequest('/coach/profile');
      setProfile(response.profile);
      setFormData(response.profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await AuthService.apiRequest('/coach/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setIsEditing(false);
      await loadProfile();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (uploadData) => {
    try {
      // Update profile with new image URL
      const updatedProfile = { ...profile, avatarUrl: uploadData.url };
      setProfile(updatedProfile);

      // Save to backend
      await AuthService.apiRequest('/coach/profile', {
        method: 'PUT',
        body: JSON.stringify({ avatarUrl: uploadData.url }),
      });

      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error) {
      console.error('Failed to update profile photo:', error);
      Alert.alert('Error', 'Failed to update profile photo');
    }
  };

  const handleDocumentUpload = async (uploadData) => {
    try {
      // Add certification document
      const newCertification = {
        name: uploadData.fileName,
        documentUrl: uploadData.url,
        issueDate: new Date().toISOString().split('T')[0],
        verified: false
      };

      const updatedCertifications = [...(profile?.certifications || []), newCertification];
      const updatedProfile = { ...profile, certifications: updatedCertifications };
      setProfile(updatedProfile);

      // Save to backend
      await AuthService.apiRequest('/coach/profile', {
        method: 'PUT',
        body: JSON.stringify({ certifications: updatedCertifications }),
      });

      Alert.alert('Success', 'Document uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload document:', error);
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const renderProfileHeader = () => (
    <Card variant="elevated" style={styles.profileHeader}>
      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => setShowImagePicker(true)}
        >
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>📷</Text>
            </View>
          )}
          <View style={styles.avatarOverlay}>
            <Text style={styles.avatarOverlayText}>Edit</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <FlowCrewText variant="h3" bold>
            {user?.firstName} {user?.lastName}
          </FlowCrewText>
          <FlowCrewText variant="body" color="secondary">
            {profile?.specialties?.join(', ')}
          </FlowCrewText>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {profile?.rating || 0}</Text>
            <Text style={styles.reviewText}>({profile?.reviewCount || 0} reviews)</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderBasicInfo = () => (
    <Card variant="elevated" style={styles.section}>
      <FlowCrewText variant="h3" bold style={styles.sectionTitle}>
        Basic Information
      </FlowCrewText>

      <View style={styles.formGroup}>
        <FlowCrewText variant="body" bold>Bio</FlowCrewText>
        <TextInput
          style={styles.textArea}
          value={formData.bio}
          onChangeText={(text) => setFormData({...formData, bio: text})}
          placeholder="Tell students about your coaching experience..."
          multiline
          numberOfLines={4}
          editable={isEditing}
        />
      </View>

      <View style={styles.formGroup}>
        <FlowCrewText variant="body" bold>Experience (Years)</FlowCrewText>
        <TextInput
          style={styles.input}
          value={formData.experienceYears.toString()}
          onChangeText={(text) => setFormData({...formData, experienceYears: parseInt(text) || 0})}
          keyboardType="numeric"
          editable={isEditing}
        />
      </View>

      <View style={styles.formGroup}>
        <FlowCrewText variant="body" bold>Hourly Rate ($)</FlowCrewText>
        <TextInput
          style={styles.input}
          value={formData.hourlyRate.toString()}
          onChangeText={(text) => setFormData({...formData, hourlyRate: parseInt(text) || 0})}
          keyboardType="numeric"
          editable={isEditing}
        />
      </View>
    </Card>
  );

  const renderSpecialties = () => (
    <Card variant="elevated" style={styles.section}>
      <FlowCrewText variant="h3" bold style={styles.sectionTitle}>
        Specialties
      </FlowCrewText>

      <View style={styles.specialtiesContainer}>
        {['Surfing', 'SUP', 'Kitesurfing', 'Windsurfing', 'Bodyboarding'].map((specialty) => (
          <TouchableOpacity
            key={specialty}
            style={[
              styles.specialtyChip,
              formData.specialties.includes(specialty) && styles.specialtyChipSelected
            ]}
            onPress={() => {
              if (isEditing) {
                const updated = formData.specialties.includes(specialty)
                  ? formData.specialties.filter(s => s !== specialty)
                  : [...formData.specialties, specialty];
                setFormData({...formData, specialties: updated});
              }
            }}
            disabled={!isEditing}
          >
            <Text style={[
              styles.specialtyText,
              formData.specialties.includes(specialty) && styles.specialtyTextSelected
            ]}>
              {specialty}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  const renderCertifications = () => (
    <Card variant="elevated" style={styles.section}>
      <View style={styles.sectionHeader}>
        <FlowCrewText variant="h3" bold>
          Certifications
        </FlowCrewText>
        {isEditing && (
          <TouchableOpacity onPress={() => setShowDocumentUpload(true)}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {profile?.certifications?.length > 0 ? (
        profile.certifications.map((cert, index) => (
          <View key={index} style={styles.certificationItem}>
            <Text style={styles.certificationName}>{cert.name}</Text>
            <Text style={styles.certificationDate}>{cert.issueDate}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No certifications added yet</Text>
      )}
    </Card>
  );

  const renderLocation = () => (
    <Card variant="elevated" style={styles.section}>
      <FlowCrewText variant="h3" bold style={styles.sectionTitle}>
        Location & Service Area
      </FlowCrewText>

      <View style={styles.formGroup}>
        <FlowCrewText variant="body" bold>Address</FlowCrewText>
        <TextInput
          style={styles.input}
          value={formData.location.address}
          onChangeText={(text) => setFormData({
            ...formData,
            location: {...formData.location, address: text}
          })}
          placeholder="Enter your address"
          editable={isEditing}
        />
      </View>

      <View style={styles.formGroup}>
        <FlowCrewText variant="body" bold>Service Radius (km)</FlowCrewText>
        <TextInput
          style={styles.input}
          value={formData.location.serviceRadius.toString()}
          onChangeText={(text) => setFormData({
            ...formData,
            location: {...formData.location, serviceRadius: parseInt(text) || 25}
          })}
          keyboardType="numeric"
          editable={isEditing}
        />
      </View>
    </Card>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {isEditing ? (
        <>
          <Button
            variant="secondary"
            onPress={() => setIsEditing(false)}
            style={styles.actionButton}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSave}
            style={styles.actionButton}
          >
            Save Changes
          </Button>
        </>
      ) : (
        <Button
          variant="primary"
          onPress={() => setIsEditing(true)}
          style={styles.actionButton}
        >
          Edit Profile
        </Button>
      )}
    </View>
  );

  const renderImageUploadModal = () => (
    <ImageUploadManager
      type="profile"
      visible={showImagePicker}
      onUploadComplete={handleImageUpload}
      onCancel={() => setShowImagePicker(false)}
    />
  );

  const renderDocumentUploadModal = () => (
    <ImageUploadManager
      type="document"
      visible={showDocumentUpload}
      onUploadComplete={handleDocumentUpload}
      onCancel={() => setShowDocumentUpload(false)}
      allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
      maxSize={10 * 1024 * 1024} // 10MB for documents
    />
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {renderProfileHeader()}
      {renderBasicInfo()}
      {renderSpecialties()}
      {renderCertifications()}
      {renderLocation()}
      {renderActionButtons()}
      {renderImageUploadModal()}
      {renderDocumentUploadModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui.background,
  },

  profileHeader: {
    marginBottom: EnhancedSpacing.sectionGap,
  },

  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.lg,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
  },

  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.ui.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarPlaceholderText: {
    fontSize: 32,
  },

  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.brand.green,
    borderRadius: BorderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarOverlayText: {
    color: Colors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  },

  profileInfo: {
    flex: 1,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },

  ratingText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.brand.green,
  },

  reviewText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },

  section: {
    marginBottom: EnhancedSpacing.sectionGap,
  },

  sectionTitle: {
    marginBottom: Spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  addButton: {
    color: Colors.brand.green,
    fontWeight: Typography.fontWeight.bold,
  },

  formGroup: {
    marginBottom: Spacing.lg,
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.xs,
  },

  textArea: {
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.xs,
    height: 100,
    textAlignVertical: 'top',
  },

  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  specialtyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.ui.card,
  },

  specialtyChipSelected: {
    backgroundColor: Colors.brand.green,
    borderColor: Colors.brand.green,
  },

  specialtyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
  },

  specialtyTextSelected: {
    color: Colors.text.inverse,
  },

  certificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },

  certificationName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },

  certificationDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },

  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  actionButton: {
    flex: 1,
  },
});

export default CoachProfileManager;

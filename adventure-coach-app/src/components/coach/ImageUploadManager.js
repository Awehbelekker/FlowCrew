import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/designSystem';
import { VisualEffects, EnhancedSpacing } from '../../styles/FlowCrewDesignSystem';
import { Button, Card, Text as FlowCrewText } from '../FlowCrew';
import { AuthService } from '../../services/AuthService';
import LoadingSpinner from '../LoadingSpinner';

const ImageUploadManager = ({
  type = 'profile', // 'profile' or 'document'
  onUploadComplete,
  onCancel,
  visible = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleCameraPress = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
          return;
        }
      }

      // For web, use file input with camera capture
      if (Platform.OS === 'web') {
        if (fileInputRef.current) {
          fileInputRef.current.accept = 'image/*';
          fileInputRef.current.capture = 'camera';
          fileInputRef.current.click();
        }
      } else {
        // For mobile, implement native camera
        Alert.alert('Camera', 'Native camera implementation would go here');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to access camera');
    }
  };

  const handleGalleryPress = () => {
    if (Platform.OS === 'web') {
      if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.click();
      }
    } else {
      // For mobile, implement native gallery picker
      Alert.alert('Gallery', 'Native gallery picker implementation would go here');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      Alert.alert('File Too Large', `File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      Alert.alert('Invalid File Type', 'Please select a valid image file (JPEG, PNG)');
      return;
    }

    // Process the file
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      setSelectedImage({
        uri: imageData,
        name: file.name,
        size: file.size,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please select an image to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to server
      const formData = new FormData();
      formData.append('image', selectedImage.uri);
      formData.append('type', type);
      formData.append('fileName', selectedImage.name);

      const response = await AuthService.apiRequest('/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete({
          url: response.uploadUrl,
          fileName: selectedImage.name,
          type: type,
          size: selectedImage.size
        });
      }

      Alert.alert('Upload Successful', 'Image uploaded successfully!');
      setSelectedImage(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setUploadProgress(0);
  };

  const renderCameraOptions = () => (
    <View style={styles.cameraOptions}>
      <TouchableOpacity
        style={styles.cameraOption}
        onPress={handleCameraPress}
      >
        <Text style={styles.cameraOptionIcon}>📷</Text>
        <FlowCrewText variant="body" bold>
          Take Photo
        </FlowCrewText>
        <FlowCrewText variant="caption" color="secondary">
          Use camera
        </FlowCrewText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cameraOption}
        onPress={handleGalleryPress}
      >
        <Text style={styles.cameraOptionIcon}>🖼️</Text>
        <FlowCrewText variant="body" bold>
          Choose from Gallery
        </FlowCrewText>
        <FlowCrewText variant="caption" color="secondary">
          Select existing photo
        </FlowCrewText>
      </TouchableOpacity>
    </View>
  );

  const renderImagePreview = () => (
    <View style={styles.imagePreview}>
      <Image
        source={{ uri: selectedImage.uri }}
        style={styles.previewImage}
        resizeMode="cover"
      />

      <View style={styles.imageInfo}>
        <FlowCrewText variant="caption" color="secondary">
          {selectedImage.name} • {(selectedImage.size / 1024 / 1024).toFixed(1)}MB
        </FlowCrewText>
      </View>

      <View style={styles.previewActions}>
        <Button
          variant="secondary"
          onPress={handleRetake}
          style={styles.previewButton}
        >
          Retake
        </Button>
        <Button
          variant="primary"
          onPress={handleUpload}
          style={styles.previewButton}
        >
          Upload
        </Button>
      </View>
    </View>
  );

  const renderUploadProgress = () => (
    <View style={styles.uploadProgress}>
      <FlowCrewText variant="body" bold>
        Uploading...
      </FlowCrewText>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${uploadProgress}%` }
          ]}
        />
      </View>
      <FlowCrewText variant="caption" color="secondary">
        {uploadProgress}% complete
      </FlowCrewText>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <FlowCrewText variant="h3" bold>
              {type === 'profile' ? 'Upload Profile Photo' : 'Upload Document'}
            </FlowCrewText>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {isUploading ? (
              renderUploadProgress()
            ) : selectedImage ? (
              renderImagePreview()
            ) : (
              renderCameraOptions()
            )}
          </View>

          {/* Hidden file input for web */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: Colors.ui.card,
    borderRadius: BorderRadius.lg,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },

  closeButton: {
    fontSize: 24,
    color: Colors.text.secondary,
  },

  modalBody: {
    padding: Spacing.lg,
  },

  cameraOptions: {
    gap: Spacing.md,
  },

  cameraOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.ui.lightBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },

  cameraOptionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },

  imagePreview: {
    alignItems: 'center',
  },

  previewImage: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },

  imageInfo: {
    marginBottom: Spacing.lg,
  },

  previewActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  previewButton: {
    flex: 1,
  },

  uploadProgress: {
    alignItems: 'center',
    padding: Spacing.lg,
  },

  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.ui.lightBg,
    borderRadius: BorderRadius.full,
    marginVertical: Spacing.md,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: Colors.brand.green,
    borderRadius: BorderRadius.full,
  },
});

export default ImageUploadManager;

import { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { uploadMirrorPhoto } from '@/features/mirror/upload-photo';
import { colors, fonts, spacing } from '@/lib/hmc-colors';

export default function MirrorCaptureScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile } = useProfileStore();
  const qc = useQueryClient();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!permission?.granted) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.permText}>Camera permission required</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>GRANT PERMISSION</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>CLOSE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) setCapturedUri(photo.uri);
  };

  const handleUse = async () => {
    if (!capturedUri || !user) return;
    setIsUploading(true);
    const date = new Date().toISOString().slice(0, 10);
    const dayNumber = (profile?.day_count ?? 0) + 1;
    const { error } = await uploadMirrorPhoto(user.id, capturedUri, date, dayNumber);
    setIsUploading(false);
    if (error) {
      Alert.alert('Upload Failed', error.message || 'Could not save photo. Please try again.');
      return;
    }
    qc.invalidateQueries({ queryKey: ['mirror'] });
    router.back();
  };

  if (capturedUri) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Image source={{ uri: capturedUri }} style={styles.preview} />
        <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
          {isUploading ? (
            <ActivityIndicator color={colors.amber} />
          ) : (
            <>
              <TouchableOpacity style={styles.actionBtn} onPress={handleUse}>
                <Text style={styles.actionPrimary}>USE PHOTO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setCapturedUri(null)}>
                <Text style={styles.actionSecondary}>RETAKE</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <CameraView ref={cameraRef} facing="front" style={styles.camera} />
      <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.shutter} onPress={handleCapture}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: spacing.pagePad,
  },
  permText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  permBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.amber,
  },
  permBtnText: { fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 1.5, color: colors.base },
  camera: { flex: 1 },
  preview: { flex: 1 },
  actions: { paddingTop: 16, alignItems: 'center', gap: 12, paddingHorizontal: spacing.pagePad },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.textPrimary },
  actionBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  actionPrimary: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    letterSpacing: 1.5,
    color: colors.amber,
  },
  actionSecondary: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  closeBtn: { paddingVertical: 14 },
  closeText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
});

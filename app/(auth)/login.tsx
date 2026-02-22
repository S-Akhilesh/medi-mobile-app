import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const { user, signInWithEmail, signInWithGoogle, loading, error, clearError } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace('/(tabs)');
  }, [user]);

  function handleEmailSubmit() {
    passwordRef.current?.focus();
  }

  async function handleEmailLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    clearError();
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch {
      // error set in context
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    clearError();
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch {
      // error set in context
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText type="title">Welcome back</ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
          </View>

          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.tint + '20' }]}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.icon + '60' }]}
              placeholder="Email"
              placeholderTextColor={colors.icon}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={handleEmailSubmit}
              editable={!submitting}
            />
            <TextInput
              ref={passwordRef}
              style={[styles.input, { color: colors.text, borderColor: colors.icon + '60' }]}
              placeholder="Password"
              placeholderTextColor={colors.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleEmailLogin}
              editable={!submitting}
            />
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.tint },
                pressed && styles.buttonPressed,
              ]}
              onPress={handleEmailLogin}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.primaryButtonText}>Sign in</ThemedText>
              )}
            </Pressable>
          </View>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.icon + '40' }]} />
            <ThemedText style={styles.dividerText}>or</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.icon + '40' }]} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              { borderColor: colors.icon + '60' },
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={22} color={colors.text} />
            <ThemedText style={styles.googleButtonText}>Continue with Google</ThemedText>
          </Pressable>

          <View style={styles.footer}>
            <ThemedText>Don&apos;t have an account? </ThemedText>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <ThemedText type="link">Sign up</ThemedText>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    flexWrap: 'wrap',
  },
});

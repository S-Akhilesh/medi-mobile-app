import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AuthenticatedHeaderProps = {
  /** Subtitle shown below the logo (e.g. "Appointments at a glance") */
  subtitle?: string;
  /** Optional content below the header row (e.g. user email pill) */
  bottomContent?: React.ReactNode;
};

export function AuthenticatedHeader({ subtitle, bottomContent }: AuthenticatedHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { signOut } = useAuth();

  return (
    <ScreenHeader
      title=""
      subtitle=""
      bottomContent={bottomContent}
      titleElement={
        <View style={styles.logoBlock}>
          <View
            style={[
              styles.logoWrap,
              { backgroundColor: colors.tint + '20' },
            ]}
          >
            <ThemedText style={[styles.logoText, { color: colors.tint }]}>
              M
            </ThemedText>
          </View>
          {subtitle ? (
            <ThemedText style={[styles.logoSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      }
      rightElement={
        <View style={styles.headerIcons}>
          <Pressable
            onPress={() => router.push('/(tabs)/settings')}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.buttonPressed,
            ]}
            accessibilityLabel="Settings"
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.text}
            />
          </Pressable>
          <Pressable
            onPress={async () => {
              await signOut();
              router.replace('/(auth)/login');
            }}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.buttonPressed,
            ]}
            accessibilityLabel="Sign out"
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={colors.text}
            />
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  logoBlock: {
    gap: 6,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
  },
  logoSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

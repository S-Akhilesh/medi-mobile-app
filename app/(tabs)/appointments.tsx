import { ScrollView, StyleSheet } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AppointmentsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Appointments"
          subtitle="View and manage your appointments"
        />
        <ThemedText style={styles.placeholder}>
          Your appointments list will appear here.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 32,
  },
  placeholder: {
    opacity: 0.8,
  },
});

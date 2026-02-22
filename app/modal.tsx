import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Modal" subtitle="Additional options" />
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.body}>This is a modal screen.</ThemedText>
        <Link href="/" dismissTo style={styles.link}>
          <ThemedText type="link">Go to home screen</ThemedText>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerWrap: {
    paddingTop: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    marginBottom: 16,
  },
  link: {
    paddingVertical: 15,
  },
});

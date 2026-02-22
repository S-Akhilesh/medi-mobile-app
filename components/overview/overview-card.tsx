import { Platform, View, StyleSheet, type ViewStyle } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type OverviewCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Set to true to avoid clipping content (e.g. pie chart) */
  overflowVisible?: boolean;
};

export function OverviewCard({ children, style, overflowVisible }: OverviewCardProps) {
  const backgroundColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'cardBorder');

  return (
    <View
      style={[
        styles.card,
        { backgroundColor, borderColor },
        overflowVisible && styles.cardOverflowVisible,
        Platform.OS === 'android' ? styles.cardElevation : styles.cardShadow,
        style,
      ]}
    >
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 180,
    overflow: 'hidden',
  },
  cardOverflowVisible: {
    overflow: 'visible',
  },
  content: {
    flex: 1,
    width: '100%',
    minWidth: 0,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardElevation: {
    elevation: 3,
  },
});

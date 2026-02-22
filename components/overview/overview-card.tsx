import { View, StyleSheet, type ViewStyle } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type OverviewCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function OverviewCard({ children, style }: OverviewCardProps) {
  const backgroundColor = useThemeColor({ light: '#f0f0f0', dark: '#252525' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');

  return (
    <View style={[styles.card, { backgroundColor, borderColor }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    minHeight: 180,
  },
});

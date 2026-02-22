import { StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type ScreenHeaderProps = {
  /** Title text, or use titleElement for a custom logo/node */
  title: string;
  subtitle?: string;
  /** When set, renders instead of title + subtitle (e.g. app logo) */
  titleElement?: React.ReactNode;
  /** Right-side element (e.g. icon buttons) */
  rightElement?: React.ReactNode;
  /** Optional content below title row (e.g. user pill) */
  bottomContent?: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenHeader({
  title,
  subtitle,
  titleElement,
  rightElement,
  bottomContent,
  style,
}: ScreenHeaderProps) {
  const titleColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const subtitleColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'textSecondary');

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          {titleElement != null ? (
            titleElement
          ) : (
            <>
              <ThemedText style={[styles.title, { color: titleColor }]}>{title}</ThemedText>
              {subtitle ? (
                <ThemedText style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
                  {subtitle}
                </ThemedText>
              ) : null}
            </>
          )}
        </View>
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </View>
      {bottomContent ? <View style={styles.bottom}>{bottomContent}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.9,
  },
  right: {
    flexShrink: 0,
  },
  bottom: {
    marginTop: 14,
  },
});

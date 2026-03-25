import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../colors';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  modernFooter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: COLORS.brandRed,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontFamily: 'NotoSansJP',
    fontSize: 7,
    color: COLORS.textMuted,
  },
  url: {
    fontFamily: 'NotoSansJP',
    fontSize: 7,
    color: COLORS.textMuted,
  },
});

export function DetailedFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.brand}>NEXTLEVEL CAREER</Text>
      <Text style={styles.url}>nextlevelcareer-official.com</Text>
    </View>
  );
}

export function ModernFooter() {
  return (
    <View style={styles.modernFooter} fixed>
      <Text style={styles.brand}>NEXTLEVEL CAREER</Text>
      <Text style={styles.url}>nextlevelcareer-official.com</Text>
    </View>
  );
}

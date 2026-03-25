import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../colors';
import path from 'path';

const styles = StyleSheet.create({
  // 詳細スタイル用ヘッダー
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.brandRed,
  },
  logo: {
    width: 140,
    height: 35,
  },
  detailedRight: {
    alignItems: 'flex-end',
  },
  detailedTitle: {
    fontFamily: 'NotoSansJP',
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.textPrimary,
  },
  jobCode: {
    fontFamily: 'NotoSansJP',
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // 求人タイトル（両スタイル共通）
  jobTitle: {
    fontFamily: 'NotoSansJP',
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
    paddingVertical: 6,
    backgroundColor: COLORS.bgLight,
  },
  // モダンスタイル用ヘッダー
  modernHeader: {
    marginBottom: 10,
  },
  modernLogoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gradientLine: {
    height: 2,
    backgroundColor: COLORS.brandRed,
    marginBottom: 10,
  },
  modernBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    fontFamily: 'NotoSansJP',
    fontSize: 7,
    backgroundColor: COLORS.badgeBg,
    color: COLORS.badgeText,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  modernJobCode: {
    fontFamily: 'NotoSansJP',
    fontSize: 7,
    color: COLORS.textMuted,
  },
  modernTitle: {
    fontFamily: 'NotoSansJP',
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
});

const logoPath = path.join(process.cwd(), 'public', 'logo_large.png');

interface HeaderProps {
  title: string;
  jobCode: string;
  employmentType: string;
  category: string;
}

export function DetailedHeader({ title, jobCode }: HeaderProps) {
  return (
    <View>
      <View style={styles.detailedHeader}>
        <Image src={logoPath} style={styles.logo} />
        <View style={styles.detailedRight}>
          <Text style={styles.detailedTitle}>求人票</Text>
          <Text style={styles.jobCode}>{jobCode}</Text>
        </View>
      </View>
      <Text style={styles.jobTitle}>{title}</Text>
    </View>
  );
}

export function ModernHeader({ title, jobCode, employmentType, category }: HeaderProps) {
  return (
    <View style={styles.modernHeader}>
      <View style={styles.modernLogoRow}>
        <Image src={logoPath} style={styles.logo} />
        <Text style={styles.modernJobCode}>ID: {jobCode}</Text>
      </View>
      <View style={styles.gradientLine} />
      <View style={styles.modernBadges}>
        <View style={styles.badgeRow}>
          {employmentType ? <Text style={styles.badge}>{employmentType}</Text> : null}
          {category ? <Text style={styles.badge}>{category}</Text> : null}
        </View>
      </View>
      <Text style={styles.modernTitle}>{title}</Text>
    </View>
  );
}

import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Styles } from '@react-pdf/renderer';
import { COLORS } from '../colors';
import { ModernHeader } from '../sections/Header';
import { ModernFooter } from '../sections/Footer';
import { PdfJobData, PdfFieldRow } from '../helpers/fieldMapper';

type PdfStyle = Styles[string];

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
    fontSize: 9,
    padding: 20,
    paddingBottom: 50,
    color: COLORS.textPrimary,
  },
  // ハイライトカード（3列）
  highlightContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    borderRadius: 4,
    padding: 8,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  highlightLabel: {
    fontFamily: 'NotoSansJP',
    fontSize: 7,
    color: COLORS.textLabel,
    marginBottom: 3,
  },
  highlightValue: {
    fontFamily: 'NotoSansJP',
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  highlightSub: {
    fontFamily: 'NotoSansJP',
    fontSize: 7,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  // タグ
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: COLORS.bgWhite,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  tag: {
    fontFamily: 'NotoSansJP',
    fontSize: 7,
    backgroundColor: COLORS.tagBg,
    color: COLORS.tagText,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: COLORS.tagBorder,
  },
  // セクション
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'NotoSansJP',
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.textPrimary,
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.brandOrange,
  },
  // 情報カード
  infoCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    fontFamily: 'NotoSansJP',
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.textLabel,
    width: '25%',
  },
  infoValue: {
    fontFamily: 'NotoSansJP',
    fontSize: 8.5,
    color: COLORS.textPrimary,
    width: '75%',
    lineHeight: 1.4,
  },
  // 説明テキスト
  descText: {
    fontFamily: 'NotoSansJP',
    fontSize: 8.5,
    color: COLORS.textPrimary,
    lineHeight: 1.5,
    padding: 8,
    backgroundColor: COLORS.bgWhite,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  // メタ情報
  metaText: {
    fontFamily: 'NotoSansJP',
    fontSize: 7,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginBottom: 4,
  },
});

function HighlightCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.highlightCard}>
      <Text style={styles.highlightLabel}>{label}</Text>
      <Text style={styles.highlightValue}>{value}</Text>
      {sub ? <Text style={styles.highlightSub}>{sub}</Text> : null}
    </View>
  );
}

function InfoSection({ title, rows, sectionTitleStyle, valueStyle }: {
  title: string;
  rows: PdfFieldRow[];
  sectionTitleStyle?: PdfStyle;
  valueStyle?: PdfStyle;
}) {
  if (rows.length === 0) return null;
  return (
    <View style={styles.section} wrap={false}>
      <Text style={sectionTitleStyle || styles.sectionTitle}>{title}</Text>
      <View style={styles.infoCard}>
        {rows.map((row, i) => (
          <View key={i} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={valueStyle || styles.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function extractHighlights(data: PdfJobData) {
  // 給与のハイライト値を決定
  let salaryDisplay = '';
  let salarySub = '';
  const salaryRow = data.salaryRows.find(r =>
    r.label === '時給' || r.label === '年収' || r.label === '正社員登用時年収' || r.label === '給与'
  );
  if (salaryRow) {
    salaryDisplay = salaryRow.value;
    salarySub = salaryRow.label;
  }

  // 勤務地
  const locationRow = data.locationRows.find(r => r.label === '勤務地' || r.label === '就業先名');
  const locationDisplay = locationRow?.value || '';

  // 勤務時間
  const hoursRow = data.conditionRows.find(r => r.label === '勤務時間');
  const hoursDisplay = hoursRow?.value || '';

  return { salaryDisplay, salarySub, locationDisplay, hoursDisplay };
}

export function ModernTemplate({ data }: { data: PdfJobData }) {
  const { salaryDisplay, salarySub, locationDisplay, hoursDisplay } = extractHighlights(data);
  const hasPage2 = data.companyRows.length > 0 || data.supplementRows.length > 0;
  const compact = data.isDispatch;

  // 派遣A4 1枚制限: コンテンツ量を調整
  const description = compact && data.description.length > 300
    ? data.description.slice(0, 300) + '...'
    : data.description;
  const conditionRows = compact ? data.conditionRows.slice(0, 8) : data.conditionRows;
  const tags = compact ? data.tags.slice(0, 8) : data.tags;

  // 派遣向けコンパクトスタイル
  const pageStyle = compact
    ? { ...styles.page, fontSize: 8.5, padding: 16, paddingBottom: 40 } as PdfStyle
    : styles.page;
  const sectionTitleStyle = compact
    ? { ...styles.sectionTitle, fontSize: 9, marginBottom: 3 } as PdfStyle
    : styles.sectionTitle;
  const descStyle = compact
    ? { ...styles.descText, fontSize: 8, lineHeight: 1.3 } as PdfStyle
    : styles.descText;
  const valueStyle = compact
    ? { ...styles.infoValue, fontSize: 8 } as PdfStyle
    : styles.infoValue;
  const sectionStyle = compact
    ? { ...styles.section, marginBottom: 4 } as PdfStyle
    : styles.section;

  return (
    <Document>
      <Page size="A4" style={pageStyle} wrap={!compact}>
        <ModernHeader
          title={data.title}
          jobCode={data.jobCode}
          employmentType={data.employmentType}
          category={data.category}
        />

        <Text style={styles.metaText}>取引先: {data.clientName || '-'} | {data.createdAt}</Text>

        {/* ハイライトカード */}
        <View style={compact ? { ...styles.highlightContainer, marginBottom: 6 } : styles.highlightContainer}>
          <HighlightCard label="給与" value={salaryDisplay} sub={salarySub} />
          <HighlightCard label="勤務地" value={locationDisplay} />
          <HighlightCard label="勤務時間" value={hoursDisplay} />
        </View>

        {/* タグ */}
        {tags.length > 0 ? (
          <View style={compact ? { ...styles.tagContainer, marginBottom: 6, paddingVertical: 4 } : styles.tagContainer}>
            {tags.map((tag, i) => (
              <Text key={i} style={styles.tag}>{tag}</Text>
            ))}
          </View>
        ) : null}

        {/* 仕事内容 */}
        {description ? (
          <View style={sectionStyle} wrap={false}>
            <Text style={sectionTitleStyle}>仕事内容</Text>
            <Text style={descStyle}>{description}</Text>
          </View>
        ) : null}

        {/* 勤務地・アクセス */}
        <InfoSection title="勤務地・アクセス" rows={data.locationRows} sectionTitleStyle={sectionTitleStyle} valueStyle={valueStyle} />

        {/* 給与・待遇 */}
        <InfoSection title="給与・待遇" rows={data.salaryRows} sectionTitleStyle={sectionTitleStyle} valueStyle={valueStyle} />

        {/* 勤務条件 */}
        <InfoSection title="勤務条件" rows={conditionRows} sectionTitleStyle={sectionTitleStyle} valueStyle={valueStyle} />

        {/* 応募資格 */}
        <InfoSection title="応募資格・選考" rows={data.applicationRows} sectionTitleStyle={sectionTitleStyle} valueStyle={valueStyle} />

        {/* 福利厚生 */}
        {data.benefitsText ? (
          <View style={sectionStyle} wrap={false}>
            <Text style={sectionTitleStyle}>福利厚生</Text>
            <Text style={descStyle}>{data.benefitsText}</Text>
          </View>
        ) : null}

        <ModernFooter />
      </Page>

      {/* 2ページ目: 会社概要 */}
      {hasPage2 ? (
        <Page size="A4" style={styles.page}>
          <ModernHeader
            title={data.title}
            jobCode={data.jobCode}
            employmentType={data.employmentType}
            category={data.category}
          />
          <InfoSection title="会社概要" rows={data.companyRows} />
          <InfoSection title="補足情報" rows={data.supplementRows} />
          <ModernFooter />
        </Page>
      ) : null}
    </Document>
  );
}

import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Styles } from '@react-pdf/renderer';
import { COLORS } from '../colors';
import { DetailedHeader } from '../sections/Header';
import { DetailedFooter } from '../sections/Footer';
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
  sectionTitle: {
    fontFamily: 'NotoSansJP',
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.textPrimary,
    marginTop: 10,
    marginBottom: 4,
    paddingLeft: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brandOrange,
  },
  table: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    minHeight: 20,
  },
  labelCell: {
    width: '28%',
    backgroundColor: COLORS.bgLight,
    padding: 4,
    paddingLeft: 6,
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderRightColor: COLORS.border,
  },
  labelText: {
    fontFamily: 'NotoSansJP',
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.textLabel,
  },
  valueCell: {
    width: '72%',
    padding: 4,
    paddingLeft: 6,
    justifyContent: 'center',
  },
  valueText: {
    fontFamily: 'NotoSansJP',
    fontSize: 8.5,
    color: COLORS.textPrimary,
    lineHeight: 1.4,
  },
  descriptionBox: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 6,
    minHeight: 40,
  },
  descriptionText: {
    fontFamily: 'NotoSansJP',
    fontSize: 8.5,
    color: COLORS.textPrimary,
    lineHeight: 1.5,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 6,
    marginBottom: 4,
  },
  tag: {
    fontFamily: 'NotoSansJP',
    fontSize: 7,
    backgroundColor: COLORS.tagBg,
    color: COLORS.tagText,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: COLORS.tagBorder,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontFamily: 'NotoSansJP',
    fontSize: 7.5,
    color: COLORS.textMuted,
  },
});

function TableSection({ title, rows, sectionTitleStyle, valueTextStyle }: {
  title: string;
  rows: PdfFieldRow[];
  sectionTitleStyle?: PdfStyle;
  valueTextStyle?: PdfStyle;
}) {
  if (rows.length === 0) return null;
  return (
    <View wrap={false}>
      <Text style={sectionTitleStyle || styles.sectionTitle}>{title}</Text>
      <View style={styles.table}>
        {rows.map((row, i) => (
          <View key={i} style={styles.row} wrap={false}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>{row.label}</Text>
            </View>
            <View style={styles.valueCell}>
              <Text style={valueTextStyle || styles.valueText}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function DetailedTemplate({ data }: { data: PdfJobData }) {
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
    ? { ...styles.sectionTitle, marginTop: 6, marginBottom: 2, fontSize: 9 } as PdfStyle
    : styles.sectionTitle;
  const descStyle = compact
    ? { ...styles.descriptionText, fontSize: 8, lineHeight: 1.3 } as PdfStyle
    : styles.descriptionText;
  const valueStyle = compact
    ? { ...styles.valueText, fontSize: 8 } as PdfStyle
    : styles.valueText;

  return (
    <Document>
      <Page size="A4" style={pageStyle} wrap={!compact}>
        <DetailedHeader
          title={data.title}
          jobCode={data.jobCode}
          employmentType={data.employmentType}
          category={data.category}
        />

        {/* メタ情報 */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>取引先: {data.clientName || '-'}</Text>
          <Text style={styles.metaText}>作成日: {data.createdAt}</Text>
        </View>

        {/* 求人元情報 */}
        <TableSection title="求人元情報" rows={[
          { label: '雇用形態', value: data.employmentType },
          { label: 'カテゴリ', value: data.category },
        ].filter(r => r.value)} sectionTitleStyle={sectionTitleStyle} valueTextStyle={valueStyle} />

        {/* 就業先・勤務地 */}
        <TableSection title="就業先・勤務地" rows={data.locationRows} sectionTitleStyle={sectionTitleStyle} valueTextStyle={valueStyle} />

        {/* 給与・待遇 */}
        <TableSection title="給与・待遇" rows={data.salaryRows} sectionTitleStyle={sectionTitleStyle} valueTextStyle={valueStyle} />

        {/* 勤務条件 */}
        <TableSection title="勤務条件" rows={conditionRows} sectionTitleStyle={sectionTitleStyle} valueTextStyle={valueStyle} />

        {/* 仕事内容 */}
        {description ? (
          <View wrap={false}>
            <Text style={sectionTitleStyle}>仕事内容</Text>
            <View style={styles.descriptionBox}>
              <Text style={descStyle}>{description}</Text>
            </View>
          </View>
        ) : null}

        {/* 応募資格・選考 */}
        <TableSection title="応募資格・選考" rows={data.applicationRows} sectionTitleStyle={sectionTitleStyle} valueTextStyle={valueStyle} />

        {/* 福利厚生 */}
        {data.benefitsText ? (
          <TableSection title="福利厚生" rows={[{ label: '福利厚生', value: data.benefitsText }]} sectionTitleStyle={sectionTitleStyle} valueTextStyle={valueStyle} />
        ) : null}

        {/* 特徴タグ */}
        {tags.length > 0 ? (
          <View wrap={false}>
            <Text style={sectionTitleStyle}>特徴</Text>
            <View style={styles.tagContainer}>
              {tags.map((tag, i) => (
                <Text key={i} style={styles.tag}>{tag}</Text>
              ))}
            </View>
          </View>
        ) : null}

        <DetailedFooter />
      </Page>

      {/* 2ページ目: 会社概要（正社員のみ） */}
      {hasPage2 ? (
        <Page size="A4" style={styles.page}>
          <DetailedHeader
            title={data.title}
            jobCode={data.jobCode}
            employmentType={data.employmentType}
            category={data.category}
          />
          <TableSection title="会社概要" rows={data.companyRows} />
          <TableSection title="補足情報" rows={data.supplementRows} />
          <DetailedFooter />
        </Page>
      ) : null}
    </Document>
  );
}

// 求人データ→PDF表示用データの変換ヘルパー

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JobData = any;

export interface PdfFieldRow {
  label: string;
  value: string;
}

export interface PdfJobData {
  // ヘッダー
  title: string;
  jobCode: string;
  employmentType: string;
  category: string;
  createdAt: string;

  // 求人元
  clientName: string;

  // 勤務地
  locationRows: PdfFieldRow[];

  // 給与・待遇
  salaryRows: PdfFieldRow[];

  // 勤務条件
  conditionRows: PdfFieldRow[];

  // 仕事内容
  description: string;

  // 応募
  applicationRows: PdfFieldRow[];

  // 福利厚生
  benefitsText: string;

  // 特徴タグ
  tags: string[];

  // 会社概要（正社員のみ）
  companyRows: PdfFieldRow[];

  // 補足情報（正社員のみ）
  supplementRows: PdfFieldRow[];

  // 派遣フラグ（A4 1枚制限用）
  isDispatch: boolean;
}

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // not JSON
  }
  return value ? [value] : [];
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('ja-JP');
  } catch {
    return dateStr;
  }
}

function filterEmptyRows(rows: PdfFieldRow[]): PdfFieldRow[] {
  return rows.filter(row => row.value && row.value.trim() !== '' && row.value !== '-');
}

function detectEmploymentType(job: JobData): 'dispatch' | 'fulltime' | 'gig_to_fulltime' {
  if (job.type === 'スキマバイトから正社員') return 'gig_to_fulltime';
  if (job.type?.includes('派遣')) return 'dispatch';
  if (job.type === '正社員' || job.type === '契約社員' || job.type?.includes('正職員')) return 'fulltime';
  return 'dispatch';
}

function getDetails(job: JobData) {
  const dispatch = Array.isArray(job.dispatch_job_details) ? job.dispatch_job_details[0] : job.dispatch_job_details;
  const fulltime = Array.isArray(job.fulltime_job_details) ? job.fulltime_job_details[0] : job.fulltime_job_details;
  const gig = Array.isArray(job.gig_to_fulltime_job_details) ? job.gig_to_fulltime_job_details[0] : job.gig_to_fulltime_job_details;
  return { dispatch, fulltime, gig };
}

export function mapJobToPdfData(job: JobData): PdfJobData {
  const empType = detectEmploymentType(job);
  const { dispatch, fulltime, gig } = getDetails(job);

  const category = Array.isArray(job.category)
    ? job.category.join('、')
    : job.category || '';

  // 勤務地
  const locationRows: PdfFieldRow[] = [];
  if (empType === 'dispatch' && dispatch?.client_company_name && dispatch.is_client_company_public) {
    locationRows.push({ label: '派遣先企業', value: dispatch.client_company_name });
  }
  if (empType === 'fulltime' && fulltime?.company_name && fulltime.is_company_name_public !== false) {
    locationRows.push({ label: '企業名', value: fulltime.company_name });
  }
  locationRows.push(
    { label: '就業先名', value: job.workplace_name || '' },
    { label: '勤務地', value: job.workplace_address || job.area || '' },
    { label: '最寄駅', value: job.nearest_station || '' },
    { label: 'アクセス', value: job.workplace_access || '' },
  );
  if (job.location_notes) {
    locationRows.push({ label: '勤務地備考', value: job.location_notes });
  }
  if (empType === 'fulltime' && fulltime?.work_location_detail) {
    locationRows.push({ label: '勤務地詳細', value: fulltime.work_location_detail });
  }
  if (empType === 'fulltime' && fulltime?.transfer_policy) {
    locationRows.push({ label: '転勤', value: fulltime.transfer_policy });
  }

  // 給与
  const salaryRows: PdfFieldRow[] = [];
  if (empType === 'fulltime' && (fulltime?.annual_salary_min || fulltime?.annual_salary_max)) {
    const min = fulltime.annual_salary_min ? `${fulltime.annual_salary_min}万円` : '';
    const max = fulltime.annual_salary_max ? `${fulltime.annual_salary_max}万円` : '';
    salaryRows.push({ label: '年収', value: min && max ? `${min}〜${max}` : min || max });
  }
  if (empType === 'gig_to_fulltime' && (gig?.annual_salary_min || gig?.annual_salary_max)) {
    const min = gig.annual_salary_min ? `${gig.annual_salary_min}万円` : '';
    const max = gig.annual_salary_max ? `${gig.annual_salary_max}万円` : '';
    salaryRows.push({ label: '正社員登用時年収', value: min && max ? `${min}〜${max}` : min || max });
  }
  if (job.hourly_wage) {
    salaryRows.push({ label: '時給', value: `${job.hourly_wage.toLocaleString()}円` });
  }
  salaryRows.push({ label: '給与', value: job.salary || '' });
  if (job.salary_description) {
    salaryRows.push({ label: '給与補足', value: job.salary_description });
  }
  if (empType === 'dispatch' && dispatch?.training_salary) {
    const period = dispatch.training_period ? `（${dispatch.training_period}）` : '';
    salaryRows.push({ label: '研修時給', value: `${dispatch.training_salary}${period}` });
  }
  if (empType === 'fulltime' && fulltime?.salary_breakdown) {
    salaryRows.push({ label: '給与内訳', value: fulltime.salary_breakdown });
  }
  if (empType === 'fulltime' && fulltime?.salary_example) {
    salaryRows.push({ label: '年収例', value: fulltime.salary_example });
  }

  // 昇給・賞与
  const bonusValue = (empType === 'fulltime' && fulltime?.bonus) || job.bonus_info || '';
  const raiseValue = (empType === 'fulltime' && fulltime?.raise) || job.raise_info || '';
  salaryRows.push(
    { label: '昇給', value: raiseValue },
    { label: '賞与', value: bonusValue },
    { label: '交通費', value: job.commute_allowance || '' },
  );

  // 勤務条件
  const conditionRows: PdfFieldRow[] = [];
  conditionRows.push({ label: '勤務時間', value: job.working_hours || '' });
  if (empType === 'dispatch' && dispatch?.actual_work_hours) {
    conditionRows.push({ label: '実労働時間', value: dispatch.actual_work_hours });
  }
  if (empType === 'dispatch' && dispatch?.work_days_per_week) {
    conditionRows.push({ label: '週勤務日数', value: dispatch.work_days_per_week });
  }

  const holidays = parseJsonArray(job.holidays).join('、') || (typeof job.holidays === 'string' ? job.holidays : '');
  conditionRows.push({ label: '休日・休暇', value: holidays });

  if ((empType === 'fulltime' && fulltime?.annual_holidays) || (empType === 'gig_to_fulltime' && gig?.annual_holidays)) {
    const annualHolidays = (empType === 'fulltime' ? fulltime?.annual_holidays : gig?.annual_holidays) || '';
    conditionRows.push({ label: '年間休日', value: String(annualHolidays) });
  }
  if ((empType === 'fulltime' && fulltime?.overtime_hours) || (empType === 'gig_to_fulltime' && gig?.overtime_hours)) {
    const overtime = (empType === 'fulltime' ? fulltime?.overtime_hours : gig?.overtime_hours) || '';
    conditionRows.push({ label: '残業時間', value: overtime });
  }

  conditionRows.push({ label: '服装', value: job.attire_type || job.attire || '' });
  if (job.hair_style) {
    conditionRows.push({ label: '髪型', value: job.hair_style });
  }
  if (empType === 'dispatch' && dispatch?.nail_policy) {
    conditionRows.push({ label: 'ネイル', value: dispatch.nail_policy });
  }

  if (job.period) conditionRows.push({ label: '雇用期間', value: job.period });
  if (job.start_date) conditionRows.push({ label: '開始日', value: job.start_date });
  if (empType === 'dispatch' && dispatch?.end_date) {
    conditionRows.push({ label: '契約終了日', value: dispatch.end_date });
  }
  if (empType === 'gig_to_fulltime' && gig?.trial_period) {
    conditionRows.push({ label: '体験期間', value: gig.trial_period });
  }

  // 試用期間
  if (empType === 'fulltime' && fulltime?.probation_period) {
    const details = fulltime.probation_details ? `（${fulltime.probation_details}）` : '';
    conditionRows.push({ label: '試用期間', value: `${fulltime.probation_period}${details}` });
  }
  if (empType === 'gig_to_fulltime' && gig?.probation_period) {
    const details = gig.probation_details ? `（${gig.probation_details}）` : '';
    conditionRows.push({ label: '試用期間', value: `${gig.probation_period}${details}` });
  }

  // 受動喫煙対策
  const smokingPolicy = empType === 'fulltime' ? fulltime?.smoking_policy
    : empType === 'gig_to_fulltime' ? gig?.smoking_policy : null;
  if (smokingPolicy) conditionRows.push({ label: '受動喫煙対策', value: smokingPolicy });

  if (empType === 'fulltime' && fulltime?.part_time_available) {
    conditionRows.push({ label: '時短勤務', value: '可' });
  }
  if (empType === 'dispatch' && dispatch?.shift_notes) {
    conditionRows.push({ label: 'シフト備考', value: dispatch.shift_notes });
  }
  if (empType === 'dispatch' && dispatch?.general_notes) {
    conditionRows.push({ label: '備考', value: dispatch.general_notes });
  }

  // 応募
  const applicationRows: PdfFieldRow[] = [];
  applicationRows.push({ label: '応募資格', value: job.requirements || '' });
  if ((empType === 'fulltime' && fulltime?.welcome_requirements) || (empType === 'gig_to_fulltime' && gig?.welcome_requirements)) {
    const welcome = (empType === 'fulltime' ? fulltime?.welcome_requirements : gig?.welcome_requirements) || '';
    applicationRows.push({ label: '歓迎要件', value: welcome });
  }
  const selectionProcess = parseJsonArray(job.selection_process).join(' → ') || job.selection_process || '';
  applicationRows.push({ label: '選考プロセス', value: selectionProcess });
  if (empType === 'fulltime' && fulltime?.interview_location) {
    applicationRows.push({ label: '面接地', value: fulltime.interview_location });
  }

  // 福利厚生
  const benefits = parseJsonArray(job.benefits).join('、') || (typeof job.benefits === 'string' ? job.benefits : '');

  // タグ
  const tags = Array.isArray(job.tags) ? job.tags.filter(Boolean) : [];

  // 会社概要（正社員のみ）
  const companyRows: PdfFieldRow[] = [];
  if (empType === 'fulltime' && fulltime) {
    if (fulltime.company_name) companyRows.push({ label: '企業名', value: fulltime.company_name });
    if (fulltime.industry) companyRows.push({ label: '業種', value: fulltime.industry });
    if (fulltime.company_size) companyRows.push({ label: '従業員数', value: fulltime.company_size });
    if (fulltime.established_date) companyRows.push({ label: '設立', value: fulltime.established_date });
    if (fulltime.representative) companyRows.push({ label: '代表者', value: fulltime.representative });
    if (fulltime.capital) companyRows.push({ label: '資本金', value: fulltime.capital });
    if (fulltime.annual_revenue) companyRows.push({ label: '売上高', value: fulltime.annual_revenue });
    if (fulltime.company_address) companyRows.push({ label: '本社所在地', value: fulltime.company_address });
    if (fulltime.company_overview) companyRows.push({ label: '企業概要', value: fulltime.company_overview });
    if (fulltime.business_overview) companyRows.push({ label: '事業内容', value: fulltime.business_overview });
    if (fulltime.company_url) companyRows.push({ label: '企業URL', value: fulltime.company_url });
  }

  // 補足情報
  const supplementRows: PdfFieldRow[] = [];
  const appealPoints = (empType === 'fulltime' ? fulltime?.appeal_points : gig?.appeal_points) || '';
  if (appealPoints) supplementRows.push({ label: '訴求ポイント', value: appealPoints });
  if (empType === 'fulltime' && fulltime?.recruitment_background) {
    supplementRows.push({ label: '募集背景', value: fulltime.recruitment_background });
  }
  if (empType === 'fulltime' && fulltime?.education_training) {
    supplementRows.push({ label: '教育制度', value: fulltime.education_training });
  }
  if (empType === 'fulltime' && fulltime?.onboarding_process) {
    supplementRows.push({ label: '入社後の流れ', value: fulltime.onboarding_process });
  }
  if (empType === 'fulltime' && fulltime?.department_details) {
    supplementRows.push({ label: '配属先', value: fulltime.department_details });
  }

  return {
    title: job.title || '',
    jobCode: job.job_code || '',
    employmentType: job.type || '',
    category,
    createdAt: formatDate(job.created_at),
    clientName: job.clients?.name || '',
    locationRows: filterEmptyRows(locationRows),
    salaryRows: filterEmptyRows(salaryRows),
    conditionRows: filterEmptyRows(conditionRows),
    description: job.description || '',
    applicationRows: filterEmptyRows(applicationRows),
    benefitsText: benefits,
    tags,
    companyRows: filterEmptyRows(companyRows),
    supplementRows: filterEmptyRows(supplementRows),
    isDispatch: empType === 'dispatch',
  };
}

// フォームデータ（JobPreviewModalと同じ構造）→ mapJobToPdfDataが期待するDB風オブジェクトに変換

export interface FormPdfData {
  title: string;
  area: string;
  salary: string;
  type: string;
  category: string[] | string;
  tags: string[];
  description: string;
  requirements: string;
  workingHours: string;
  holidays: string;
  benefits: string;
  selectionProcess: string;
  hourly_wage?: number;
  salary_description?: string;
  period?: string;
  start_date?: string;
  workplace_name?: string;
  workplace_address?: string;
  workplace_access?: string;
  attire_type?: string;
  hair_style?: string;
  nearest_station?: string;
  nearest_station_is_estimated?: boolean;
  // 派遣専用
  client_company_name?: string;
  training_period?: string;
  training_salary?: string;
  end_date?: string;
  actual_work_hours?: string;
  work_days_per_week?: string;
  nail_policy?: string;
  shift_notes?: string;
  general_notes?: string;
  // 正社員専用
  company_name?: string;
  industry?: string;
  company_size?: string;
  company_overview?: string;
  annual_salary_min?: string;
  annual_salary_max?: string;
  overtime_hours?: string;
  annual_holidays?: string;
  probation_period?: string;
  probation_details?: string;
  appeal_points?: string;
  welcome_requirements?: string;
  business_overview?: string;
  salary_detail?: string;
  recruitment_background?: string;
  education_training?: string;
  department_details?: string;
  work_location_detail?: string;
  transfer_policy?: string;
  representative?: string;
  capital?: string;
  company_address?: string;
  company_url?: string;
  is_company_name_public?: boolean;
  established_date?: string;
  smoking_policy?: string;
  part_time_available?: boolean;
  salary_example?: string;
  bonus?: string;
  raise?: string;
  annual_revenue?: string;
  onboarding_process?: string;
  interview_location?: string;
  salary_breakdown?: string;
  // ギグ→正社員専用
  trial_period?: string;
  gig_job_url?: string;
  // メタ
  job_code?: string;
  client_name?: string;
  created_at?: string;
}

// mapJobToPdfData が期待する DB 風の構造に変換
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formDataToJobShape(form: FormPdfData): any {
  const isDispatch = form.type?.includes('派遣') && form.type !== 'スキマバイトから正社員';
  const isFulltime = form.type === '正社員' || form.type === '契約社員' || form.type?.includes('正職員');
  const isGig = form.type === 'スキマバイトから正社員';

  return {
    title: form.title,
    job_code: form.job_code || '',
    area: form.area,
    type: form.type,
    category: Array.isArray(form.category) ? form.category : form.category ? [form.category] : [],
    tags: form.tags || [],
    salary: form.salary,
    hourly_wage: form.hourly_wage,
    salary_description: form.salary_description,
    description: form.description,
    requirements: form.requirements,
    working_hours: form.workingHours,
    holidays: form.holidays,
    benefits: form.benefits,
    selection_process: form.selectionProcess,
    nearest_station: form.nearest_station,
    nearest_station_is_estimated: form.nearest_station_is_estimated,
    workplace_name: form.workplace_name,
    workplace_address: form.workplace_address,
    workplace_access: form.workplace_access,
    attire_type: form.attire_type,
    hair_style: form.hair_style,
    period: form.period,
    start_date: form.start_date,
    raise_info: form.raise,
    bonus_info: form.bonus,
    commute_allowance: undefined,
    location_notes: undefined,
    created_at: form.created_at || new Date().toISOString(),
    clients: form.client_name ? { name: form.client_name } : null,

    // 派遣詳細
    dispatch_job_details: isDispatch ? {
      client_company_name: form.client_company_name,
      is_client_company_public: true,
      training_salary: form.training_salary,
      training_period: form.training_period,
      end_date: form.end_date,
      actual_work_hours: form.actual_work_hours,
      work_days_per_week: form.work_days_per_week,
      nail_policy: form.nail_policy,
      shift_notes: form.shift_notes,
      general_notes: form.general_notes,
    } : null,

    // 正社員詳細
    fulltime_job_details: isFulltime ? {
      company_name: form.company_name,
      is_company_name_public: form.is_company_name_public ?? true,
      company_address: form.company_address,
      industry: form.industry,
      company_size: form.company_size,
      established_date: form.established_date,
      company_overview: form.company_overview,
      business_overview: form.business_overview,
      annual_salary_min: form.annual_salary_min ? Number(form.annual_salary_min) : null,
      annual_salary_max: form.annual_salary_max ? Number(form.annual_salary_max) : null,
      overtime_hours: form.overtime_hours,
      annual_holidays: form.annual_holidays,
      probation_period: form.probation_period,
      probation_details: form.probation_details,
      part_time_available: form.part_time_available,
      smoking_policy: form.smoking_policy,
      appeal_points: form.appeal_points,
      welcome_requirements: form.welcome_requirements,
      department_details: form.department_details,
      recruitment_background: form.recruitment_background,
      company_url: form.company_url,
      education_training: form.education_training,
      representative: form.representative,
      capital: form.capital,
      work_location_detail: form.work_location_detail,
      salary_detail: form.salary_detail,
      transfer_policy: form.transfer_policy,
      salary_example: form.salary_example,
      bonus: form.bonus,
      raise: form.raise,
      annual_revenue: form.annual_revenue,
      onboarding_process: form.onboarding_process,
      interview_location: form.interview_location,
      salary_breakdown: form.salary_breakdown,
    } : null,

    // ギグ→正社員詳細
    gig_to_fulltime_job_details: isGig ? {
      trial_period: form.trial_period,
      gig_job_url: form.gig_job_url,
      annual_salary_min: form.annual_salary_min ? Number(form.annual_salary_min) : null,
      annual_salary_max: form.annual_salary_max ? Number(form.annual_salary_max) : null,
      annual_holidays: form.annual_holidays,
      probation_period: form.probation_period,
      probation_details: form.probation_details,
      overtime_hours: form.overtime_hours,
      smoking_policy: form.smoking_policy,
      appeal_points: form.appeal_points,
      welcome_requirements: form.welcome_requirements,
    } : null,
  };
}

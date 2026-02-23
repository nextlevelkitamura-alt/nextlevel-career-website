"use client";

import { updateJob, deleteJobFile, deleteLegacyJobFile, extractJobDataFromFile, processExtractedJobData, type ExtractedJobData } from "../../../actions";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Maximize2, X, ExternalLink } from "lucide-react";

type DispatchJobDetail = {
    client_company_name?: string | null;
    is_client_company_public?: boolean;
    training_salary?: string | null;
    training_period?: string | null;
    end_date?: string | null;
    actual_work_hours?: string | null;
    work_days_per_week?: string | null;
    nail_policy?: string | null;
    shift_notes?: string | null;
    general_notes?: string | null;
    welcome_requirements?: string | null;
};

type FulltimeJobDetail = {
    company_name?: string | null;
    is_company_name_public?: boolean;
    company_address?: string | null;
    industry?: string | null;
    company_size?: string | null;
    established_date?: string | null;
    company_overview?: string | null;
    business_overview?: string | null;
    annual_salary_min?: number | null;
    annual_salary_max?: number | null;
    overtime_hours?: string | null;
    annual_holidays?: string | null;
    probation_period?: string | null;
    probation_details?: string | null;
    part_time_available?: boolean;
    smoking_policy?: string | null;
    appeal_points?: string | null;
    welcome_requirements?: string | null;
    department_details?: string | null;
    recruitment_background?: string | null;
    company_url?: string | null;
    education_training?: string | null;
    representative?: string | null;
    capital?: string | null;
    work_location_detail?: string | null;
    salary_detail?: string | null;
    transfer_policy?: string | null;
    salary_example?: string | null;
    bonus?: string | null;
    raise?: string | null;
    annual_revenue?: string | null;
    onboarding_process?: string | null;
    interview_location?: string | null;
    salary_breakdown?: string | null;
    shift_notes?: string | null;
};

type Job = {
    id: string;
    title: string;
    job_code?: string;
    area: string;
    type: string;
    salary: string;
    category: string;
    tags: string[] | null;
    pdf_url?: string | null;
    client_id?: string | null;
    description?: string;
    requirements?: string;
    working_hours?: string;
    holidays?: string;
    benefits?: string;
    selection_process?: string;
    job_attachments?: {
        id: string;
        file_name: string;
        file_url: string;
        file_size: number;
    }[];
    hourly_wage?: number;
    salary_description?: string;
    period?: string;
    start_date?: string;
    workplace_name?: string;
    workplace_address?: string;
    workplace_access?: string;
    attire?: string;
    attire_type?: string;
    hair_style?: string;
    nearest_station?: string;
    location_notes?: string;
    salary_type?: string;
    raise_info?: string;
    bonus_info?: string;
    commute_allowance?: string;
    job_category_detail?: string;
    search_areas?: string[] | null;
    published_at?: string | null;
    expires_at?: string | null;
    dispatch_job_details?: DispatchJobDetail[] | DispatchJobDetail | null;
    fulltime_job_details?: FulltimeJobDetail[] | FulltimeJobDetail | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ai_analysis?: Record<string, any> | null;
};

import FileUploader from "@/components/admin/FileUploader";
import ClientSelect from "@/components/admin/ClientSelect";

import TimePicker from "@/components/admin/TimePicker";
import MultiAreaSelect from "@/components/admin/MultiAreaSelect";
import SalaryInput from "@/components/admin/SalaryInput";
import SalaryTypeSelector from "@/components/admin/SalaryTypeSelector";
import MonthlySalarySelector from "@/components/admin/MonthlySalarySelector";
import HourlyWageInput from "@/components/admin/HourlyWageInput";
import AttireSelector from "@/components/admin/AttireSelector";
import SelectionProcessBuilder from "@/components/admin/SelectionProcessBuilder";
import TagSelector from "@/components/admin/TagSelector";
import ChatAIRefineDialog from "@/components/admin/ChatAIRefineDialog";
import DispatchJobFields from "@/components/admin/DispatchJobFields";
import FulltimeJobFields from "@/components/admin/FulltimeJobFields";
import JobPreviewModal from "@/components/admin/JobPreviewModal";
import AiExtractButton from "@/components/admin/AiExtractButton";
import AiExtractionPreview from "@/components/admin/AiExtractionPreview";

export default function EditJobForm({ job }: { job: Job }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // PDFプレビュー: 最初のPDFファイルがあれば自動的に開く
    const firstPdf = job.job_attachments?.find(a => a.file_name.toLowerCase().endsWith('.pdf'));
    const [previewFile, setPreviewFile] = useState<{ url: string, type: string, name: string } | null>(
        firstPdf ? { url: firstPdf.file_url, type: 'application/pdf', name: firstPdf.file_name } : null
    );
    const [isPreviewLocked, setIsPreviewLocked] = useState(!!firstPdf);

    // Controlled inputs with initial values
    const [title, setTitle] = useState(job.title || "");
    const [searchAreas, setSearchAreas] = useState<string[]>(
        job.search_areas && job.search_areas.length > 0 ? job.search_areas : [job.area || ""]
    );
    const area = searchAreas[0] || "";
    const [salary, setSalary] = useState(job.salary || "");
    const [description, setDescription] = useState(job.description || "");
    const [requirements, setRequirements] = useState(job.requirements || "");
    const [workingHours, setWorkingHours] = useState(job.working_hours || "");
    const [holidays, setHolidays] = useState(job.holidays || "");
    const [benefits, setBenefits] = useState(job.benefits || "");
    const [selectionProcess, setSelectionProcess] = useState(job.selection_process || "");
    // Initialize tags as JSON string or empty string
    // Initialize tags as JSON string or empty string
    const [tags, setTags] = useState(job.tags && job.tags.length > 0 ? JSON.stringify(job.tags) : "");

    // Expanded fields
    const [hourlyWage, setHourlyWage] = useState(job.hourly_wage ? String(job.hourly_wage) : "");
    const [salaryDescription, setSalaryDescription] = useState(job.salary_description || "");
    const [period, setPeriod] = useState(job.period || "");
    const [startDate, setStartDate] = useState(job.start_date || "");
    const [workplaceName, setWorkplaceName] = useState(job.workplace_name || "");
    const [workplaceAddress, setWorkplaceAddress] = useState(job.workplace_address || "");
    const [workplaceAccess, setWorkplaceAccess] = useState(job.workplace_access || "");
    const [attireType, setAttireType] = useState(job.attire_type || "");
    const [hairStyle, setHairStyle] = useState(job.hair_style || "");
    const [nearestStation, setNearestStation] = useState(job.nearest_station || "");
    const [locationNotes, setLocationNotes] = useState(job.location_notes || "");
    const [salaryType, setSalaryType] = useState(job.salary_type || "");
    const [raiseInfo, setRaiseInfo] = useState(job.raise_info || "");
    const [bonusInfo, setBonusInfo] = useState(job.bonus_info || "");
    const [commuteAllowance, setCommuteAllowance] = useState(job.commute_allowance || "");
    const [jobCategoryDetail, setJobCategoryDetail] = useState(job.job_category_detail || "");

    // 掲載期間
    const [publishedAt, setPublishedAt] = useState(job.published_at ? new Date(job.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [expiresAt, setExpiresAt] = useState(job.expires_at ? new Date(job.expires_at).toISOString().split('T')[0] : "");

    // リレーションデータの参照（詳細テーブル → ai_analysis のフォールバック）
    // Supabaseの1対1リレーションはオブジェクトで返るため、配列とオブジェクトの両方に対応
    const dd = Array.isArray(job.dispatch_job_details) ? job.dispatch_job_details[0] : job.dispatch_job_details;
    const fd = Array.isArray(job.fulltime_job_details) ? job.fulltime_job_details[0] : job.fulltime_job_details;
    const ai = job.ai_analysis || {};

    // 派遣専用フィールド（dd → ai_analysis フォールバック）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [clientCompanyName, _setClientCompanyName] = useState(dd?.client_company_name || ai.client_company_name || "");
    const [trainingSalary, setTrainingSalary] = useState(dd?.training_salary || ai.training_salary || "");
    const [trainingPeriod, setTrainingPeriod] = useState(dd?.training_period || ai.training_period || "");
    const [endDate, setEndDate] = useState(dd?.end_date || ai.end_date || "");
    const [actualWorkHours, setActualWorkHours] = useState(dd?.actual_work_hours || ai.actual_work_hours || "");
    const [workDaysPerWeek, setWorkDaysPerWeek] = useState(dd?.work_days_per_week || ai.work_days_per_week || "");
    const [nailPolicy, setNailPolicy] = useState(dd?.nail_policy || ai.nail_policy || "");
    const [shiftNotes, setShiftNotes] = useState(dd?.shift_notes || fd?.shift_notes || ai.shift_notes || "");
    const [generalNotes, setGeneralNotes] = useState(dd?.general_notes || ai.general_notes || "");

    // 正社員専用フィールド（fd → ai_analysis フォールバック）
    const [companyName, setCompanyName] = useState(fd?.company_name || ai.company_name || "");
    const [companyAddress, setCompanyAddress] = useState(fd?.company_address || ai.company_address || "");
    const [industry, setIndustry] = useState(fd?.industry || ai.industry || "");
    const [companySize, setCompanySize] = useState(fd?.company_size || ai.company_size || "");
    const [establishedDate, setEstablishedDate] = useState(fd?.established_date || ai.established_date || "");
    const [companyOverview, setCompanyOverview] = useState(fd?.company_overview || ai.company_overview || "");
    const [businessOverview, setBusinessOverview] = useState(fd?.business_overview || ai.business_overview || "");
    const [annualSalaryMin, setAnnualSalaryMin] = useState(fd?.annual_salary_min ? String(fd.annual_salary_min) : ai.annual_salary_min ? String(ai.annual_salary_min) : "");
    const [annualSalaryMax, setAnnualSalaryMax] = useState(fd?.annual_salary_max ? String(fd.annual_salary_max) : ai.annual_salary_max ? String(ai.annual_salary_max) : "");
    const [overtimeHours, setOvertimeHours] = useState(fd?.overtime_hours || ai.overtime_hours || "");
    const [annualHolidays, setAnnualHolidays] = useState(fd?.annual_holidays ? String(fd.annual_holidays) : ai.annual_holidays ? String(ai.annual_holidays) : "");
    const [probationPeriod, setProbationPeriod] = useState(fd?.probation_period || ai.probation_period || "");
    const [probationDetails, setProbationDetails] = useState(fd?.probation_details || ai.probation_details || "");
    const [partTimeAvailable, setPartTimeAvailable] = useState(fd?.part_time_available || ai.part_time_available || false);
    const [smokingPolicy, setSmokingPolicy] = useState(fd?.smoking_policy || ai.smoking_policy || "");
    const [appealPoints, setAppealPoints] = useState(fd?.appeal_points || ai.appeal_points || "");
    const [welcomeRequirements, setWelcomeRequirements] = useState(fd?.welcome_requirements || dd?.welcome_requirements || ai.welcome_requirements || "");
    const [departmentDetails, setDepartmentDetails] = useState(fd?.department_details || ai.department_details || "");
    const [isCompanyNamePublic, setIsCompanyNamePublic] = useState(fd?.is_company_name_public !== false);
    const [recruitmentBackground, setRecruitmentBackground] = useState(fd?.recruitment_background || ai.recruitment_background || "");
    const [companyUrl, setCompanyUrl] = useState(fd?.company_url || ai.company_url || "");
    const [educationTraining, setEducationTraining] = useState(fd?.education_training || ai.education_training || "");
    const [representative, setRepresentative] = useState(fd?.representative || ai.representative || "");
    const [capital, setCapital] = useState(fd?.capital || ai.capital || "");
    const [workLocationDetail, setWorkLocationDetail] = useState(fd?.work_location_detail || ai.work_location_detail || "");
    const [salaryDetail, setSalaryDetail] = useState(fd?.salary_detail || ai.salary_detail || "");
    const [transferPolicy, setTransferPolicy] = useState(fd?.transfer_policy || ai.transfer_policy || "");
    const [salaryExample, setSalaryExample] = useState(fd?.salary_example || ai.salary_example || "");
    const [bonus, setBonus] = useState(fd?.bonus || ai.bonus || "");
    const [raise, setRaise] = useState(fd?.raise || ai.raise || "");
    const [annualRevenue, setAnnualRevenue] = useState(fd?.annual_revenue || ai.annual_revenue || "");
    const [onboardingProcess, setOnboardingProcess] = useState(fd?.onboarding_process || ai.onboarding_process || "");
    const [interviewLocation, setInterviewLocation] = useState(fd?.interview_location || ai.interview_location || "");
    const [salaryBreakdown, setSalaryBreakdown] = useState(fd?.salary_breakdown || ai.salary_breakdown || "");

    // AI抽出差分プレビュー用state
    const [pendingExtraction, setPendingExtraction] = useState<{
        currentData: Record<string, unknown>;
        extractedData: Record<string, unknown>;
    } | null>(null);

    // 現在のフォーム値を取得するヘルパー
    const getCurrentFormData = (): Record<string, unknown> => {
        const data: Record<string, unknown> = {
            title, area, salary, description, requirements,
            working_hours: workingHours, selection_process: selectionProcess,
            tags: tags ? (tags.startsWith('[') ? JSON.parse(tags) : tags) : "",
            hourly_wage: hourlyWage ? Number(hourlyWage) : "",
            salary_description: salaryDescription,
            salary_type: salaryType,
            period, start_date: startDate,
            workplace_name: workplaceName,
            workplace_address: workplaceAddress,
            workplace_access: workplaceAccess,
            nearest_station: nearestStation,
            location_notes: locationNotes,
            attire_type: attireType,
            hair_style: hairStyle,
            job_category_detail: jobCategoryDetail,
            raise_info: raiseInfo,
            bonus_info: bonusInfo,
            commute_allowance: commuteAllowance,
            welcome_requirements: welcomeRequirements,
            shift_notes: shiftNotes,
        };
        // holidays/benefits: JSON配列として比較
        try { data.holidays = holidays ? (holidays.startsWith('[') ? JSON.parse(holidays) : [holidays]) : []; } catch { data.holidays = holidays ? [holidays] : []; }
        try { data.benefits = benefits ? (benefits.startsWith('[') ? JSON.parse(benefits) : [benefits]) : []; } catch { data.benefits = benefits ? [benefits] : []; }

        if (isDispatchJob) {
            Object.assign(data, {
                client_company_name: clientCompanyName,
                training_salary: trainingSalary,
                training_period: trainingPeriod,
                end_date: endDate,
                actual_work_hours: actualWorkHours,
                work_days_per_week: workDaysPerWeek,
                nail_policy: nailPolicy,
                general_notes: generalNotes,
            });
        } else {
            Object.assign(data, {
                company_name: companyName, company_address: companyAddress,
                industry, company_size: companySize,
                established_date: establishedDate,
                company_overview: companyOverview,
                business_overview: businessOverview,
                annual_salary_min: annualSalaryMin ? Number(annualSalaryMin) : "",
                annual_salary_max: annualSalaryMax ? Number(annualSalaryMax) : "",
                overtime_hours: overtimeHours,
                annual_holidays: annualHolidays,
                probation_period: probationPeriod,
                probation_details: probationDetails,
                smoking_policy: smokingPolicy,
                appeal_points: appealPoints,
                department_details: departmentDetails,
                recruitment_background: recruitmentBackground,
                company_url: companyUrl,
                education_training: educationTraining,
                representative, capital,
                work_location_detail: workLocationDetail,
                salary_detail: salaryDetail,
                transfer_policy: transferPolicy,
                salary_example: salaryExample,
                bonus, raise: raise,
                annual_revenue: annualRevenue,
                onboarding_process: onboardingProcess,
                interview_location: interviewLocation,
                salary_breakdown: salaryBreakdown,
            });
        }
        return data;
    };

    // AI抽出データをフラット化（extractedDataからフォーム用の値に変換）
    const flattenExtractedData = (processedData: ExtractedJobData): Record<string, unknown> => {
        const flat: Record<string, unknown> = {};

        // 共通フィールド
        if (processedData.title !== undefined) flat.title = processedData.title;
        if (processedData.area !== undefined) flat.area = processedData.area;
        if (processedData.search_areas !== undefined) flat.search_areas = processedData.search_areas;
        if (processedData.description !== undefined) flat.description = processedData.description;
        if (processedData.working_hours !== undefined) flat.working_hours = processedData.working_hours;
        if (processedData.selection_process !== undefined) flat.selection_process = processedData.selection_process;
        if (processedData.tags !== undefined) flat.tags = processedData.tags;
        if (processedData.requirements !== undefined) {
            flat.requirements = Array.isArray(processedData.requirements)
                ? processedData.requirements.join('\n')
                : processedData.requirements;
        }
        if (processedData.welcome_requirements !== undefined) {
            flat.welcome_requirements = Array.isArray(processedData.welcome_requirements)
                ? processedData.welcome_requirements.join('\n')
                : processedData.welcome_requirements;
        }
        if (processedData.holidays !== undefined) flat.holidays = processedData.holidays;
        if (processedData.benefits !== undefined) flat.benefits = processedData.benefits;
        if (processedData.period !== undefined) flat.period = processedData.period;
        if (processedData.start_date !== undefined) flat.start_date = processedData.start_date;
        if (processedData.workplace_name !== undefined) flat.workplace_name = processedData.workplace_name;
        if (processedData.workplace_address !== undefined) flat.workplace_address = processedData.workplace_address;
        if (processedData.workplace_access !== undefined) flat.workplace_access = processedData.workplace_access;
        if (processedData.nearest_station !== undefined) flat.nearest_station = processedData.nearest_station;
        if (processedData.location_notes !== undefined) flat.location_notes = processedData.location_notes;
        if (processedData.attire_type !== undefined) flat.attire_type = processedData.attire_type;
        if (processedData.hair_style !== undefined) flat.hair_style = processedData.hair_style;
        if (processedData.job_category_detail !== undefined) flat.job_category_detail = processedData.job_category_detail;
        if (processedData.shift_notes !== undefined) flat.shift_notes = processedData.shift_notes;

        // 給与関連
        if (isDispatchJob) {
            if (processedData.salary !== undefined) flat.salary = processedData.salary;
            if (processedData.hourly_wage !== undefined) flat.hourly_wage = processedData.hourly_wage;
            if (processedData.salary_description !== undefined) flat.salary_description = processedData.salary_description;
            if (processedData.salary_type !== undefined) flat.salary_type = processedData.salary_type;
        }

        // 派遣専用
        if (isDispatchJob) {
            if (processedData.training_period !== undefined) flat.training_period = processedData.training_period;
            if (processedData.training_salary !== undefined) flat.training_salary = processedData.training_salary;
            if (processedData.end_date !== undefined) flat.end_date = processedData.end_date;
            if (processedData.actual_work_hours !== undefined) flat.actual_work_hours = String(processedData.actual_work_hours);
            if (processedData.work_days_per_week !== undefined) flat.work_days_per_week = String(processedData.work_days_per_week);
            if (processedData.nail_policy !== undefined) flat.nail_policy = processedData.nail_policy;
            if (processedData.general_notes !== undefined) flat.general_notes = processedData.general_notes;
            if (processedData.client_company_name !== undefined) flat.client_company_name = processedData.client_company_name;
        }

        // 正社員専用
        if (!isDispatchJob) {
            if (processedData.company_name !== undefined) flat.company_name = processedData.company_name;
            if (processedData.industry !== undefined) flat.industry = processedData.industry;
            if (processedData.company_overview !== undefined) flat.company_overview = processedData.company_overview;
            if (processedData.business_overview !== undefined) flat.business_overview = processedData.business_overview;
            if (processedData.company_size !== undefined) flat.company_size = processedData.company_size;
            if (processedData.established_date !== undefined) flat.established_date = processedData.established_date;
            if (processedData.company_address !== undefined) flat.company_address = processedData.company_address;
            if (processedData.annual_salary_min !== undefined) flat.annual_salary_min = processedData.annual_salary_min;
            if (processedData.annual_salary_max !== undefined) flat.annual_salary_max = processedData.annual_salary_max;
            if (processedData.overtime_hours !== undefined) flat.overtime_hours = processedData.overtime_hours;
            if (processedData.annual_holidays !== undefined) flat.annual_holidays = String(processedData.annual_holidays);
            if (processedData.probation_period !== undefined) flat.probation_period = processedData.probation_period;
            if (processedData.probation_details !== undefined) flat.probation_details = processedData.probation_details;
            if (processedData.smoking_policy !== undefined) flat.smoking_policy = processedData.smoking_policy;
            if (processedData.appeal_points !== undefined) flat.appeal_points = processedData.appeal_points;
            if (processedData.department_details !== undefined) flat.department_details = processedData.department_details;
            if (processedData.recruitment_background !== undefined) flat.recruitment_background = processedData.recruitment_background;
            if (processedData.company_url !== undefined) flat.company_url = processedData.company_url;
            if (processedData.education_training !== undefined) flat.education_training = processedData.education_training;
            if (processedData.representative !== undefined) flat.representative = processedData.representative;
            if (processedData.capital !== undefined) flat.capital = processedData.capital;
            if (processedData.work_location_detail !== undefined) flat.work_location_detail = processedData.work_location_detail;
            if (processedData.salary_detail !== undefined) flat.salary_detail = processedData.salary_detail;
            if (processedData.transfer_policy !== undefined) flat.transfer_policy = processedData.transfer_policy;
            if (processedData.salary_example !== undefined) flat.salary_example = processedData.salary_example;
            if (processedData.salary_breakdown !== undefined) flat.salary_breakdown = processedData.salary_breakdown;
        }

        return flat;
    };

    // 差分プレビューから選択されたフィールドを適用
    const handleApplyExtraction = (selectedFields: string[]) => {
        if (!pendingExtraction) return;
        const { extractedData } = pendingExtraction;

        for (const field of selectedFields) {
            const value = extractedData[field];
            const str = value != null ? String(value) : "";

            switch (field) {
                case "title": setTitle(str); break;
                case "area":
                case "search_areas":
                    if (field === "search_areas" && Array.isArray(value) && value.length > 0) {
                        setSearchAreas(value as string[]);
                    } else if (field === "area" && str) {
                        setSearchAreas([str]);
                    }
                    break;
                case "salary": setSalary(str); break;
                case "description": setDescription(str); break;
                case "requirements": setRequirements(str); break;
                case "welcome_requirements": setWelcomeRequirements(str); break;
                case "working_hours": setWorkingHours(str); break;
                case "selection_process": setSelectionProcess(str); break;
                case "tags": setTags(Array.isArray(value) ? JSON.stringify(value) : str); break;
                case "holidays": setHolidays(Array.isArray(value) ? JSON.stringify(value) : str); break;
                case "benefits": setBenefits(Array.isArray(value) ? JSON.stringify(value) : str); break;
                case "hourly_wage": setHourlyWage(value ? String(value) : ""); break;
                case "salary_description": setSalaryDescription(str); break;
                case "salary_type": setSalaryType(str); break;
                case "period": setPeriod(str); break;
                case "start_date": setStartDate(str); break;
                case "workplace_name": setWorkplaceName(str); break;
                case "workplace_address": setWorkplaceAddress(str); break;
                case "workplace_access": setWorkplaceAccess(str); break;
                case "nearest_station": setNearestStation(str); break;
                case "location_notes": setLocationNotes(str); break;
                case "attire_type": setAttireType(str); break;
                case "hair_style": setHairStyle(str); break;
                case "job_category_detail": setJobCategoryDetail(str); break;
                case "raise_info": setRaiseInfo(str); break;
                case "bonus_info": setBonusInfo(str); break;
                case "commute_allowance": setCommuteAllowance(str); break;
                case "shift_notes": setShiftNotes(str); break;
                // 派遣専用
                case "training_salary": setTrainingSalary(str); break;
                case "training_period": setTrainingPeriod(str); break;
                case "end_date": setEndDate(str); break;
                case "actual_work_hours": setActualWorkHours(str); break;
                case "work_days_per_week": setWorkDaysPerWeek(str); break;
                case "nail_policy": setNailPolicy(str); break;
                case "general_notes": setGeneralNotes(str); break;
                // 正社員専用
                case "company_name": setCompanyName(str); break;
                case "company_address": setCompanyAddress(str); break;
                case "industry": setIndustry(str); break;
                case "company_size": setCompanySize(str); break;
                case "established_date": setEstablishedDate(str); break;
                case "company_overview": setCompanyOverview(str); break;
                case "business_overview": setBusinessOverview(str); break;
                case "annual_salary_min": setAnnualSalaryMin(value ? String(value) : ""); break;
                case "annual_salary_max": setAnnualSalaryMax(value ? String(value) : ""); break;
                case "overtime_hours": setOvertimeHours(str); break;
                case "annual_holidays": setAnnualHolidays(str); break;
                case "probation_period": setProbationPeriod(str); break;
                case "probation_details": setProbationDetails(str); break;
                case "smoking_policy": setSmokingPolicy(str); break;
                case "appeal_points": setAppealPoints(str); break;
                case "department_details": setDepartmentDetails(str); break;
                case "recruitment_background": setRecruitmentBackground(str); break;
                case "company_url": setCompanyUrl(str); break;
                case "education_training": setEducationTraining(str); break;
                case "representative": setRepresentative(str); break;
                case "capital": setCapital(str); break;
                case "work_location_detail": setWorkLocationDetail(str); break;
                case "salary_detail": setSalaryDetail(str); break;
                case "transfer_policy": setTransferPolicy(str); break;
                case "salary_example": setSalaryExample(str); break;
                case "salary_breakdown": setSalaryBreakdown(str); break;
                case "annual_revenue": setAnnualRevenue(str); break;
                case "onboarding_process": setOnboardingProcess(str); break;
                case "interview_location": setInterviewLocation(str); break;
            }
        }

        setPendingExtraction(null);
        toast.success(`${selectedFields.length}件のフィールドを適用しました`);
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);

        if (files.length > 0) {
            files.forEach(file => {
                formData.append("pdf_files", file);
            });
        }

        // Append controlled values
        formData.set("title", title);
        formData.set("area", area);
        formData.set("search_areas", JSON.stringify(searchAreas.filter(Boolean)));
        // 正社員：salaryを年収min/maxから自動生成（未設定の場合は既存salaryを保持）
        if (job.type === "正社員" || job.type === "契約社員") {
            const min = annualSalaryMin ? Number(annualSalaryMin) : 0;
            const max = annualSalaryMax ? Number(annualSalaryMax) : 0;
            const autoSalary = min && max ? `年収${min}万〜${max}万円` : min ? `年収${min}万円〜` : max ? `〜年収${max}万円` : "";
            formData.set("salary", autoSalary || salary);
        } else {
            formData.set("salary", salary);
        }
        formData.set("description", description);
        formData.set("requirements", requirements);
        formData.set("working_hours", workingHours);
        formData.set("holidays", holidays);
        formData.set("benefits", benefits);
        formData.set("selection_process", selectionProcess);

        // Append expanded fields
        if (hourlyWage) formData.set("hourly_wage", hourlyWage);
        formData.set("salary_description", salaryDescription);
        formData.set("period", period);
        formData.set("start_date", startDate);
        formData.set("workplace_name", workplaceName);
        formData.set("workplace_address", workplaceAddress);
        formData.set("workplace_access", workplaceAccess);
        formData.set("attire", "");
        formData.set("attire_type", attireType);
        formData.set("hair_style", hairStyle);
        formData.set("nearest_station", nearestStation);
        formData.set("location_notes", locationNotes);
        formData.set("salary_type", salaryType);
        formData.set("raise_info", raiseInfo);
        formData.set("bonus_info", bonusInfo);
        formData.set("commute_allowance", commuteAllowance);
        formData.set("job_category_detail", jobCategoryDetail);

        // 掲載期間
        if (publishedAt) formData.set("published_at", new Date(publishedAt).toISOString());
        if (expiresAt) formData.set("expires_at", new Date(expiresAt + "T23:59:59").toISOString());

        // 派遣専用フィールド
        if (job.type === "派遣" || job.type === "紹介予定派遣") {
            formData.set("client_company_name", clientCompanyName);
            formData.set("is_client_company_public", "false");
            formData.set("training_salary", trainingSalary);
            formData.set("training_period", trainingPeriod);
            formData.set("end_date", endDate);
            formData.set("actual_work_hours", actualWorkHours);
            formData.set("work_days_per_week", workDaysPerWeek);
            formData.set("nail_policy", nailPolicy);
            formData.set("shift_notes", shiftNotes);
            formData.set("general_notes", generalNotes);
            formData.set("welcome_requirements", welcomeRequirements);
        }

        // 正社員・契約社員専用フィールド
        if (job.type === "正社員" || job.type === "契約社員") {
            formData.set("company_name", companyName);
            formData.set("is_company_name_public", isCompanyNamePublic ? "true" : "false");
            formData.set("company_address", companyAddress);
            formData.set("industry", industry);
            formData.set("company_size", companySize);
            formData.set("established_date", establishedDate);
            formData.set("company_overview", companyOverview);
            formData.set("business_overview", businessOverview);
            if (annualSalaryMin) formData.set("annual_salary_min", annualSalaryMin);
            if (annualSalaryMax) formData.set("annual_salary_max", annualSalaryMax);
            formData.set("overtime_hours", overtimeHours);
            if (annualHolidays) formData.set("annual_holidays", annualHolidays);
            formData.set("probation_period", probationPeriod);
            formData.set("probation_details", probationDetails);
            formData.set("part_time_available", String(partTimeAvailable));
            formData.set("smoking_policy", smokingPolicy);
            formData.set("appeal_points", appealPoints);
            formData.set("welcome_requirements", welcomeRequirements);
            formData.set("department_details", departmentDetails);
            formData.set("recruitment_background", recruitmentBackground);
            formData.set("company_url", companyUrl);
            formData.set("education_training", educationTraining);
            formData.set("representative", representative);
            formData.set("capital", capital);
            formData.set("work_location_detail", workLocationDetail);
            formData.set("salary_detail", salaryDetail);
            formData.set("transfer_policy", transferPolicy);
            formData.set("salary_example", salaryExample);
            formData.set("bonus", bonus);
            formData.set("raise", raise);
            formData.set("annual_revenue", annualRevenue);
            formData.set("onboarding_process", onboardingProcess);
            formData.set("interview_location", interviewLocation);
            formData.set("salary_breakdown", salaryBreakdown);
            formData.set("shift_notes", shiftNotes);
        }

        const result = await updateJob(job.id, formData);
        setIsLoading(false);

        if (result?.error) {
            toast.error("求人の更新に失敗しました", {
                description: result.error,
            });
        } else {
            toast.success("求人を更新しました！", {
                description: "求人一覧ページに移動します",
            });
            router.push("/admin/jobs");
            router.refresh();
        }
    };

    const isDispatchJob = job.type === '派遣' || job.type === '紹介予定派遣';

    // AI抽出 → 差分プレビュー表示（直接上書きではなく選択的に適用）
    const handleReAnalyze = async (fileUrl: string) => {
        const mode = isDispatchJob ? 'anonymous' : 'standard';
        const loadingToast = toast.loading(`AIが${isDispatchJob ? '派遣' : '正社員'}求人として分析中です...`);
        try {
            const extractResult = await extractJobDataFromFile(fileUrl, mode, job.type);
            if (extractResult.error) throw new Error(extractResult.error);
            if (!extractResult.data) throw new Error("データの抽出に失敗しました");

            const { processedData } = await processExtractedJobData(extractResult.data);

            // 差分プレビュー用にデータをセット（直接上書きしない）
            const currentData = getCurrentFormData();
            const extractedData = flattenExtractedData(processedData);

            setPendingExtraction({ currentData, extractedData });
            toast.success("AI分析が完了しました", { id: loadingToast, description: "差分プレビューで確認してください" });

        } catch (error) {
            console.error(error);
            toast.error("分析エラー", { id: loadingToast, description: error instanceof Error ? error.message : "不明なエラー" });
        }
    };

    // AiExtractButtonからのコールバック（差分プレビュー表示）
    const handleAiExtracted = (data: ExtractedJobData) => {
        const currentData = getCurrentFormData();
        const extractedData = flattenExtractedData(data);
        setPendingExtraction({ currentData, extractedData });
    };

    return (
        <div className={`flex gap-6 ${previewFile && isPreviewLocked ? "flex-col lg:flex-row" : ""}`}>
            {/* PDFプレビューパネル */}
            {previewFile && isPreviewLocked && (
                <div className="w-full lg:w-1/2 lg:sticky lg:top-8 h-[60vh] lg:h-[calc(100vh-64px)] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xl flex flex-col mb-4 lg:mb-0">
                    <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Maximize2 className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-bold truncate">{previewFile.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={previewFile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-white rounded"
                                title="別タブで開く"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                                type="button"
                                className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-white rounded"
                                onClick={() => setIsPreviewLocked(false)}
                                title="プレビューを閉じる"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto bg-slate-400/20">
                        {previewFile.type.includes("pdf") ? (
                            <iframe
                                src={previewFile.url}
                                className="w-full h-full border-none"
                                title="PDF Preview"
                            />
                        ) : (
                            <div className="flex items-center justify-center p-4 min-h-full">
                                <div className="relative w-full h-auto min-h-[400px]">
                                    <Image
                                        src={previewFile.url}
                                        alt="Preview"
                                        fill
                                        className="object-contain rounded shadow-2xl bg-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={previewFile && isPreviewLocked ? "w-full lg:w-1/2" : "w-full"}>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">求人票・画像</label>
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-sm text-indigo-800 mb-2">
                            <p className="font-bold mb-1">AI再読み込み（差分プレビュー付き）</p>
                            <p className="text-xs">ファイルの「AI読込」ボタンまたは下の「AIで抽出」ボタンで、変更箇所を確認してから適用できます。</p>
                        </div>
                        <FileUploader
                            onFileSelect={(files) => setFiles(files)}
                            currentFiles={[
                                ...(job.job_attachments?.map(a => ({
                                    id: a.id,
                                    name: a.file_name,
                                    url: a.file_url,
                                    size: a.file_size
                                })) || []),
                                ...(job.pdf_url ? [{ id: "legacy_pdf", name: "Legacy PDF", url: job.pdf_url }] : [])
                            ]}
                            multiple={true}
                            onDeleteFile={async (fileId) => {
                                if (fileId === "legacy_pdf") {
                                    const result = await deleteLegacyJobFile(job.id);
                                    if (result?.error) {
                                        toast.error(result.error);
                                    } else {
                                        toast.success("ファイルを削除しました");
                                        router.refresh();
                                    }
                                } else {
                                    const result = await deleteJobFile(fileId);
                                    if (result?.error) {
                                        toast.error(result.error);
                                    } else {
                                        toast.success("ファイルを削除しました");
                                        router.refresh();
                                    }
                                }
                            }}
                            onAnalyzeFile={handleReAnalyze}
                            onPreviewFile={(file) => {
                                setPreviewFile(file);
                                setIsPreviewLocked(true);
                            }}
                            accept={{
                                "application/pdf": [".pdf"],
                                "image/jpeg": [".jpg", ".jpeg"],
                                "image/png": [".png"],
                            }}
                        />

                        {/* AiExtractButton: プレビューファイルがある場合に表示 */}
                        {previewFile && (
                            <div className="mt-3">
                                <AiExtractButton
                                    fileUrl={previewFile.url}
                                    fileName={previewFile.name}
                                    onExtracted={(data) => handleAiExtracted(data)}
                                    jobType={job.type}
                                />
                            </div>
                        )}
                    </div>

                    {/* AI抽出差分プレビュー */}
                    {pendingExtraction && (
                        <div className="my-4">
                            <AiExtractionPreview
                                currentData={pendingExtraction.currentData}
                                extractedData={pendingExtraction.extractedData}
                                onApply={handleApplyExtraction}
                                onCancel={() => setPendingExtraction(null)}
                            />
                        </div>
                    )}

                    {/* ===== 正社員：企業情報 ===== */}
                    {(job.type === "正社員" || job.type === "契約社員") && (
                        <FulltimeJobFields
                            companyName={companyName}
                            setCompanyName={setCompanyName}
                            companyAddress={companyAddress}
                            setCompanyAddress={setCompanyAddress}
                            companySize={companySize}
                            setCompanySize={setCompanySize}
                            establishedDate={establishedDate}
                            setEstablishedDate={setEstablishedDate}
                            companyOverview={companyOverview}
                            setCompanyOverview={setCompanyOverview}
                            businessOverview={businessOverview}
                            setBusinessOverview={setBusinessOverview}
                            annualSalaryMin={annualSalaryMin}
                            setAnnualSalaryMin={setAnnualSalaryMin}
                            annualSalaryMax={annualSalaryMax}
                            setAnnualSalaryMax={setAnnualSalaryMax}
                            overtimeHours={overtimeHours}
                            setOvertimeHours={setOvertimeHours}
                            annualHolidays={annualHolidays}
                            setAnnualHolidays={setAnnualHolidays}
                            probationPeriod={probationPeriod}
                            setProbationPeriod={setProbationPeriod}
                            probationDetails={probationDetails}
                            setProbationDetails={setProbationDetails}
                            partTimeAvailable={partTimeAvailable}
                            setPartTimeAvailable={setPartTimeAvailable}
                            smokingPolicy={smokingPolicy}
                            setSmokingPolicy={setSmokingPolicy}
                            appealPoints={appealPoints}
                            setAppealPoints={setAppealPoints}
                            departmentDetails={departmentDetails}
                            setDepartmentDetails={setDepartmentDetails}
                            recruitmentBackground={recruitmentBackground}
                            setRecruitmentBackground={setRecruitmentBackground}
                            companyUrl={companyUrl}
                            setCompanyUrl={setCompanyUrl}
                            isCompanyNamePublic={isCompanyNamePublic}
                            setIsCompanyNamePublic={setIsCompanyNamePublic}
                            educationTraining={educationTraining}
                            setEducationTraining={setEducationTraining}
                            representative={representative}
                            setRepresentative={setRepresentative}
                            capital={capital}
                            setCapital={setCapital}
                            workLocationDetail={workLocationDetail}
                            setWorkLocationDetail={setWorkLocationDetail}
                            salaryDetail={salaryDetail}
                            setSalaryDetail={setSalaryDetail}
                            transferPolicy={transferPolicy}
                            setTransferPolicy={setTransferPolicy}
                            salaryExample={salaryExample}
                            setSalaryExample={setSalaryExample}
                            bonus={bonus}
                            setBonus={setBonus}
                            raise={raise}
                            setRaise={setRaise}
                            annualRevenue={annualRevenue}
                            setAnnualRevenue={setAnnualRevenue}
                            onboardingProcess={onboardingProcess}
                            setOnboardingProcess={setOnboardingProcess}
                            interviewLocation={interviewLocation}
                            setInterviewLocation={setInterviewLocation}
                            salaryBreakdown={salaryBreakdown}
                            setSalaryBreakdown={setSalaryBreakdown}
                            commuteAllowance={commuteAllowance}
                            setCommuteAllowance={setCommuteAllowance}
                            shiftNotes={shiftNotes}
                            setShiftNotes={setShiftNotes}
                            workplaceName={workplaceName}
                            setWorkplaceName={setWorkplaceName}
                            workplaceAddress={workplaceAddress}
                            setWorkplaceAddress={setWorkplaceAddress}
                            workplaceAccess={workplaceAccess}
                            setWorkplaceAccess={setWorkplaceAccess}
                        >
                            {/* 求人タイトル・エリア（正社員入力フォーム内） */}
                            <div className="space-y-6">
                                <h5 className="text-sm font-bold text-blue-700 border-b border-blue-100 pb-2">求人タイトル・エリア</h5>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">お仕事ID（自動発行）</label>
                                        <input
                                            name="job_code"
                                            defaultValue={job.job_code}
                                            readOnly
                                            className="w-full h-12 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">求人タイトル</label>
                                        <input
                                            name="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">勤務地エリア</label>
                                    <MultiAreaSelect values={searchAreas} onChange={setSearchAreas} />
                                    <input type="hidden" name="area" value={area} required />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">雇用形態</label>
                                        <select
                                            name="type"
                                            defaultValue={job.type}
                                            required
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                        >
                                            <option value="派遣">派遣</option>
                                            <option value="正社員">正社員</option>
                                            <option value="紹介予定派遣">紹介予定派遣</option>
                                            <option value="契約社員">契約社員</option>
                                            <option value="アルバイト・パート">アルバイト・パート</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">職種カテゴリー</label>
                                        <select
                                            name="category"
                                            defaultValue={job.category}
                                            required
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                        >
                                            <option value="事務">事務</option>
                                            <option value="コールセンター">コールセンター</option>
                                            <option value="営業">営業</option>
                                            <option value="IT・エンジニア">IT・エンジニア</option>
                                            <option value="クリエイティブ">クリエイティブ</option>
                                            <option value="販売・接客">販売・接客</option>
                                            <option value="その他">その他</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">業種カテゴリー</label>
                                    <input
                                        name="industry"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="例：IT・情報通信 / 製造業 / 人材サービス"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">タグ</label>
                                    <TagSelector
                                        category="tags"
                                        value={tags}
                                        onChange={setTags}
                                        placeholder="タグを追加..."
                                    />
                                    <input type="hidden" name="tags" value={tags} />
                                </div>
                            </div>

                            {/* 仕事内容（正社員：タイトルセクション直後） */}
                            <div className="space-y-6">
                                <h5 className="text-sm font-bold text-blue-700 border-b border-blue-100 pb-2">仕事内容</h5>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">仕事内容</label>
                                    <textarea
                                        name="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={5}
                                        className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="詳しい業務内容を入力してください"
                                    />
                                </div>
                            </div>
                        </FulltimeJobFields>
                    )}

                    {/* ===== 求人タイトル・エリア（派遣用） ===== */}
                    {job.type !== "正社員" && job.type !== "契約社員" && (
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider">求人タイトル・エリア</h4>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">お仕事ID（自動発行）</label>
                                    <input
                                        name="job_code"
                                        defaultValue={job.job_code}
                                        readOnly
                                        className="w-full h-12 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">求人タイトル</label>
                                    <input
                                        name="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">勤務地エリア</label>
                                <MultiAreaSelect values={searchAreas} onChange={setSearchAreas} />
                                <input type="hidden" name="area" value={area} required />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">雇用形態</label>
                                    <select
                                        name="type"
                                        defaultValue={job.type}
                                        required
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                    >
                                        <option value="派遣">派遣</option>
                                        <option value="正社員">正社員</option>
                                        <option value="紹介予定派遣">紹介予定派遣</option>
                                        <option value="契約社員">契約社員</option>
                                        <option value="アルバイト・パート">アルバイト・パート</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">職種カテゴリー</label>
                                    <select
                                        name="category"
                                        defaultValue={job.category}
                                        required
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                    >
                                        <option value="事務">事務</option>
                                        <option value="コールセンター">コールセンター</option>
                                        <option value="営業">営業</option>
                                        <option value="IT・エンジニア">IT・エンジニア</option>
                                        <option value="クリエイティブ">クリエイティブ</option>
                                        <option value="販売・接客">販売・接客</option>
                                        <option value="その他">その他</option>
                                    </select>
                                </div>
                            </div>

                            {(job.type === "派遣" || job.type === "紹介予定派遣") && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">給与形態</label>
                                            <SalaryTypeSelector value={salaryType} onChange={setSalaryType} />
                                            <input type="hidden" name="salary_type" value={salaryType} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">給与</label>
                                        {salaryType === "月給制" ? (
                                            <MonthlySalarySelector value={salary} onChange={setSalary} />
                                        ) : salaryType === "時給制" ? (
                                            <HourlyWageInput value={salary} onChange={setSalary} />
                                        ) : (
                                            <SalaryInput value={salary} onChange={setSalary} />
                                        )}
                                        <input type="hidden" name="salary" value={salary} required />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">タグ</label>
                                <TagSelector
                                    category="tags"
                                    value={tags}
                                    onChange={setTags}
                                    placeholder="タグを追加..."
                                />
                                <input type="hidden" name="tags" value={tags} />
                            </div>
                        </div>
                    )}

                    {/* AI Refine Button */}
                    <div className="pt-2">
                        <ChatAIRefineDialog
                            jobType={job.type}
                            currentData={{
                                title,
                                area,
                                salary,
                                description,
                                requirements: requirements || "",
                                working_hours: workingHours,
                                holidays: holidays ? (holidays.startsWith('[') ? JSON.parse(holidays) : [holidays]) : [],
                                benefits: benefits ? (benefits.startsWith('[') ? JSON.parse(benefits) : [benefits]) : [],
                                selection_process: selectionProcess,
                                tags: tags ? (tags.startsWith('[') ? JSON.parse(tags) : [tags]) : [],
                                hourly_wage: hourlyWage ? Number(hourlyWage) : undefined,
                                salary_description: salaryDescription,
                                period,
                                start_date: startDate,
                                workplace_name: workplaceName,
                                workplace_address: workplaceAddress,
                                workplace_access: workplaceAccess,
                                attire_type: attireType,
                                hair_style: hairStyle,
                                nearest_station: nearestStation,
                                location_notes: locationNotes,
                                salary_type: salaryType,
                                raise_info: raiseInfo,
                                bonus_info: bonusInfo,
                                commute_allowance: commuteAllowance,
                                job_category_detail: jobCategoryDetail,
                            }}
                            onRefined={(data) => {
                                if (data.title) setTitle(data.title);
                                if (data.description) setDescription(data.description);
                                if (data.requirements) {
                                    const req = Array.isArray(data.requirements)
                                        ? data.requirements.join('\n')
                                        : String(data.requirements);
                                    setRequirements(req);
                                }
                                if (data.working_hours) setWorkingHours(data.working_hours);
                                if (data.holidays) {
                                    const hol = Array.isArray(data.holidays) ? data.holidays : [data.holidays];
                                    setHolidays(JSON.stringify(hol));
                                }
                                if (data.benefits) {
                                    const ben = Array.isArray(data.benefits) ? data.benefits : [data.benefits];
                                    setBenefits(JSON.stringify(ben));
                                }
                                if (data.selection_process) setSelectionProcess(data.selection_process);
                                if (data.tags) {
                                    const tag = Array.isArray(data.tags) ? data.tags : [data.tags];
                                    setTags(JSON.stringify(tag));
                                }
                                if (data.hourly_wage !== undefined) setHourlyWage(String(data.hourly_wage));
                                if (data.salary_description !== undefined) setSalaryDescription(data.salary_description);
                                if (data.period !== undefined) setPeriod(data.period);
                                if (data.start_date !== undefined) setStartDate(data.start_date);
                                if (data.workplace_name !== undefined) setWorkplaceName(data.workplace_name);
                                if (data.workplace_address !== undefined) setWorkplaceAddress(data.workplace_address);
                                if (data.workplace_access !== undefined) setWorkplaceAccess(data.workplace_access);
                                if (data.attire_type !== undefined) setAttireType(data.attire_type);
                                if (data.hair_style !== undefined) setHairStyle(data.hair_style);
                                if (data.nearest_station !== undefined) setNearestStation(data.nearest_station);
                                if (data.location_notes !== undefined) setLocationNotes(data.location_notes);
                                if (data.salary_type !== undefined) setSalaryType(data.salary_type);
                                if (data.raise_info !== undefined) setRaiseInfo(data.raise_info);
                                if (data.bonus_info !== undefined) setBonusInfo(data.bonus_info);
                                if (data.commute_allowance !== undefined) setCommuteAllowance(data.commute_allowance);
                                if (data.job_category_detail !== undefined) setJobCategoryDetail(data.job_category_detail);
                            }}
                        />
                    </div>

                    <div className="space-y-4 pt-6 border-t-2 border-green-100">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">募集内容</span>
                            <h3 className="font-bold text-lg text-slate-800">応募資格・勤務条件</h3>
                        </div>

                        {/* 仕事内容（派遣のみ：正社員はFulltimeJobFieldsのchildren内に表示済み） */}
                        {job.type !== "正社員" && job.type !== "契約社員" && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">仕事内容</label>
                                <textarea
                                    name="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="詳しい業務内容を入力してください"
                                />
                            </div>
                        )}

                        <div className="space-y-6 pt-4 border-t border-slate-100">
                            <h4 className="font-bold text-md text-slate-800">詳細条件</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">時給（検索用・数値のみ）</label>
                                    <input
                                        type="number"
                                        name="hourly_wage"
                                        value={hourlyWage}
                                        onChange={(e) => setHourlyWage(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="例：1400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">給与詳細</label>
                                    <textarea
                                        name="salary_description"
                                        value={salaryDescription}
                                        onChange={(e) => setSalaryDescription(e.target.value)}
                                        rows={2}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="例：交通費全額支給、昇給あり"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">詳細職種名</label>
                                <input
                                    name="job_category_detail"
                                    value={jobCategoryDetail}
                                    onChange={(e) => setJobCategoryDetail(e.target.value)}
                                    className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="例：化粧品・コスメ販売(店長・チーフ・サブ)"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">昇給情報</label>
                                    <input
                                        name="raise_info"
                                        value={raiseInfo}
                                        onChange={(e) => setRaiseInfo(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="例：昇給年1回"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">賞与情報</label>
                                    <input
                                        name="bonus_info"
                                        value={bonusInfo}
                                        onChange={(e) => setBonusInfo(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="例：賞与年2回 ※業績に準ずる"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">交通費</label>
                                    <input
                                        name="commute_allowance"
                                        value={commuteAllowance}
                                        onChange={(e) => setCommuteAllowance(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="例：一部支給 5万円/月"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">雇用期間</label>
                                    <input
                                        name="period"
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="例：長期（3ヶ月以上）"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">就業開始時期</label>
                                    <input
                                        name="start_date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="例：即日スタートOK"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 勤務地情報（派遣のみ。正社員はFulltimeJobFields内） */}
                        {(job.type === "派遣" || job.type === "紹介予定派遣") && (
                            <div className="space-y-6 pt-4 border-t border-slate-100">
                                <h4 className="font-bold text-md text-slate-800">勤務地情報</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">勤務先名称（表示用）</label>
                                        <input
                                            name="workplace_name"
                                            value={workplaceName}
                                            onChange={(e) => setWorkplaceName(e.target.value)}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="例：大手通信会社 本社"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">勤務住所</label>
                                    <input
                                        name="workplace_address"
                                        value={workplaceAddress}
                                        onChange={(e) => setWorkplaceAddress(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="例：東京都港区六本木1-1-1（本社と異なる場合）"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">最寄駅</label>
                                        <input
                                            name="nearest_station"
                                            value={nearestStation}
                                            onChange={(e) => setNearestStation(e.target.value)}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="例：札幌駅"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">勤務地備考</label>
                                        <input
                                            name="location_notes"
                                            value={locationNotes}
                                            onChange={(e) => setLocationNotes(e.target.value)}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="例：札幌駅徒歩5分以内"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">アクセス</label>
                                    <input
                                        name="workplace_access"
                                        value={workplaceAccess}
                                        onChange={(e) => setWorkplaceAccess(e.target.value)}
                                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="例：六本木一丁目駅直結 徒歩1分"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 mb-1 block">必須要件</label>
                            <textarea
                                name="requirements"
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                rows={5}
                                className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="求人票の応募資格・必須要件をそのまま記載してください"
                            />
                            <p className="text-xs text-slate-500">求人票に記載されている応募資格・必須条件を原文のまま入力してください。</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 mb-1 block">歓迎要件</label>
                            <textarea
                                name="welcome_requirements"
                                value={welcomeRequirements}
                                onChange={(e) => setWelcomeRequirements(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="歓迎するスキルや経験を記載してください"
                            />
                            <p className="text-xs text-slate-500">あれば歓迎するスキルや経験を入力してください。</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">勤務時間</label>
                            <TimePicker onSetTime={(v) => setWorkingHours(v)} />
                            <textarea
                                name="working_hours"
                                value={workingHours}
                                onChange={(e) => setWorkingHours(e.target.value)}
                                rows={2}
                                className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：9:00〜18:00（休憩1時間）"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 mb-1 block">休日・休暇</label>
                            <TagSelector
                                category="holidays"
                                value={holidays}
                                onChange={setHolidays}
                                placeholder="休日・休暇タグを追加..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 mb-1 block">福利厚生</label>
                            <TagSelector
                                category="benefits"
                                value={benefits}
                                onChange={setBenefits}
                                placeholder="福利厚生タグを追加..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">服装・髪型</label>
                            <AttireSelector
                                attireValue={attireType}
                                hairValue={hairStyle}
                                onAttireChange={setAttireType}
                                onHairChange={setHairStyle}
                            />
                            <input type="hidden" name="attire" value="" />
                            <input type="hidden" name="attire_type" value={attireType} />
                            <input type="hidden" name="hair_style" value={hairStyle} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">選考プロセス</label>
                            <SelectionProcessBuilder value={selectionProcess} onChange={setSelectionProcess} />
                            <textarea
                                name="selection_process"
                                value={selectionProcess}
                                onChange={(e) => setSelectionProcess(e.target.value)}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* 雇用形態別の専用フィールド */}
                    {(job.type === "派遣" || job.type === "紹介予定派遣") && (
                        <DispatchJobFields
                            clientCompanyName={clientCompanyName}
                            workplaceAddress={workplaceAddress}
                            setWorkplaceAddress={setWorkplaceAddress}
                            workplaceAccess={workplaceAccess}
                            setWorkplaceAccess={setWorkplaceAccess}
                            trainingSalary={trainingSalary}
                            setTrainingSalary={setTrainingSalary}
                            trainingPeriod={trainingPeriod}
                            setTrainingPeriod={setTrainingPeriod}
                            endDate={endDate}
                            setEndDate={setEndDate}
                            actualWorkHours={actualWorkHours}
                            setActualWorkHours={setActualWorkHours}
                            workDaysPerWeek={workDaysPerWeek}
                            setWorkDaysPerWeek={setWorkDaysPerWeek}
                            nailPolicy={nailPolicy}
                            setNailPolicy={setNailPolicy}
                            shiftNotes={shiftNotes}
                            setShiftNotes={setShiftNotes}
                            generalNotes={generalNotes}
                            setGeneralNotes={setGeneralNotes}
                        />
                    )}

                    {/* 掲載期間 */}
                    <div className="space-y-4 pt-6 border-t-2 border-amber-100">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">掲載管理</span>
                            <h3 className="font-bold text-lg text-slate-800">掲載期間</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">掲載開始日</label>
                                <input
                                    type="date"
                                    value={publishedAt}
                                    onChange={(e) => setPublishedAt(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">掲載終了日 <span className="text-xs font-normal text-slate-400">（空欄=無期限）</span></label>
                                <input
                                    type="date"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                {expiresAt && (
                                    <button
                                        type="button"
                                        onClick={() => setExpiresAt("")}
                                        className="text-xs text-slate-500 hover:text-red-500 transition-colors"
                                    >
                                        終了日をクリア（無期限に戻す）
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100">
                        <label className="text-sm font-bold text-slate-700">求人元（取引先）<span className="text-xs font-normal text-slate-500 ml-2">※非公開</span></label>
                        <ClientSelect name="client_id" defaultValue={job.client_id} />
                    </div>

                    <div className="pt-6 space-y-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPreviewModalOpen(true)}
                            className="w-full h-12 border-2 border-primary-300 text-primary-700 font-bold hover:bg-primary-50"
                        >
                            プレビューを確認
                        </Button>
                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold"
                            disabled={isLoading}
                        >
                            {isLoading ? "更新中..." : "求人を更新する"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Job Preview Modal */}
            <JobPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                data={{
                    title,
                    area,
                    salary,
                    type: job.type,
                    category: job.category,
                    tags: tags ? (tags.startsWith('[') ? JSON.parse(tags) : [tags]) : [],
                    description,
                    requirements,
                    workingHours,
                    holidays,
                    benefits,
                    selectionProcess,
                    hourly_wage: hourlyWage ? parseInt(hourlyWage) : undefined,
                    salary_description: salaryDescription,
                    period,
                    start_date: startDate,
                    workplace_name: workplaceName,
                    workplace_address: workplaceAddress,
                    workplace_access: workplaceAccess,
                    attire_type: attireType,
                    hair_style: hairStyle,
                    nearest_station: nearestStation,
                    // 派遣専用
                    client_company_name: clientCompanyName,
                    training_period: trainingPeriod,
                    training_salary: trainingSalary,
                    end_date: endDate,
                    actual_work_hours: actualWorkHours,
                    work_days_per_week: workDaysPerWeek,
                    nail_policy: nailPolicy,
                    shift_notes: shiftNotes,
                    general_notes: generalNotes,
                    // 正社員専用
                    company_name: companyName,
                    industry,
                    company_size: companySize,
                    company_overview: companyOverview,
                    annual_salary_min: annualSalaryMin,
                    annual_salary_max: annualSalaryMax,
                    overtime_hours: overtimeHours,
                    annual_holidays: annualHolidays,
                    probation_period: probationPeriod,
                    probation_details: probationDetails,
                    appeal_points: appealPoints,
                    welcome_requirements: welcomeRequirements,
                    // 正社員専用（追加フィールド）
                    business_overview: businessOverview,
                    salary_detail: salaryDetail,
                    recruitment_background: recruitmentBackground,
                    education_training: educationTraining,
                    department_details: departmentDetails,
                    work_location_detail: workLocationDetail,
                    transfer_policy: transferPolicy,
                    representative: representative,
                    capital: capital,
                    company_address: companyAddress,
                    company_url: companyUrl,
                    is_company_name_public: isCompanyNamePublic,
                    established_date: establishedDate,
                    smoking_policy: smokingPolicy,
                    part_time_available: partTimeAvailable,
                    salary_example: salaryExample,
                    bonus,
                    raise,
                    annual_revenue: annualRevenue,
                    onboarding_process: onboardingProcess,
                    interview_location: interviewLocation,
                    salary_breakdown: salaryBreakdown,
                }}
            />
        </div>
    );
}

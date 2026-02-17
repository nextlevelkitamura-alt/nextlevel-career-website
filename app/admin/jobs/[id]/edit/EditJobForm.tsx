"use client";

import { updateJob, deleteJobFile, deleteLegacyJobFile, extractJobDataFromFile, processExtractedJobData } from "../../../actions";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
    annual_holidays?: number | null;
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
    dispatch_job_details?: DispatchJobDetail[];
    fulltime_job_details?: FulltimeJobDetail[];
};

import FileUploader from "@/components/admin/FileUploader";
import ClientSelect from "@/components/admin/ClientSelect";

import TemplateSelect from "@/components/admin/TemplateSelect";
import TimePicker from "@/components/admin/TimePicker";
import AreaSelect from "@/components/admin/AreaSelect";
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

export default function EditJobForm({ job }: { job: Job }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    // Controlled inputs with initial values
    const [title, setTitle] = useState(job.title || "");
    const [area, setArea] = useState(job.area || "");
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

    // リレーションデータの参照
    const dd = job.dispatch_job_details?.[0];
    const fd = job.fulltime_job_details?.[0];

    // 派遣専用フィールド（DBから初期値読み込み）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [clientCompanyName, _setClientCompanyName] = useState(dd?.client_company_name || "");
    const [trainingSalary, setTrainingSalary] = useState(dd?.training_salary || "");
    const [trainingPeriod, setTrainingPeriod] = useState(dd?.training_period || "");
    const [endDate, setEndDate] = useState(dd?.end_date || "");
    const [actualWorkHours, setActualWorkHours] = useState(dd?.actual_work_hours || "");
    const [workDaysPerWeek, setWorkDaysPerWeek] = useState(dd?.work_days_per_week || "");
    const [nailPolicy, setNailPolicy] = useState(dd?.nail_policy || "");
    const [shiftNotes, setShiftNotes] = useState(dd?.shift_notes || "");
    const [generalNotes, setGeneralNotes] = useState(dd?.general_notes || "");

    // 正社員専用フィールド（DBから初期値読み込み）
    const [companyName, setCompanyName] = useState(fd?.company_name || "");
    const [companyAddress, setCompanyAddress] = useState(fd?.company_address || "");
    const [industry, setIndustry] = useState(fd?.industry || "");
    const [companySize, setCompanySize] = useState(fd?.company_size || "");
    const [establishedDate, setEstablishedDate] = useState(fd?.established_date || "");
    const [companyOverview, setCompanyOverview] = useState(fd?.company_overview || "");
    const [businessOverview, setBusinessOverview] = useState(fd?.business_overview || "");
    const [annualSalaryMin, setAnnualSalaryMin] = useState(fd?.annual_salary_min ? String(fd.annual_salary_min) : "");
    const [annualSalaryMax, setAnnualSalaryMax] = useState(fd?.annual_salary_max ? String(fd.annual_salary_max) : "");
    const [overtimeHours, setOvertimeHours] = useState(fd?.overtime_hours || "");
    const [annualHolidays, setAnnualHolidays] = useState(fd?.annual_holidays ? String(fd.annual_holidays) : "");
    const [probationPeriod, setProbationPeriod] = useState(fd?.probation_period || "");
    const [probationDetails, setProbationDetails] = useState(fd?.probation_details || "");
    const [partTimeAvailable, setPartTimeAvailable] = useState(fd?.part_time_available || false);
    const [smokingPolicy, setSmokingPolicy] = useState(fd?.smoking_policy || "");
    const [appealPoints, setAppealPoints] = useState(fd?.appeal_points || "");
    const [welcomeRequirements, setWelcomeRequirements] = useState(fd?.welcome_requirements || "");
    const [departmentDetails, setDepartmentDetails] = useState(fd?.department_details || "");
    const [isCompanyNamePublic, setIsCompanyNamePublic] = useState(fd?.is_company_name_public !== false);
    const [recruitmentBackground, setRecruitmentBackground] = useState(fd?.recruitment_background || "");
    const [companyUrl, setCompanyUrl] = useState(fd?.company_url || "");
    const [educationTraining, setEducationTraining] = useState(fd?.education_training || "");
    const [representative, setRepresentative] = useState(fd?.representative || "");
    const [capital, setCapital] = useState(fd?.capital || "");
    const [workLocationDetail, setWorkLocationDetail] = useState(fd?.work_location_detail || "");
    const [salaryDetail, setSalaryDetail] = useState(fd?.salary_detail || "");
    const [transferPolicy, setTransferPolicy] = useState(fd?.transfer_policy || "");

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
        formData.set("salary", salary);
        formData.set("description", description);
        formData.set("requirements", requirements);
        formData.set("working_hours", workingHours);
        formData.set("holidays", holidays);
        formData.set("benefits", benefits);
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
        }

        // 正社員専用フィールド
        if (job.type === "正社員") {
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

    const handleReAnalyze = async (fileUrl: string) => {
        const mode = isDispatchJob ? 'anonymous' : 'standard';
        const loadingToast = toast.loading(`AIが${isDispatchJob ? '派遣' : '正社員'}求人として分析中です...`);
        try {
            // 1. Extract (派遣=anonymous, 正社員=standard)
            const extractResult = await extractJobDataFromFile(fileUrl, mode, job.type);
            if (extractResult.error) throw new Error(extractResult.error);
            if (!extractResult.data) throw new Error("データの抽出に失敗しました");

            // 2. Process
            const { processedData } = await processExtractedJobData(extractResult.data);

            // 3. Update State
            if (processedData.title) setTitle(processedData.title);
            if (processedData.area) setArea(processedData.area);
            if (processedData.salary) setSalary(processedData.salary);
            if (processedData.description) setDescription(processedData.description);
            if (processedData.working_hours) setWorkingHours(processedData.working_hours);
            if (processedData.selection_process) setSelectionProcess(processedData.selection_process);

            // Tags (Array to JSON/String)
            if (processedData.tags) {
                // Merge or replace? Let's replace as it's a re-analysis
                setTags(JSON.stringify(processedData.tags));
            }
            if (processedData.requirements && Array.isArray(processedData.requirements)) {
                // requirements input expects comma separated string in this form? 
                // Wait, EditJobForm uses "TagSelector" which might expect JSON string IF category is provided?
                // Looking at render: <TagSelector category="requirements" value={requirements} ... />
                // TagSelector: if category is present, it likely handles arrays?
                // But the state `requirements` is initialized as string.
                // Let's check `createJob` logic.
                // In `createJob`, `requirements` is `formData.get("requirements") as string`.
                // In `TagSelector`, let's check its behavior.
                // It likely serializes to JSON string if it's a tag selector.
                // BUT `requirements`, `holidays`, `benefits` in DB are usually TEXT or JSON?
                // In Supabase `jobs` table schema (implied):
                // `job.requirements` is string (from `job.requirements || ""`).
                // `TagSelector` likely takes a string (JSON or comma) and returns a string (JSON).
                // So I should JSON.stringify the array.
                setRequirements(JSON.stringify(processedData.requirements));
            } else if (processedData.requirements) {
                // Fallback if string
                setRequirements(String(processedData.requirements));
            }

            if (processedData.holidays) setHolidays(JSON.stringify(processedData.holidays));
            if (processedData.benefits) setBenefits(JSON.stringify(processedData.benefits));

            // 拡張フィールド
            if (processedData.hourly_wage) setHourlyWage(String(processedData.hourly_wage));
            if (processedData.salary_description) setSalaryDescription(processedData.salary_description);
            if (processedData.period) setPeriod(processedData.period);
            if (processedData.start_date) setStartDate(processedData.start_date);
            if (processedData.workplace_address) setWorkplaceAddress(processedData.workplace_address);
            if (processedData.workplace_access) setWorkplaceAccess(processedData.workplace_access);
            if (processedData.nearest_station) setNearestStation(processedData.nearest_station);
            if (processedData.location_notes) setLocationNotes(processedData.location_notes);
            if (processedData.attire_type) setAttireType(processedData.attire_type);
            if (processedData.hair_style) setHairStyle(processedData.hair_style);
            if (processedData.salary_type) setSalaryType(processedData.salary_type);
            if (processedData.job_category_detail) setJobCategoryDetail(processedData.job_category_detail);

            // 派遣専用フィールド
            if (isDispatchJob) {
                if (processedData.training_period) setTrainingPeriod(processedData.training_period);
                if (processedData.training_salary) setTrainingSalary(processedData.training_salary);
                if (processedData.end_date) setEndDate(processedData.end_date);
                if (processedData.actual_work_hours) setActualWorkHours(String(processedData.actual_work_hours));
                if (processedData.work_days_per_week) setWorkDaysPerWeek(String(processedData.work_days_per_week));
                if (processedData.nail_policy) setNailPolicy(processedData.nail_policy);
                if (processedData.shift_notes) setShiftNotes(processedData.shift_notes);
                if (processedData.general_notes) setGeneralNotes(processedData.general_notes);
            }

            // 正社員専用フィールド
            if (!isDispatchJob) {
                if (processedData.company_name) setCompanyName(processedData.company_name);
                if (processedData.industry) setIndustry(processedData.industry);
                if (processedData.company_overview) setCompanyOverview(processedData.company_overview);
                if (processedData.company_size) setCompanySize(processedData.company_size);
                if (processedData.annual_salary_min) setAnnualSalaryMin(String(processedData.annual_salary_min));
                if (processedData.annual_salary_max) setAnnualSalaryMax(String(processedData.annual_salary_max));
                if (processedData.overtime_hours) setOvertimeHours(processedData.overtime_hours);
                if (processedData.annual_holidays) setAnnualHolidays(String(processedData.annual_holidays));
                if (processedData.probation_period) setProbationPeriod(processedData.probation_period);
                if (processedData.probation_details) setProbationDetails(processedData.probation_details);
                if (processedData.appeal_points) setAppealPoints(processedData.appeal_points);
                if (processedData.welcome_requirements) setWelcomeRequirements(processedData.welcome_requirements);
                if (processedData.education_training) setEducationTraining(processedData.education_training);
                if (processedData.representative) setRepresentative(processedData.representative);
                if (processedData.capital) setCapital(processedData.capital);
                if (processedData.work_location_detail) setWorkLocationDetail(processedData.work_location_detail);
                if (processedData.salary_detail) setSalaryDetail(processedData.salary_detail);
                if (processedData.transfer_policy) setTransferPolicy(processedData.transfer_policy);
            }

            toast.success("AI分析が完了しました", { id: loadingToast, description: "フォームの内容を更新しました" });

        } catch (error) {
            console.error(error);
            toast.error("分析エラー", { id: loadingToast, description: error instanceof Error ? error.message : "不明なエラー" });
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
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
                <label className="text-sm font-bold text-slate-700">求人票・画像</label>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-orange-800 mb-2">
                    <p className="font-bold mb-1">💡 NEW: 登録済みファイルからAI再読み込みが可能になりました</p>
                    <p className="text-xs">ファイルリストの「AI読込」ボタンを押すと、そのファイルの内容で現在の入力フォームを上書きします。</p>
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
                    accept={{
                        "application/pdf": [".pdf"],
                        "image/jpeg": [".jpg", ".jpeg"],
                        "image/png": [".png"],
                    }}
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">エリア</label>
                    <AreaSelect value={area} onChange={setArea} />
                    <input type="hidden" name="area" value={area} required />
                </div>
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
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">給与形態</label>
                        <SalaryTypeSelector value={salaryType} onChange={setSalaryType} />
                        <input type="hidden" name="salary_type" value={salaryType} />
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

            {/* AI Refine Button */}
            <div className="pt-2">
                <ChatAIRefineDialog
                    jobType={job.type}
                    currentData={{
                        title,
                        area,
                        salary,
                        description,
                        requirements: requirements ? (requirements.startsWith('[') ? JSON.parse(requirements) : requirements.split(' ')) : [],
                        working_hours: workingHours,
                        holidays: holidays ? (holidays.startsWith('[') ? JSON.parse(holidays) : holidays.split(' ')) : [],
                        benefits: benefits ? (benefits.startsWith('[') ? JSON.parse(benefits) : benefits.split(' ')) : [],
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
                            const req = Array.isArray(data.requirements) ? data.requirements : [data.requirements];
                            setRequirements(JSON.stringify(req));
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

            <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-lg text-slate-800">詳細情報</h3>

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

                <div className="space-y-6 pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-md text-slate-800">勤務先情報</h4>
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
                        <label className="text-sm font-bold text-slate-700">勤務地住所</label>
                        <input
                            name="workplace_address"
                            value={workplaceAddress}
                            onChange={(e) => setWorkplaceAddress(e.target.value)}
                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：東京都港区六本木1-1-1"
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
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 mb-1 block">応募資格・条件</label>
                    <TagSelector
                        category="requirements"
                        value={requirements}
                        onChange={setRequirements}
                        placeholder="応募資格タグを追加..."
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-bold text-slate-700">勤務時間</label>
                        <TemplateSelect category="working_hours" onSelect={(v) => setWorkingHours(v)} />
                    </div>
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
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-bold text-slate-700">選考プロセス</label>
                        <TemplateSelect category="selection_process" onSelect={(v) => setSelectionProcess(v)} />
                    </div>
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

            {job.type === "正社員" && (
                <FulltimeJobFields
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    companyAddress={companyAddress}
                    setCompanyAddress={setCompanyAddress}
                    industry={industry}
                    setIndustry={setIndustry}
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
                    welcomeRequirements={welcomeRequirements}
                    setWelcomeRequirements={setWelcomeRequirements}
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
                />
            )}

            <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700">求人元（取引先）<span className="text-xs font-normal text-slate-500 ml-2">※非公開</span></label>
                <ClientSelect name="client_id" defaultValue={job.client_id} />
            </div>

            <div className="pt-4">
                <Button
                    type="submit"
                    className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold"
                    disabled={isLoading}
                >
                    {isLoading ? "更新中..." : "求人を更新する"}
                </Button>
            </div>
        </form >
    );
}

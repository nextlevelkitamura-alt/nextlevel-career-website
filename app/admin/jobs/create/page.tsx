"use client";

import { createJob, getDraftFiles } from "../../actions";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ExternalLink, Maximize2, X } from "lucide-react";
import { toast } from "sonner";

import FileUploader from "@/components/admin/FileUploader";
import ClientSelect from "@/components/admin/ClientSelect";
import TimePicker from "@/components/admin/TimePicker";
import MultiAreaSelect from "@/components/admin/MultiAreaSelect";
import SalaryInput from "@/components/admin/SalaryInput";
import SalaryTypeSelector from "@/components/admin/SalaryTypeSelector";
import MonthlySalarySelector from "@/components/admin/MonthlySalarySelector";
import HourlyWageInput from "@/components/admin/HourlyWageInput";
import AttireSelector from "@/components/admin/AttireSelector";
import CategorySelect from "@/components/admin/CategorySelect";
import SelectionProcessBuilder from "@/components/admin/SelectionProcessBuilder";
import DraftFileSelector from "@/components/admin/DraftFileSelector";
import TagSelector from "@/components/admin/TagSelector";
import JobPreviewModal from "@/components/admin/JobPreviewModal";
import AiExtractButton from "@/components/admin/AiExtractButton";
import AiExtractionPreview from "@/components/admin/AiExtractionPreview";
import ChatAIRefineDialog from "@/components/admin/ChatAIRefineDialog";
import DispatchJobFields from "@/components/admin/DispatchJobFields";
import FulltimeJobFields from "@/components/admin/FulltimeJobFields";
import { ExtractedJobData, TagMatchResult } from "../../actions";

export default function CreateJobPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftId = searchParams.get("draft_id");

    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>(draftId ? [draftId] : []);

    // Preview state
    const [previewFile, setPreviewFile] = useState<{ url: string, type: string, name: string } | null>(null);
    const [isPreviewLocked, setIsPreviewLocked] = useState(true);

    // Controlled inputs for template insertion
    const [title, setTitle] = useState("");
    const [searchAreas, setSearchAreas] = useState<string[]>([""]);
    const [areaStations, setAreaStations] = useState<string[]>([]);
    const area = searchAreas[0] || "";
    const [salary, setSalary] = useState("");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [workingHours, setWorkingHours] = useState("");
    const [holidays, setHolidays] = useState("");
    const [benefits, setBenefits] = useState("");
    const [selectionProcess, setSelectionProcess] = useState("");
    const [jobType, setJobType] = useState("派遣");
    const [category, setCategory] = useState("事務");
    const [tags, setTags] = useState("");
    const [salaryType, setSalaryType] = useState("");

    // Expanded fields (共通)
    const [commuteAllowance, setCommuteAllowance] = useState("");
    const [hourlyWage, setHourlyWage] = useState("");
    const [salaryDescription, setSalaryDescription] = useState("");
    const [period, setPeriod] = useState("");
    const [startDate, setStartDate] = useState("");
    const [workplaceName, setWorkplaceName] = useState("");
    const [workplaceAddress, setWorkplaceAddress] = useState("");
    const [workplaceAccess, setWorkplaceAccess] = useState("");
    const [attireType, setAttireType] = useState("");
    const [hairStyle, setHairStyle] = useState("");
    const [nearestStation, setNearestStation] = useState("");
    const [locationNotes, setLocationNotes] = useState("");
    const [jobCategoryDetail, setJobCategoryDetail] = useState("");

    // 派遣専用フィールド
    const [clientCompanyName, setClientCompanyName] = useState("");
    const [trainingSalary, setTrainingSalary] = useState("");
    const [trainingPeriod, setTrainingPeriod] = useState("");
    const [endDate, setEndDate] = useState("");
    const [actualWorkHours, setActualWorkHours] = useState("");
    const [workDaysPerWeek, setWorkDaysPerWeek] = useState("");
    const [nailPolicy, setNailPolicy] = useState("");
    const [shiftNotes, setShiftNotes] = useState("");
    const [generalNotes, setGeneralNotes] = useState("");

    // 正社員専用フィールド
    const [companyName, setCompanyName] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [industry, setIndustry] = useState("");
    const [companySize, setCompanySize] = useState("");
    const [establishedDate, setEstablishedDate] = useState("");
    const [companyOverview, setCompanyOverview] = useState("");
    const [businessOverview, setBusinessOverview] = useState("");
    const [annualSalaryMin, setAnnualSalaryMin] = useState("");
    const [annualSalaryMax, setAnnualSalaryMax] = useState("");
    const [overtimeHours, setOvertimeHours] = useState("");
    const [annualHolidays, setAnnualHolidays] = useState("");
    const [probationPeriod, setProbationPeriod] = useState("");
    const [probationDetails, setProbationDetails] = useState("");
    const [partTimeAvailable, setPartTimeAvailable] = useState(false);
    const [smokingPolicy, setSmokingPolicy] = useState("");
    const [appealPoints, setAppealPoints] = useState("");
    const [welcomeRequirements, setWelcomeRequirements] = useState("");
    const [departmentDetails, setDepartmentDetails] = useState("");
    const [isCompanyNamePublic, setIsCompanyNamePublic] = useState(true);
    const [recruitmentBackground, setRecruitmentBackground] = useState("");
    const [companyUrl, setCompanyUrl] = useState("");
    const [educationTraining, setEducationTraining] = useState("");
    const [representative, setRepresentative] = useState("");
    const [capital, setCapital] = useState("");
    const [workLocationDetail, setWorkLocationDetail] = useState("");
    const [salaryDetail, setSalaryDetail] = useState("");
    const [transferPolicy, setTransferPolicy] = useState("");
    // エン転職対応追加フィールド
    const [salaryExample, setSalaryExample] = useState("");
    const [bonus, setBonus] = useState("");
    const [raise, setRaise] = useState("");
    const [annualRevenue, setAnnualRevenue] = useState("");
    const [onboardingProcess, setOnboardingProcess] = useState("");
    const [interviewLocation, setInterviewLocation] = useState("");
    const [salaryBreakdown, setSalaryBreakdown] = useState("");

    // 掲載期間
    const [publishedAt, setPublishedAt] = useState(new Date().toISOString().split('T')[0]);
    const [expiresAt, setExpiresAt] = useState("");

    // Job Preview Modal
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // AI抽出差分プレビュー用state
    const [pendingExtraction, setPendingExtraction] = useState<{
        currentData: Record<string, unknown>;
        extractedData: Record<string, unknown>;
        extractionMode?: 'standard' | 'anonymous';
    } | null>(null);

    // 現在のフォーム値を取得
    const getCurrentFormData = (): Record<string, unknown> => {
        const data: Record<string, unknown> = {
            title, area, salary, description, requirements,
            working_hours: workingHours, selection_process: selectionProcess,
            type: jobType, category,
            tags: tags ? (tags.startsWith('[') ? JSON.parse(tags) : tags) : "",
            hourly_wage: hourlyWage ? Number(hourlyWage) : "",
            salary_description: salaryDescription, salary_type: salaryType,
            period, start_date: startDate,
            workplace_name: workplaceName, workplace_address: workplaceAddress,
            workplace_access: workplaceAccess, nearest_station: nearestStation,
            location_notes: locationNotes, attire_type: attireType,
            hair_style: hairStyle, job_category_detail: jobCategoryDetail,
            commute_allowance: commuteAllowance,
            welcome_requirements: welcomeRequirements, shift_notes: shiftNotes,
        };
        try { data.holidays = holidays ? (holidays.startsWith('[') ? JSON.parse(holidays) : [holidays]) : []; } catch { data.holidays = holidays ? [holidays] : []; }
        try { data.benefits = benefits ? (benefits.startsWith('[') ? JSON.parse(benefits) : [benefits]) : []; } catch { data.benefits = benefits ? [benefits] : []; }

        const isDispatch = jobType === '派遣' || jobType === '紹介予定派遣';
        if (isDispatch) {
            Object.assign(data, {
                client_company_name: clientCompanyName, training_salary: trainingSalary,
                training_period: trainingPeriod, end_date: endDate,
                actual_work_hours: actualWorkHours, work_days_per_week: workDaysPerWeek,
                nail_policy: nailPolicy, general_notes: generalNotes,
            });
        } else {
            Object.assign(data, {
                company_name: companyName, company_address: companyAddress,
                industry, company_size: companySize, established_date: establishedDate,
                company_overview: companyOverview, business_overview: businessOverview,
                annual_salary_min: annualSalaryMin ? Number(annualSalaryMin) : "",
                annual_salary_max: annualSalaryMax ? Number(annualSalaryMax) : "",
                overtime_hours: overtimeHours, annual_holidays: annualHolidays,
                probation_period: probationPeriod, probation_details: probationDetails,
                smoking_policy: smokingPolicy, appeal_points: appealPoints,
                department_details: departmentDetails, recruitment_background: recruitmentBackground,
                company_url: companyUrl, education_training: educationTraining,
                representative, capital, work_location_detail: workLocationDetail,
                salary_detail: salaryDetail, transfer_policy: transferPolicy,
                salary_example: salaryExample, bonus, raise,
                annual_revenue: annualRevenue, onboarding_process: onboardingProcess,
                interview_location: interviewLocation, salary_breakdown: salaryBreakdown,
            });
        }
        return data;
    };

    // AI抽出データをフラット化
    const flattenExtractedForCreate = (data: ExtractedJobData, matchResults: {
        holidays: TagMatchResult[];
        benefits: TagMatchResult[];
    }): Record<string, unknown> => {
        const flat: Record<string, unknown> = {};

        if (data.title) flat.title = data.title;
        if (data.area) flat.area = data.area;
        if (data.search_areas) flat.search_areas = data.search_areas;
        if (data.description) flat.description = data.description;
        if (data.working_hours) flat.working_hours = data.working_hours;
        if (data.selection_process) flat.selection_process = data.selection_process;
        if (data.type) flat.type = data.type;
        if (data.category) flat.category = data.category;
        if (data.tags) flat.tags = data.tags;
        if (data.requirements) flat.requirements = Array.isArray(data.requirements) ? data.requirements.join('\n') : data.requirements;
        if (data.welcome_requirements) flat.welcome_requirements = Array.isArray(data.welcome_requirements) ? data.welcome_requirements.join('\n') : data.welcome_requirements;
        if (data.period) flat.period = data.period;
        if (data.start_date) flat.start_date = data.start_date;
        if (data.workplace_name) flat.workplace_name = data.workplace_name;
        if (data.workplace_address) flat.workplace_address = data.workplace_address;
        if (data.workplace_access) flat.workplace_access = data.workplace_access;
        if (data.attire_type) flat.attire_type = data.attire_type;
        if (data.hair_style) flat.hair_style = data.hair_style;
        if (data.nearest_station) flat.nearest_station = data.nearest_station;
        if (data.location_notes) flat.location_notes = data.location_notes;
        if (data.job_category_detail) flat.job_category_detail = data.job_category_detail;
        if (data.shift_notes) flat.shift_notes = data.shift_notes;

        // タグマッチ済みのholidays/benefits
        const matchedHolidays = matchResults.holidays.map(h => h.option?.value || h.original);
        if (matchedHolidays.length > 0) flat.holidays = matchedHolidays;
        const matchedBenefits = matchResults.benefits.map(b => b.option?.value || b.original);
        if (matchedBenefits.length > 0) flat.benefits = matchedBenefits;

        // 給与関連
        const isFulltime = data.type === "正社員" || data.type === "契約社員";
        if (!isFulltime) {
            if (data.salary) flat.salary = data.salary;
            if (data.salary_type) flat.salary_type = data.salary_type;
            if (data.hourly_wage) flat.hourly_wage = data.hourly_wage;
            if (data.salary_description) flat.salary_description = data.salary_description;
        }

        // 派遣専用
        if (data.client_company_name) flat.client_company_name = data.client_company_name;
        if (data.training_period) flat.training_period = data.training_period;
        if (data.training_salary) flat.training_salary = data.training_salary;
        if (data.actual_work_hours) flat.actual_work_hours = data.actual_work_hours;
        if (data.work_days_per_week) flat.work_days_per_week = data.work_days_per_week;
        if (data.end_date) flat.end_date = data.end_date;
        if (data.nail_policy) flat.nail_policy = data.nail_policy;
        if (data.general_notes) flat.general_notes = data.general_notes;

        // 正社員専用
        if (data.company_name) flat.company_name = data.company_name;
        if (data.industry) flat.industry = data.industry;
        if (data.company_overview) flat.company_overview = data.company_overview;
        if (data.business_overview) flat.business_overview = data.business_overview;
        if (data.company_size) flat.company_size = data.company_size;
        if (data.established_date) flat.established_date = data.established_date;
        if (data.company_address) flat.company_address = data.company_address;
        if (data.annual_salary_min) flat.annual_salary_min = data.annual_salary_min;
        if (data.annual_salary_max) flat.annual_salary_max = data.annual_salary_max;
        if (data.overtime_hours) flat.overtime_hours = data.overtime_hours;
        if (data.annual_holidays) flat.annual_holidays = String(data.annual_holidays);
        if (data.probation_period) flat.probation_period = data.probation_period;
        if (data.probation_details) flat.probation_details = data.probation_details;
        if (data.smoking_policy) flat.smoking_policy = data.smoking_policy;
        if (data.appeal_points) flat.appeal_points = data.appeal_points;
        if (data.department_details) flat.department_details = data.department_details;
        if (data.recruitment_background) flat.recruitment_background = data.recruitment_background;
        if (data.company_url) flat.company_url = data.company_url;
        if (data.education_training) flat.education_training = data.education_training;
        if (data.representative) flat.representative = data.representative;
        if (data.capital) flat.capital = data.capital;
        if (data.work_location_detail) flat.work_location_detail = data.work_location_detail;
        if (data.salary_detail) flat.salary_detail = data.salary_detail;
        if (data.transfer_policy) flat.transfer_policy = data.transfer_policy;
        if (data.salary_example) flat.salary_example = data.salary_example;
        if (data.salary_breakdown) flat.salary_breakdown = data.salary_breakdown;
        if (data.annual_revenue) flat.annual_revenue = data.annual_revenue;
        if (data.onboarding_process) flat.onboarding_process = data.onboarding_process;
        if (data.interview_location) flat.interview_location = data.interview_location;
        if (data.raise_info) flat.raise = data.raise_info;
        if (data.bonus_info) flat.bonus = data.bonus_info;
        if (data.commute_allowance) flat.commute_allowance = data.commute_allowance;

        return flat;
    };

    // AI抽出結果の適用（選択されたフィールドのみ）
    const handleApplyExtraction = (selectedFields: string[]) => {
        if (!pendingExtraction) return;
        const { extractedData, extractionMode } = pendingExtraction;

        // モード設定
        if (extractionMode === 'anonymous') setIsCompanyNamePublic(false);
        else if (extractionMode === 'standard') setIsCompanyNamePublic(true);

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
                case "type": setJobType(str); break;
                case "category": setCategory(str); break;
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
                case "commute_allowance": setCommuteAllowance(str); break;
                case "shift_notes": setShiftNotes(str); break;
                // 派遣
                case "client_company_name": setClientCompanyName(str); break;
                case "training_salary": setTrainingSalary(str); break;
                case "training_period": setTrainingPeriod(str); break;
                case "end_date": setEndDate(str); break;
                case "actual_work_hours": setActualWorkHours(str); break;
                case "work_days_per_week": setWorkDaysPerWeek(str); break;
                case "nail_policy": setNailPolicy(str); break;
                case "general_notes": setGeneralNotes(str); break;
                // 正社員
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
                case "raise": setRaise(str); break;
                case "bonus": setBonus(str); break;
                case "part_time_available": setPartTimeAvailable(value === true || value === "true"); break;
            }
        }

        setPendingExtraction(null);
        toast.success(`${selectedFields.length}件のフィールドを適用しました`);
    };

    // AI Extraction handler → 差分プレビュー表示
    const handleAiExtracted = (data: ExtractedJobData, matchResults: {
        requirements: TagMatchResult[];
        welcomeRequirements: TagMatchResult[];
        holidays: TagMatchResult[];
        benefits: TagMatchResult[];
    }, options?: { mode: 'standard' | 'anonymous' }) => {
        const currentData = getCurrentFormData();
        const extractedData = flattenExtractedForCreate(data, matchResults);

        setPendingExtraction({
            currentData,
            extractedData,
            extractionMode: options?.mode,
        });
    };

    // Fetch draft file info if draft_id is provided
    useEffect(() => {
        const saved = localStorage.getItem("lastJobType");
        if (saved) setJobType(saved);
    }, []);

    useEffect(() => {
        if (draftId) {
            const fetchDraftInfo = async () => {
                try {
                    const drafts = await getDraftFiles();
                    const draft = drafts.find(d => d.id === draftId);
                    if (draft) {
                        setPreviewFile({
                            url: draft.file_url,
                            type: draft.file_type || "",
                            name: draft.file_name
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch draft info", error);
                }
            };
            fetchDraftInfo();
        }
    }, [draftId]);

    const handleDraftSelectionChange = (ids: string[]) => {
        setSelectedDraftIds(ids);
    };

    const handleFilePreview = (file: { url: string; type: string; name: string } | null) => {
        setPreviewFile(file);
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);

        if (files.length > 0) {
            files.forEach(file => {
                formData.append("pdf_files", file);
            });
        }

        // Append pre-registered file IDs
        selectedDraftIds.forEach(id => {
            formData.append("draft_file_ids", id);
        });

        // Append controlled values
        formData.set("title", title);
        formData.set("area", area);
        formData.set("search_areas", JSON.stringify(searchAreas.filter(Boolean)));
        formData.set("area_stations", JSON.stringify(areaStations));
        // 正社員：salaryを年収min/maxから自動生成（未設定の場合は既存salaryを保持）
        if (jobType === "正社員" || jobType === "契約社員") {
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
        formData.set("commute_allowance", commuteAllowance);
        formData.set("period", period);
        formData.set("start_date", startDate);
        formData.set("workplace_name", workplaceName);
        formData.set("workplace_address", workplaceAddress);
        formData.set("workplace_access", workplaceAccess);
        formData.set("attire", "");
        formData.set("attire_type", attireType);
        formData.set("hair_style", hairStyle);
        formData.set("salary_type", salaryType);
        formData.set("nearest_station", nearestStation);
        formData.set("location_notes", locationNotes);
        formData.set("job_category_detail", jobCategoryDetail);

        // 掲載期間
        if (publishedAt) formData.set("published_at", new Date(publishedAt).toISOString());
        if (expiresAt) formData.set("expires_at", new Date(expiresAt + "T23:59:59").toISOString());

        // 派遣専用フィールド
        if (jobType === "派遣" || jobType === "紹介予定派遣") {
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
        if (jobType === "正社員" || jobType === "契約社員") {
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

        const result = await createJob(formData);
        setIsLoading(false);

        if (result?.error) {
            toast.error("求人登録に失敗しました", {
                description: result.error,
            });
        } else {
            toast.success("求人を登録しました！", {
                description: "求人一覧ページに移動します",
            });
            router.push("/admin/jobs");
        }
    };

    return (
        <div className={`p-4 ${previewFile && isPreviewLocked ? "max-w-[1600px] mx-auto" : "max-w-4xl mx-auto"}`}>
            <div className={`flex flex-col ${previewFile && isPreviewLocked ? "lg:flex-row gap-8" : ""}`}>
                {/* Split View: Left Side Preview */}
                {previewFile && isPreviewLocked && (
                    <div className="w-full lg:w-1/2 lg:sticky lg:top-8 h-[60vh] lg:h-[calc(100vh-64px)] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xl flex flex-col mb-8 lg:mb-0">
                        <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center bg-opacity-95 backdrop-blur-md">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center flex-shrink-0">
                                    <Maximize2 className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-bold truncate">{previewFile.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                    onClick={() => setIsPreviewLocked(false)}
                                    title="プレビューを閉じる"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
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
                                <div className="flex items-center justify-center p-8 min-h-full">
                                    <div className="relative w-full h-auto min-h-[500px]">
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

                <div className={`flex-1 ${previewFile && isPreviewLocked ? "" : "w-full max-w-2xl mx-auto"}`}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">求人新規作成</h1>
                            <p className="text-sm text-slate-500 mt-1">求人内容を入力して公開してください</p>
                        </div>
                        <div className="flex gap-2">
                            {previewFile && !isPreviewLocked && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPreviewLocked(true)}
                                    className="border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100"
                                >
                                    <Maximize2 className="w-4 h-4 mr-2" />
                                    プレビューを表示
                                </Button>
                            )}
                            <Link href="/admin/jobs">
                                <Button variant="outline">キャンセル</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <form action={handleSubmit} className="space-y-8">
                            {/* Pre-registered files section */}
                            <div className="space-y-4 pb-8 border-b border-slate-100">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">求人資料を紐付け</h3>
                                    <Link href="/admin/jobs/pre-registration" className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1 bg-primary-50 px-2 py-1 rounded">
                                        <span>事前登録ページを開く</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">新規アップロード</p>
                                        <FileUploader
                                            onFileSelect={(files) => setFiles(files)}
                                            multiple={true}
                                            accept={{
                                                "application/pdf": [".pdf"],
                                                "image/jpeg": [".jpg", ".jpeg"],
                                                "image/png": [".png"],
                                            }}
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-slate-200/60">
                                        <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">事前登録ファイルから選択</p>
                                        <DraftFileSelector
                                            onSelectionChange={handleDraftSelectionChange}
                                            onFilePreview={handleFilePreview}
                                            initialSelectedIds={selectedDraftIds}
                                        />
                                    </div>
                                </div>

                                {/* 雇用形態選択 - ファイル選択後 */}
                                <div className="space-y-3 pt-6 border-t border-slate-200/60">
                                    <label className="text-sm font-bold text-slate-700">雇用形態</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setJobType("正社員"); localStorage.setItem("lastJobType", "正社員"); }}
                                            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${jobType === "正社員" || jobType === "契約社員"
                                                    ? "bg-blue-600 text-white shadow-sm"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                }`}
                                        >
                                            正社員（契約社員含む）
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setJobType("派遣"); localStorage.setItem("lastJobType", "派遣"); }}
                                            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${jobType === "派遣" || jobType === "紹介予定派遣"
                                                    ? "bg-pink-600 text-white shadow-sm"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                }`}
                                        >
                                            派遣社員
                                        </button>
                                    </div>
                                    <input type="hidden" name="type" value={jobType} required />

                                    {/* AI自動抽出ボタン */}
                                    {previewFile && (
                                        <div className="pt-4">
                                            <AiExtractButton
                                                fileUrl={previewFile.url}
                                                fileName={previewFile.name}
                                                onExtracted={handleAiExtracted}
                                                jobType={jobType}
                                            />
                                        </div>
                                    )}

                                    {/* AI抽出差分プレビュー */}
                                    {pendingExtraction && (
                                        <div className="pt-4">
                                            <AiExtractionPreview
                                                currentData={pendingExtraction.currentData}
                                                extractedData={pendingExtraction.extractedData}
                                                onApply={handleApplyExtraction}
                                                onCancel={() => setPendingExtraction(null)}
                                            />
                                        </div>
                                    )}

                                    {/* AI部分修正ボタン */}
                                    <div className="pt-4">
                                        <ChatAIRefineDialog
                                            jobType={jobType}
                                            currentData={{
                                                title,
                                                area,
                                                salary,
                                                description,
                                                requirements: requirements ? (requirements.startsWith('[') ? JSON.parse(requirements) : [requirements]) : [],
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
                                                nearest_station: "",
                                                location_notes: "",
                                                salary_type: salaryType,
                                            }}
                                            onRefined={(data) => {
                                                if (data.title) setTitle(data.title);
                                                if (data.description) setDescription(data.description);
                                                if (data.requirements) setRequirements(Array.isArray(data.requirements) ? data.requirements.join('\n') : data.requirements);
                                                if (data.working_hours) setWorkingHours(data.working_hours);
                                                if (data.holidays) setHolidays(Array.isArray(data.holidays) ? JSON.stringify(data.holidays) : data.holidays);
                                                if (data.benefits) setBenefits(Array.isArray(data.benefits) ? JSON.stringify(data.benefits) : data.benefits);
                                                if (data.selection_process) setSelectionProcess(data.selection_process);
                                                if (data.tags) setTags(Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags);
                                                if (data.hourly_wage !== undefined) setHourlyWage(String(data.hourly_wage));
                                                if (data.salary_description !== undefined) setSalaryDescription(data.salary_description);
                                                if (data.period !== undefined) setPeriod(data.period);
                                                if (data.start_date !== undefined) setStartDate(data.start_date);
                                                if (data.workplace_name !== undefined) setWorkplaceName(data.workplace_name);
                                                if (data.workplace_address !== undefined) setWorkplaceAddress(data.workplace_address);
                                                if (data.workplace_access !== undefined) setWorkplaceAccess(data.workplace_access);
                                                if (data.attire_type !== undefined) setAttireType(data.attire_type);
                                                if (data.hair_style !== undefined) setHairStyle(data.hair_style);
                                                if (data.salary_type !== undefined) setSalaryType(data.salary_type);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ===== 正社員：企業情報 ===== */}
                            {(jobType === "正社員" || jobType === "契約社員") && (
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

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">求人タイトル</label>
                                            <input
                                                name="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                                className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                placeholder="例：【年収400万〜】Webエンジニア | 成長中のSaaS企業"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">勤務地エリア</label>
                                            <MultiAreaSelect
                                                values={searchAreas}
                                                stations={areaStations}
                                                onChange={setSearchAreas}
                                                onStationsChange={setAreaStations}
                                            />
                                            <input type="hidden" name="area" value={area} required />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">職種カテゴリー</label>
                                                <CategorySelect
                                                    value={category}
                                                    onChange={setCategory}
                                                    name="category"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">業種カテゴリー</label>
                                                <input
                                                    name="industry"
                                                    value={industry}
                                                    onChange={(e) => setIndustry(e.target.value)}
                                                    className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    placeholder="例：IT・情報通信 / 製造業 / 人材サービス"
                                                />
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
                                                rows={6}
                                                className="w-full rounded-xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans leading-relaxed"
                                                placeholder="具体的な業務内容、チーム構成などを入力してください"
                                            />
                                        </div>
                                    </div>
                                </FulltimeJobFields>
                            )}

                            {/* ===== 求人タイトル・エリア（派遣用） ===== */}
                            {jobType !== "正社員" && jobType !== "契約社員" && (
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider">求人タイトル・エリア</h4>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">求人タイトル</label>
                                        <input
                                            name="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="例：【時給1500円】【未経験OK】一般事務@六本木駅"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">勤務地エリア</label>
                                        <MultiAreaSelect
                                            values={searchAreas}
                                            stations={areaStations}
                                            onChange={setSearchAreas}
                                            onStationsChange={setAreaStations}
                                        />
                                        <input type="hidden" name="area" value={area} required />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">職種カテゴリー</label>
                                        <CategorySelect
                                            value={category}
                                            onChange={setCategory}
                                            name="category"
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
                            )}

                            {/* ===== 派遣：給与・勤務条件 ===== */}
                            {(jobType === "派遣" || jobType === "紹介予定派遣") && (
                                <div className="space-y-6 pt-8 border-t-2 border-pink-100 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-bold rounded">派遣</span>
                                        <h3 className="font-bold text-lg text-slate-800">給与・勤務条件</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">給与形態</label>
                                            <SalaryTypeSelector value={salaryType} onChange={setSalaryType} />
                                            <input type="hidden" name="salary_type" value={salaryType} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">時給（検索用・数値のみ）</label>
                                            <input
                                                type="number"
                                                name="hourly_wage"
                                                value={hourlyWage}
                                                onChange={(e) => setHourlyWage(e.target.value)}
                                                className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="例：1400"
                                            />
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">給与詳細</label>
                                        <textarea
                                            name="salary_description"
                                            value={salaryDescription}
                                            onChange={(e) => setSalaryDescription(e.target.value)}
                                            rows={2}
                                            className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="例：交通費全額支給、昇給あり"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">雇用期間</label>
                                            <input
                                                name="period"
                                                value={period}
                                                onChange={(e) => setPeriod(e.target.value)}
                                                className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="例：長期（3ヶ月以上）"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">就業開始時期</label>
                                            <input
                                                name="start_date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="例：即日スタートOK"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== 募集内容（共通） ===== */}
                            <div className="space-y-6 pt-8 border-t-2 border-green-100">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">募集内容</span>
                                    <h3 className="font-bold text-lg text-slate-800">応募資格・勤務条件</h3>
                                </div>

                                {/* 仕事内容（派遣のみ：正社員はFulltimeJobFieldsのchildren内に表示済み） */}
                                {jobType !== "正社員" && jobType !== "契約社員" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">仕事内容</label>
                                        <textarea
                                            name="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={6}
                                            className="w-full rounded-xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans leading-relaxed"
                                            placeholder="具体的な業務内容、チーム構成などを入力してください"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">必須要件</label>
                                    <textarea
                                        name="requirements"
                                        value={requirements}
                                        onChange={(e) => setRequirements(e.target.value)}
                                        rows={5}
                                        className="w-full rounded-xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans leading-relaxed"
                                        placeholder="求人票の応募資格・必須要件をそのまま記載してください"
                                    />
                                    <p className="text-xs text-slate-500">応募に必要なスキルや経験を入力してください。</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">歓迎要件</label>
                                    <textarea
                                        name="welcome_requirements"
                                        value={welcomeRequirements}
                                        onChange={(e) => setWelcomeRequirements(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans leading-relaxed"
                                        placeholder="歓迎するスキルや経験を記載してください"
                                    />
                                    <p className="text-xs text-slate-500">あれば歓迎するスキルや経験を入力してください。</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">勤務時間</label>
                                    <TimePicker onSetTime={(v) => setWorkingHours(v)} />
                                    <textarea
                                        name="working_hours"
                                        value={workingHours}
                                        onChange={(e) => setWorkingHours(e.target.value)}
                                        rows={2}
                                        className="w-full rounded-xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 font-sans"
                                        placeholder="例：9:00〜18:00（休憩60分、実働8時間）"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">休日・休暇</label>
                                    <TagSelector
                                        category="holidays"
                                        value={holidays}
                                        onChange={setHolidays}
                                        placeholder="休日・休暇タグを追加..."
                                        description="土日祝休み、夏季休暇などを選択してください。"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">福利厚生</label>
                                    <TagSelector
                                        category="benefits"
                                        value={benefits}
                                        onChange={setBenefits}
                                        placeholder="福利厚生タグを追加..."
                                        description="社会保険、交通費などを選択してください。"
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

                                <div className="space-y-3">
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

                            {/* ===== 派遣：詳細情報 ===== */}
                            {(jobType === "派遣" || jobType === "紹介予定派遣") && (
                                <div className="animate-in fade-in duration-300">
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
                                </div>
                            )}

                            {/* 掲載期間 */}
                            <div className="space-y-4 pt-8 border-t-2 border-amber-100">
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

                            <div className="space-y-2 pt-8 border-t border-slate-100">
                                <label className="text-sm font-bold text-slate-700">求人元（取引先）<span className="text-xs font-normal text-slate-400 ml-2">※求職者には公開されません</span></label>
                                <ClientSelect name="client_id" />
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
                                    className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-black text-lg shadow-lg shadow-primary-200 transition-all active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "作成中..." : "求人を登録して公開する"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Job Preview Modal */}
            <JobPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                data={{
                    title,
                    area,
                    salary,
                    type: jobType,
                    category,
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

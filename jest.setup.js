// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.GEMINI_API_KEY = 'test-api-key'
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-api-key'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

// Mock Google Generative AI - export mocks for test control
export const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  }
})

// Mock jobMasters to avoid actual imports
jest.mock('@/app/constants/jobMasters', () => ({
  JOB_MASTERS: {
    holidays: ["完全週休2日制", "土日祝休み"],
    benefits: ["社会保険完備", "交通費全額支給"],
    requirements: ["未経験OK"],
    tags: ["駅チカ・駅ナカ"],
  },
}))

jest.mock('@/app/constants/jobMastersV2', () => ({
  JOB_MASTERS_V2: {
    work_conditions: {
      勤務地: ["駅チカ・駅ナカ", "車通勤OK", "転勤なし"],
      勤務時間: ["残業なし", "残業少なめ"],
      働き方: ["リモートワーク可", "服装自由"],
    },
    holidays: {
      週休制度: ["土日祝休み", "完全週休2日制", "週休2日制"],
      長期休暇: ["夏季休暇", "年末年始休暇", "GW休暇", "長期休暇あり"],
      その他休暇: ["有給休暇", "慶弔休暇", "産前産後休暇", "育児休暇"],
    },
    compensation: {
      給与体系: ["賞与あり", "昇給あり"],
      手当: ["交通費全額支給", "交通費規定支給", "残業代全額支給", "住宅手当", "家族手当"],
      福利厚生: ["社会保険完備", "退職金制度", "寮・社宅あり", "PC貸与"],
      キャリア: ["研修制度あり", "資格取得支援", "社員登用あり"],
    },
    requirements: {
      経験: ["未経験OK", "経験者優遇", "ブランクOK"],
      学歴: ["学歴不問", "大卒以上"],
      対象者: ["第二新卒歓迎", "フリーター歓迎", "主婦(夫)活躍中", "20代活躍中", "30代活躍中"],
      スキル: ["PCスキル（基本操作）", "Excelスキル", "英語力不問"],
    },
    recruitment_info: {
      緊急度: ["急募", "大量募集"],
      企業タイプ: ["外資系企業", "大手企業", "ベンチャー企業"],
      その他: ["オープニングスタッフ"],
    },
  },
}))

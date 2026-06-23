import type { ConsultationRouteView } from "./actions";

const dispatchJobs = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    title: "一般事務スタッフ",
    type: "派遣",
    imageUrl:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=640&q=80",
    areaText: "東京都 千代田区",
    salaryText: "時給1,600円",
    workingHours: "9:00〜18:00",
    tags: ["未経験OK", "駅チカ", "土日休み", "交通費支給"],
    detailUrl: "/jobs/00000000-0000-4000-8000-000000000101",
    highlightLabel: "来社相談で詳しく聞けます",
    isFeatured: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    title: "Webエンジニア（自社サービス開発）",
    type: "正社員",
    imageUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=640&q=80",
    areaText: "東京都 渋谷区",
    salaryText: "年収400万円〜",
    workingHours: "10:00〜19:00",
    tags: ["未経験OK", "オンライン相談OK", "土日休み", "服装自由"],
    detailUrl: "/jobs/00000000-0000-4000-8000-000000000102",
    highlightLabel: null,
    isFeatured: false,
  },
];

const fulltimeJobs = [
  {
    ...dispatchJobs[1],
    id: "00000000-0000-4000-8000-000000000201",
    detailUrl: "/jobs/00000000-0000-4000-8000-000000000201",
    isFeatured: true,
    highlightLabel: "正社員相談で条件を整理できます",
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    title: "法人営業（既存顧客フォロー）",
    type: "正社員",
    imageUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=640&q=80",
    areaText: "東京都 新宿区",
    salaryText: "年収360万円〜",
    workingHours: "9:30〜18:30",
    tags: ["研修あり", "土日祝休み", "賞与あり", "駅チカ"],
    detailUrl: "/jobs/00000000-0000-4000-8000-000000000202",
    highlightLabel: null,
    isFeatured: false,
  },
];

const undecidedJobs = [dispatchJobs[0], fulltimeJobs[0]];

function demoDates(jobs: typeof dispatchJobs) {
  return [
    {
      id: "demo-date-2026-06-24",
      date: "2026-06-24",
      status: "available" as const,
      note: null,
      jobs,
    },
    {
      id: "demo-date-2026-06-25",
      date: "2026-06-25",
      status: "available" as const,
      note: null,
      jobs,
    },
    {
      id: "demo-date-2026-06-26",
      date: "2026-06-26",
      status: "unavailable" as const,
      note: "満席",
      jobs: [],
    },
  ];
}

export function getDemoConsultationRoutesView(): ConsultationRouteView[] {
  return [
    {
      id: "demo-route-dispatch",
      slug: "dispatch",
      title: "派遣で働きたい",
      subtitle: "来社して対面で相談",
      description: "派遣求人を中心に、来社相談で働き方を確認します。",
      targetEmploymentType: "dispatch",
      options: [
        {
          id: "demo-option-dispatch-visit",
          mode: "visit",
          label: "来社",
          bookingUrl: "/consult-jobs?demo=1",
          chips: ["派遣", "来社", "交通費支給"],
          isDefault: true,
          availableDates: demoDates(dispatchJobs),
        },
      ],
    },
    {
      id: "demo-route-fulltime",
      slug: "fulltime",
      title: "正社員で相談",
      subtitle: "来社・オンラインで相談",
      description: "正社員求人を中心に、来社またはオンラインで相談します。",
      targetEmploymentType: "fulltime",
      options: [
        {
          id: "demo-option-fulltime-visit",
          mode: "visit",
          label: "来社",
          bookingUrl: "/consult-jobs?demo=1",
          chips: ["正社員", "来社", "オンライン"],
          isDefault: true,
          availableDates: demoDates(fulltimeJobs),
        },
        {
          id: "demo-option-fulltime-online",
          mode: "online",
          label: "オンライン",
          bookingUrl: "/consult-jobs?demo=1",
          chips: ["正社員", "来社", "オンライン"],
          isDefault: false,
          availableDates: demoDates(fulltimeJobs),
        },
      ],
    },
    {
      id: "demo-route-undecided",
      slug: "undecided",
      title: "まだ悩んでいる",
      subtitle: "来社してじっくり相談",
      description: "派遣・正社員の両方を見ながら、働き方から相談します。",
      targetEmploymentType: "mixed",
      options: [
        {
          id: "demo-option-undecided-visit",
          mode: "visit",
          label: "来社",
          bookingUrl: "/consult-jobs?demo=1",
          chips: ["派遣・正社員", "来社", "働き方相談"],
          isDefault: true,
          availableDates: demoDates(undecidedJobs),
        },
      ],
    },
  ];
}

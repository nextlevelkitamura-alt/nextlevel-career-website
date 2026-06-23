import type { ConsultationAvailableDateView, ConsultationBookingSlotView, ConsultationRouteView } from "./actions";

const DATE_KEYS = ["2026-06-24", "2026-06-25", "2026-06-26", "2026-06-29", "2026-06-30"] as const;

const DISPATCH_BOOKING_URLS: Record<(typeof DATE_KEYS)[number], string> = {
  "2026-06-24": "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188422",
  "2026-06-25": "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188423",
  "2026-06-26": "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188424",
  "2026-06-29": "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188425",
  "2026-06-30": "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188426",
};

const UNDECIDED_BOOKING_SLOTS: Record<(typeof DATE_KEYS)[number], ConsultationBookingSlotView[]> = {
  "2026-06-24": [
    { label: "11:00", url: "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188884" },
    { label: "13:00", url: "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188906" },
  ],
  "2026-06-25": [
    { label: "11:00", url: "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188885" },
    { label: "13:00", url: "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188907" },
  ],
  "2026-06-26": [
    { label: "11:00", url: "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188886" },
    { label: "13:00", url: "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188908" },
  ],
  "2026-06-29": [
    { label: "11:00", url: "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188887" },
    { label: "13:00", url: "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188909" },
  ],
  "2026-06-30": [
    { label: "11:00", url: "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188888" },
    { label: "13:00", url: "ps://www.e-nextlevel.jp/nativeapp/work/detail/6188910" },
  ],
};

const FULLTIME_ONLINE_BOOKING_URL =
  "https://cal.com/career-nextlevel-j2gviw/sodan?theme=light&locale=ja&metadata[entryPoint]=consult-jobs";

type DemoDateConfig = {
  bookingUrl?: string | null;
  slotLabel?: string | null;
  slotTitle: string;
  slotDescription: string;
  slotBadge: string;
  slots?: ConsultationBookingSlotView[];
};

function unavailableWeekendDates(prefix: string): ConsultationAvailableDateView[] {
  return [
    {
      id: `${prefix}-date-2026-06-27`,
      date: "2026-06-27",
      status: "unavailable",
      note: "土日は選択できません",
      bookingUrl: null,
      slotLabel: null,
      slotTitle: null,
      slotDescription: null,
      slotBadge: null,
      slots: [],
      jobs: [],
    },
    {
      id: `${prefix}-date-2026-06-28`,
      date: "2026-06-28",
      status: "unavailable",
      note: "土日は選択できません",
      bookingUrl: null,
      slotLabel: null,
      slotTitle: null,
      slotDescription: null,
      slotBadge: null,
      slots: [],
      jobs: [],
    },
  ];
}

function demoDates(prefix: string, createConfig: (date: (typeof DATE_KEYS)[number]) => DemoDateConfig) {
  return [
    ...DATE_KEYS.map((date) => {
      const config = createConfig(date);
      return {
        id: `${prefix}-date-${date}`,
        date,
        status: "available" as const,
        note: null,
        bookingUrl: config.bookingUrl ?? null,
        slotLabel: config.slotLabel ?? null,
        slotTitle: config.slotTitle,
        slotDescription: config.slotDescription,
        slotBadge: config.slotBadge,
        slots: config.slots ?? [],
        jobs: [],
      };
    }),
    ...unavailableWeekendDates(prefix),
  ];
}

export function getDemoConsultationRoutesView(): ConsultationRouteView[] {
  return [
    {
      id: "demo-route-dispatch",
      slug: "dispatch",
      title: "派遣で働きたい",
      subtitle: "来社して対面で相談",
      description: "派遣や長期の働き方を、来社相談で確認します。",
      targetEmploymentType: "dispatch",
      options: [
        {
          id: "demo-option-dispatch-visit",
          mode: "visit",
          label: "来社",
          bookingUrl: DISPATCH_BOOKING_URLS["2026-06-24"],
          chips: ["派遣", "来社", "交通費支給"],
          isDefault: true,
          availableDates: demoDates("dispatch", (date) => ({
            bookingUrl: DISPATCH_BOOKING_URLS[date],
            slotLabel: "11:00",
            slotTitle: "派遣の働き方を相談",
            slotDescription: "新宿で直接相談したい方",
            slotBadge: "来社",
            slots: [{ label: "11:00", url: DISPATCH_BOOKING_URLS[date] }],
          })),
        },
      ],
    },
    {
      id: "demo-route-fulltime",
      slug: "fulltime",
      title: "正社員で相談",
      subtitle: "オンラインで相談",
      description: "正社員を目指す方向けに、オンラインで相談できます。",
      targetEmploymentType: "fulltime",
      options: [
        {
          id: "demo-option-fulltime-online",
          mode: "online",
          label: "オンライン",
          bookingUrl: FULLTIME_ONLINE_BOOKING_URL,
          chips: ["正社員", "オンライン"],
          isDefault: true,
          availableDates: demoDates("fulltime-online", () => ({
            bookingUrl: FULLTIME_ONLINE_BOOKING_URL,
            slotLabel: "オンライン予約",
            slotTitle: "正社員の働き方を相談",
            slotDescription: "オンラインで相談したい方",
            slotBadge: "オンライン",
            slots: [{ label: "オンライン予約", url: FULLTIME_ONLINE_BOOKING_URL }],
          })),
        },
      ],
    },
    {
      id: "demo-route-undecided",
      slug: "undecided",
      title: "まだ悩んでいる",
      subtitle: "来社してじっくり相談",
      description: "派遣か正社員か迷っている方向けに、働き方を整理します。",
      targetEmploymentType: "mixed",
      options: [
        {
          id: "demo-option-undecided-visit",
          mode: "visit",
          label: "来社",
          bookingUrl: UNDECIDED_BOOKING_SLOTS["2026-06-24"][0].url,
          chips: ["派遣・正社員", "来社", "働き方相談"],
          isDefault: true,
          availableDates: demoDates("undecided", (date) => ({
            bookingUrl: UNDECIDED_BOOKING_SLOTS[date][0].url,
            slotLabel: "11:00",
            slotTitle: "働き方を相談",
            slotDescription: "就職や派遣を迷っている方",
            slotBadge: "来社",
            slots: UNDECIDED_BOOKING_SLOTS[date],
          })),
        },
      ],
    },
  ];
}

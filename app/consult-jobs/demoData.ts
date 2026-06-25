import type {
  ConsultationAvailableDateView,
  ConsultationBookingSlotView,
  ConsultationEmploymentJobSummary,
  ConsultationRouteSlug,
  ConsultationRouteView,
} from "./actions";

const DATE_KEYS = [
  "2026-06-24",
  "2026-06-25",
  "2026-06-26",
  "2026-06-29",
  "2026-06-30",
  "2026-07-01",
  "2026-07-02",
  "2026-07-03",
  "2026-07-06",
  "2026-07-07",
  "2026-07-08",
  "2026-07-09",
  "2026-07-10",
  "2026-07-13",
  "2026-07-14",
  "2026-07-15",
  "2026-07-16",
  "2026-07-17",
  "2026-07-21",
  "2026-07-22",
  "2026-07-23",
  "2026-07-24",
  "2026-07-27",
  "2026-07-28",
  "2026-07-29",
  "2026-07-30",
  "2026-07-31",
] as const;

type DateKey = (typeof DATE_KEYS)[number];
type RouteSlotMap = Record<DateKey, ConsultationBookingSlotView[]>;

const BOOKING_SLOTS = {
  dispatch: {
    "2026-06-24": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277233" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277240" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277248" },
    ],
    "2026-06-25": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277234" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277241" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277249" },
    ],
    "2026-06-26": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277235" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277242" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277250" },
    ],
    "2026-06-29": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277236" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277243" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277252" },
    ],
    "2026-06-30": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277237" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277244" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277253" },
    ],
    "2026-07-01": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277600" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277643" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277753" },
    ],
    "2026-07-02": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277601" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277644" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277754" },
    ],
    "2026-07-03": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277602" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277645" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277755" },
    ],
    "2026-07-06": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277603" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277646" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277756" },
    ],
    "2026-07-07": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277604" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277647" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277757" },
    ],
    "2026-07-08": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277605" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277648" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277758" },
    ],
    "2026-07-09": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277606" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277649" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277759" },
    ],
    "2026-07-10": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277607" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277650" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277760" },
    ],
    "2026-07-13": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277608" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277651" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277761" },
    ],
    "2026-07-14": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277609" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277652" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277762" },
    ],
    "2026-07-15": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277610" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277653" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277763" },
    ],
    "2026-07-16": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277611" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277654" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277764" },
    ],
    "2026-07-17": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277612" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277655" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277765" },
    ],
    "2026-07-21": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277613" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277656" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277766" },
    ],
    "2026-07-22": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277614" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277657" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277767" },
    ],
    "2026-07-23": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277615" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277658" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277768" },
    ],
    "2026-07-24": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277616" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277659" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277769" },
    ],
    "2026-07-27": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277617" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277660" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277770" },
    ],
    "2026-07-28": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277618" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277661" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277771" },
    ],
    "2026-07-29": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277619" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277662" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277772" },
    ],
    "2026-07-30": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277620" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277663" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277773" },
    ],
    "2026-07-31": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277621" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277665" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277774" },
    ],
  },
  fulltime: {
    "2026-06-24": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277195" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277202" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277224" },
    ],
    "2026-06-25": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277196" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277203" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277225" },
    ],
    "2026-06-26": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277197" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277204" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277226" },
    ],
    "2026-06-29": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277198" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277205" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277227" },
    ],
    "2026-06-30": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277199" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277206" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277228" },
    ],
    "2026-07-01": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277485" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277530" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277577" },
    ],
    "2026-07-02": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277486" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277531" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277578" },
    ],
    "2026-07-03": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277487" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277532" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277579" },
    ],
    "2026-07-06": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277488" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277533" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277580" },
    ],
    "2026-07-07": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277489" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277534" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277581" },
    ],
    "2026-07-08": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277490" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277535" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277582" },
    ],
    "2026-07-09": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277491" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277536" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277583" },
    ],
    "2026-07-10": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277492" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277537" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277584" },
    ],
    "2026-07-13": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277493" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277538" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277585" },
    ],
    "2026-07-14": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277494" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277539" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277586" },
    ],
    "2026-07-15": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277495" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277540" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277587" },
    ],
    "2026-07-16": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277496" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277541" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277588" },
    ],
    "2026-07-17": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277497" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277542" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277589" },
    ],
    "2026-07-21": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277498" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277543" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277590" },
    ],
    "2026-07-22": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277499" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277544" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277591" },
    ],
    "2026-07-23": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277500" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277545" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277592" },
    ],
    "2026-07-24": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277501" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277546" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277593" },
    ],
    "2026-07-27": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277502" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277547" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277594" },
    ],
    "2026-07-28": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277503" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277548" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277595" },
    ],
    "2026-07-29": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277504" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277549" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277596" },
    ],
    "2026-07-30": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277505" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277550" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277597" },
    ],
    "2026-07-31": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277506" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277551" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277598" },
    ],
  },
  undecided: {
    "2026-06-24": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277021" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277045" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277187" },
    ],
    "2026-06-25": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277022" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277046" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277188" },
    ],
    "2026-06-26": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277023" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277047" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277189" },
    ],
    "2026-06-29": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277024" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277048" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277190" },
    ],
    "2026-06-30": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277025" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277049" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277191" },
    ],
    "2026-07-01": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277368" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277394" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277442" },
    ],
    "2026-07-02": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277369" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277395" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277443" },
    ],
    "2026-07-03": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277370" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277396" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277444" },
    ],
    "2026-07-06": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277371" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277397" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277445" },
    ],
    "2026-07-07": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277372" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277398" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277446" },
    ],
    "2026-07-08": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277373" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277399" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277447" },
    ],
    "2026-07-09": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277374" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277400" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277448" },
    ],
    "2026-07-10": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277375" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277401" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277449" },
    ],
    "2026-07-13": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277376" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277402" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277450" },
    ],
    "2026-07-14": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277377" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277403" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277451" },
    ],
    "2026-07-15": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277378" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277404" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277452" },
    ],
    "2026-07-16": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277379" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277405" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277453" },
    ],
    "2026-07-17": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277380" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277406" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277454" },
    ],
    "2026-07-21": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277381" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277407" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277455" },
    ],
    "2026-07-22": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277382" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277408" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277456" },
    ],
    "2026-07-23": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277383" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277409" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277457" },
    ],
    "2026-07-24": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277384" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277410" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277458" },
    ],
    "2026-07-27": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277385" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277411" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277459" },
    ],
    "2026-07-28": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277386" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277412" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277460" },
    ],
    "2026-07-29": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277387" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277413" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277461" },
    ],
    "2026-07-30": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277388" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277414" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277462" },
    ],
    "2026-07-31": [
      { label: "11:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277389" },
      { label: "13:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277415" },
      { label: "15:00", url: "https://www.e-nextlevel.jp/nativeapp/work/detail/6277463" },
    ],
  },
} satisfies Record<ConsultationRouteSlug, RouteSlotMap>;

type DemoDateConfig = {
  slotTitle: string;
  slotDescription: string;
  slotBadge: string;
};

function getFirstSlot(routeSlug: ConsultationRouteSlug, date: DateKey = DATE_KEYS[0]) {
  return BOOKING_SLOTS[routeSlug][date][0];
}

function demoDates(prefix: string, routeSlug: ConsultationRouteSlug, config: DemoDateConfig): ConsultationAvailableDateView[] {
  return DATE_KEYS.map((date) => {
    const slots = BOOKING_SLOTS[routeSlug][date];
    const firstSlot = slots[0];

    return {
      id: `${prefix}-date-${date}`,
      date,
      status: "available" as const,
      note: null,
      bookingUrl: firstSlot.url,
      slotLabel: firstSlot.label,
      slotTitle: config.slotTitle,
      slotDescription: config.slotDescription,
      slotBadge: config.slotBadge,
      slots,
      jobs: [],
    };
  });
}

export function getDemoConsultationRoutesView(): ConsultationRouteView[] {
  return [
    {
      id: "demo-route-dispatch",
      slug: "dispatch",
      title: "派遣で働きたい",
      subtitle: "対面で働き方を相談",
      description: "派遣や長期の働き方を、対面相談で確認します。",
      targetEmploymentType: "dispatch",
      options: [
        {
          id: "demo-option-dispatch-visit",
          mode: "visit",
          label: "対面",
          bookingUrl: getFirstSlot("dispatch").url,
          chips: ["派遣", "交通費支給"],
          isDefault: true,
          availableDates: demoDates("dispatch", "dispatch", {
            slotTitle: "派遣の働き方の相談",
            slotDescription: "対面で仕事条件を確認したい方",
            slotBadge: "対面",
          }),
        },
      ],
    },
    {
      id: "demo-route-fulltime",
      slug: "fulltime",
      title: "正社員で働きたい",
      subtitle: "オンラインで相談",
      description: "正社員を目指す方向けに、オンラインで相談できます。",
      targetEmploymentType: "fulltime",
      options: [
        {
          id: "demo-option-fulltime-online",
          mode: "online",
          label: "オンライン",
          bookingUrl: getFirstSlot("fulltime").url,
          chips: ["正社員", "オンライン"],
          isDefault: true,
          availableDates: demoDates("fulltime-online", "fulltime", {
            slotTitle: "正社員の働き方の相談",
            slotDescription: "オンラインで就職支援の面談を予約したい方",
            slotBadge: "オンライン",
          }),
        },
      ],
    },
    {
      id: "demo-route-undecided",
      slug: "undecided",
      title: "働き方を相談したい",
      subtitle: "対面でじっくり相談",
      description: "派遣か正社員か迷っている方向けに、働き方を整理します。",
      targetEmploymentType: "mixed",
      options: [
        {
          id: "demo-option-undecided-visit",
          mode: "visit",
          label: "対面",
          bookingUrl: getFirstSlot("undecided").url,
          chips: ["派遣・正社員", "働き方相談"],
          isDefault: true,
          availableDates: demoDates("undecided", "undecided", {
            slotTitle: "自分に合う働き方の相談",
            slotDescription: "派遣か正社員か迷っている方",
            slotBadge: "対面",
          }),
        },
      ],
    },
  ];
}

export function getDemoConsultationEmploymentJobSummary(): ConsultationEmploymentJobSummary {
  return {
    dispatch: {
      key: "dispatch",
      label: "派遣",
      typeQuery: "派遣",
      total: 38,
      listUrl: "/jobs?type=派遣",
      jobs: [
        {
          id: "demo-dispatch-1",
          title: "倉庫内ピッキングスタッフ",
          type: "派遣",
          imageUrl: null,
          areaText: "東京都江東区",
          salaryText: "時給1,450円",
          workingHours: null,
          tags: ["未経験OK", "週3日〜", "日払い可"],
          detailUrl: "/jobs/demo-dispatch-1",
          highlightLabel: null,
          isFeatured: false,
        },
        {
          id: "demo-dispatch-2",
          title: "コールセンター受信スタッフ",
          type: "派遣",
          imageUrl: null,
          areaText: "大阪市北区",
          salaryText: "時給1,500円",
          workingHours: null,
          tags: ["研修あり", "駅チカ", "服装自由"],
          detailUrl: "/jobs/demo-dispatch-2",
          highlightLabel: null,
          isFeatured: false,
        },
        {
          id: "demo-dispatch-3",
          title: "イベント受付・案内スタッフ",
          type: "派遣",
          imageUrl: null,
          areaText: "東京都新宿区",
          salaryText: "時給1,350円",
          workingHours: null,
          tags: ["単発相談可", "交通費支給", "駅チカ"],
          detailUrl: "/jobs/demo-dispatch-3",
          highlightLabel: null,
          isFeatured: false,
        },
        {
          id: "demo-dispatch-4",
          title: "ホテル清掃サポート",
          type: "派遣",
          imageUrl: null,
          areaText: "京都市下京区",
          salaryText: "時給1,300円",
          workingHours: null,
          tags: ["未経験OK", "午前のみ", "研修あり"],
          detailUrl: "/jobs/demo-dispatch-4",
          highlightLabel: null,
          isFeatured: false,
        },
        {
          id: "demo-dispatch-5",
          title: "軽作業・検品スタッフ",
          type: "派遣",
          imageUrl: null,
          areaText: "埼玉県川口市",
          salaryText: "時給1,400円",
          workingHours: null,
          tags: ["日払い可", "車通勤可", "週4日〜"],
          detailUrl: "/jobs/demo-dispatch-5",
          highlightLabel: null,
          isFeatured: false,
        },
        {
          id: "demo-dispatch-6",
          title: "データ入力アシスタント",
          type: "派遣",
          imageUrl: null,
          areaText: "神奈川県横浜市",
          salaryText: "時給1,550円",
          workingHours: null,
          tags: ["PC入力", "土日祝休み", "長期歓迎"],
          detailUrl: "/jobs/demo-dispatch-6",
          highlightLabel: null,
          isFeatured: false,
        },
      ],
    },
    fulltime: {
      key: "fulltime",
      label: "正社員",
      typeQuery: "正社員",
      total: 24,
      listUrl: "/jobs?type=正社員",
      jobs: [
        {
          id: "demo-fulltime-1",
          title: "営業事務スタッフ",
          type: "正社員",
          imageUrl: null,
          areaText: "東京都渋谷区",
          salaryText: "年収350〜450万円",
          workingHours: null,
          tags: ["未経験OK", "土日祝休み", "年間休日120日"],
          detailUrl: "/jobs/demo-fulltime-1",
          highlightLabel: null,
          isFeatured: false,
        },
        {
          id: "demo-fulltime-2",
          title: "カスタマーサクセス",
          type: "正社員",
          imageUrl: null,
          areaText: "東京都港区",
          salaryText: "年収400〜550万円",
          workingHours: null,
          tags: ["研修あり", "駅チカ", "リモート相談可"],
          detailUrl: "/jobs/demo-fulltime-2",
          highlightLabel: null,
          isFeatured: false,
        },
        {
          id: "demo-fulltime-3",
          title: "人材コーディネーター",
          type: "正社員",
          imageUrl: null,
          areaText: "大阪市中央区",
          salaryText: "年収360〜500万円",
          workingHours: null,
          tags: ["未経験OK", "賞与あり", "研修あり"],
          detailUrl: "/jobs/demo-fulltime-3",
          highlightLabel: null,
          isFeatured: false,
        },
        {
          id: "demo-fulltime-4",
          title: "法人営業スタッフ",
          type: "正社員",
          imageUrl: null,
          areaText: "名古屋市中村区",
          salaryText: "年収420〜600万円",
          workingHours: null,
          tags: ["土日祝休み", "インセンティブ", "駅チカ"],
          detailUrl: "/jobs/demo-fulltime-4",
          highlightLabel: null,
          isFeatured: false,
        },
        {
          id: "demo-fulltime-5",
          title: "総務・労務アシスタント",
          type: "正社員",
          imageUrl: null,
          areaText: "福岡市博多区",
          salaryText: "年収330〜430万円",
          workingHours: null,
          tags: ["年間休日120日", "残業少なめ", "経験者歓迎"],
          detailUrl: "/jobs/demo-fulltime-5",
          highlightLabel: null,
          isFeatured: false,
        },
        {
          id: "demo-fulltime-6",
          title: "キャリアアドバイザー",
          type: "正社員",
          imageUrl: null,
          areaText: "東京都新宿区",
          salaryText: "年収380〜520万円",
          workingHours: null,
          tags: ["研修あり", "昇給あり", "オンライン相談可"],
          detailUrl: "/jobs/demo-fulltime-6",
          highlightLabel: null,
          isFeatured: false,
        },
      ],
    },
  };
}

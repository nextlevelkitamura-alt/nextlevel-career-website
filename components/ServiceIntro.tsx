import { Calendar, GraduationCap, HeartHandshake } from "lucide-react";

const features = [
    {
        title: "未経験からスタートOK",
        description: "特別なスキルや経験は必要ありません。充実した研修制度があるから、安心してオフィスワークデビューできます。",
        icon: GraduationCap,
        color: "bg-blue-50 text-blue-600"
    },
    {
        title: "土日祝休み・残業少なめ",
        description: "プライベートも大切にしたいあなたに。週末はしっかり休んで、メリハリのある働き方が叶います。",
        icon: Calendar,
        color: "bg-orange-50 text-orange-600"
    },
    {
        title: "安心のサポート体制",
        description: "お仕事探しから就業後まで、専任のスタッフが親身にサポート。困ったことがあればいつでも相談できます。",
        icon: HeartHandshake,
        color: "bg-green-50 text-green-600"
    },
];

export default function ServiceIntro() {
    return (
        <section id="features" className="py-16 sm:py-20 bg-primary-100 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-200/50 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-orange-100/50 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-primary-600 font-bold tracking-widest text-xs sm:text-sm block mb-3">FEATURES</span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                            Next Level Careerの特徴
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 sm:p-10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

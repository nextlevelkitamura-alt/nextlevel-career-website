import { Calendar, GraduationCap, HeartHandshake } from "lucide-react";

const features = [
    {
        title: "未経験からスタートOK",
        description: "特別なスキルや経験は必要ありません。充実した研修制度があるから、安心してオフィスワークデビューできます。",
        icon: GraduationCap,
    },
    {
        title: "土日祝休み・残業少なめ",
        description: "プライベートも大切にしたいあなたに。週末はしっかり休んで、メリハリのある働き方が叶います。",
        icon: Calendar,
    },
    {
        title: "安心のサポート体制",
        description: "お仕事探しから就業後まで、専任のスタッフが親身にサポート。困ったことがあればいつでも相談できます。",
        icon: HeartHandshake,
    },
];

export default function Features() {
    return (
        <section id="features" className="py-20 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Next Level Careerの特徴
                    </h2>
                    <p className="text-slate-600">
                        選ばれるには理由があります。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6 text-primary-600">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

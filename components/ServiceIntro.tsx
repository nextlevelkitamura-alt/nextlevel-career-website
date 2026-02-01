import { Rocket, Compass, Waypoints } from "lucide-react";

const features = [
    {
        step: "01",
        title: "未経験から最短1週間で就業開始",
        description: "特別なスキルや経験は一切問いません。「すぐに働きたい」という意欲を重視し、選考フローを最適化。充実した研修制度があるため、未経験からでも安心して、最短1週間で新しいお仕事をスタートできます。",
        icon: Rocket,
        color: "bg-orange-50 text-orange-600"
    },
    {
        step: "02",
        title: "ゼロからキャリアを共に再構築",
        description: "条件を聞くだけの面談はしません。あなたの専属パートナーとして「強み」や「価値観」を一緒に整理し、1からキャリアを積み上げるプランをご提案。将来を見据え、あなたらしいキャリア地図を共に描きます。",
        icon: Compass,
        color: "bg-blue-50 text-blue-600"
    },
    {
        step: "03",
        title: "ライフスタイルに合う多様な働き方",
        description: "正社員・契約社員・派遣社員など、幅広い雇用形態から選択可能です。「まずは経験を積みたい」「安定して働きたい」など、あなたの現在のフェーズや目標に合わせて、最適な働き方を選べます。",
        icon: Waypoints,
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-5 sm:p-10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                                    <feature.icon className="w-7 h-7 sm:w-10 sm:h-10" />
                                </div>
                                <div className="absolute top-4 right-4 text-4xl sm:text-5xl font-extrabold text-slate-100 z-0 pointer-events-none select-none">
                                    {feature.step}
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-2 sm:mb-4 leading-snug">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

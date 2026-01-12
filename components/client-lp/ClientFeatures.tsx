import { Zap, Target, Users, TrendingUp } from "lucide-react";

const features = [
    {
        icon: <Target className="w-10 h-10 text-orange-500" />,
        title: "精度の高いマッチング",
        description: "スキルセットだけでなく、カルチャーフィットも重視。貴社の社風やビジョンに共感する人材をご紹介することで、定着率を高めます。"
    },
    {
        icon: <Zap className="w-10 h-10 text-orange-500" />,
        title: "スピーディーな提案",
        description: "独自のデータベースとネットワークを活用し、最短即日での候補者推薦が可能。急な欠員や事業拡大に伴う増員のニーズに迅速に応えます。"
    },
    {
        icon: <Users className="w-10 h-10 text-orange-500" />,
        title: "幅広い職種に対応",
        description: "事務、営業、コールセンター、IT・エンジニア、クリエイティブなど、多岐にわたる職種での実績があります。専門性の高い人材もお任せください。"
    },
    {
        icon: <TrendingUp className="w-10 h-10 text-orange-500" />,
        title: "完全成功報酬型",
        description: "初期費用や月額固定費は一切不要。採用（入社）が決定して初めて費用が発生するため、リスクを最小限に抑えて採用活動が行えます。"
    }
];

export default function ClientFeatures() {
    return (
        <section id="features" className="py-20 lg:py-32 bg-slate-50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        Next Levelが選ばれる理由
                    </h2>
                    <p className="text-slate-600 text-lg">
                        単なる人材紹介にとどまらず、<br className="hidden md:block" />
                        貴社の採用パートナーとして事業成長に貢献します。
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                            <div className="bg-orange-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
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

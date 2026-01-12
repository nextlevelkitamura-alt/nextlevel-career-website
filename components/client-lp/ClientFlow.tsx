import { ArrowRight, MessageSquare, FileSearch, UserCheck, Handshake } from "lucide-react";

const steps = [
    {
        icon: <MessageSquare className="w-8 h-8" />,
        step: "STEP 01",
        title: "お問い合わせ・ヒアリング",
        description: "まずはフォームよりお気軽にお問い合わせください。担当者が貴社の採用ニーズや課題、求める人物像について詳しくヒアリングいたします。"
    },
    {
        icon: <FileSearch className="w-8 h-8" />,
        step: "STEP 02",
        title: "人選・ご提案",
        description: "独自のデータベースから最適な候補者をピックアップ。スキルや経歴だけでなく、志向性も含めて精査した上でご提案させていただきます。"
    },
    {
        icon: <UserCheck className="w-8 h-8" />,
        step: "STEP 03",
        title: "面談・選考",
        description: "候補者との面談を設定いたします。選考プロセスにおける調整や連絡業務はすべて弊社が代行し、貴社の工数を削減します。"
    },
    {
        icon: <Handshake className="w-8 h-8" />,
        step: "STEP 04",
        title: "採用・稼働開始",
        description: "双方の合意が得られましたら、契約締結・入社となります。稼働開始後も定期的（入社後1ヶ月、3ヶ月など）にフォローアップを行います。"
    }
];

export default function ClientFlow() {
    return (
        <section className="py-20 lg:py-32 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        導入までの流れ
                    </h2>
                    <p className="text-slate-600 text-lg">
                        お問い合わせから採用決定まで、スムーズにサポートいたします。<br />
                        急なご依頼でも柔軟に対応可能ですので、ご相談ください。
                    </p>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />

                    <div className="grid lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
                        {steps.map((item, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:border-orange-500 group-hover:shadow-md transition-all duration-300">
                                        <div className="text-slate-400 group-hover:text-orange-500 transition-colors">
                                            {item.icon}
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="lg:hidden absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-slate-300">
                                            <ArrowRight className="w-6 h-6 rotate-90" />
                                        </div>
                                    )}
                                </div>
                                <div className="bg-slate-50 rounded-lg px-3 py-1 mb-3">
                                    <span className="text-xs font-bold text-slate-500 group-hover:text-orange-600 transition-colors">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed text-left lg:text-center w-full px-4">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

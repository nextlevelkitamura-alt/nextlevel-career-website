import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-200 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-bold text-white mb-4 block">
                            Next Level Career
                        </Link>
                        <p className="text-slate-400 text-sm">
                            あなたのキャリアを次のレベルへ。<br />
                            最適な転職をサポートします。
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">求職者の方へ</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/jobs" className="hover:text-white transition-colors">求人検索</Link></li>
                            <li><Link href="/#features" className="hover:text-white transition-colors">特徴</Link></li>
                            <li><Link href="/register" className="hover:text-white transition-colors">無料登録</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">企業の方へ</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/for-companies" className="hover:text-white transition-colors">採用をお考えの企業様</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">会社情報</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/company" className="hover:text-white transition-colors">会社概要</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">利用規約</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Next Level Career. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

import Link from 'next/link';

// export const runtime = 'edge';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">404 - Not Found</h2>
            <p className="text-slate-600 mb-8">お探しのページは見つかりませんでした。</p>
            <Link
                href="/"
                className="px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
            >
                トップページに戻る
            </Link>
        </div>
    );
}

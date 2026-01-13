import { getChatInbox } from "../actions";
import Link from "next/link";
import { UserCircle, MessageCircle } from "lucide-react";

export default async function AdminChatInbox() {
    const inbox = await getChatInbox();

    // Separate lists for tabs if needed, or filter client-side.
    // For simplicity, we'll show all but with badges/sections or simple client-side filter state if we were a client component.
    // Since this is a server component, we'll pass data to a Client Component or just render simply.
    // Let's make this page a Client Component to handle tabs easily? 
    // Wait, the file is `page.tsx` it can be server, but for tabs interactions it's better to use a client component wrapper.
    // Actually, let's keep it simple and just show "Action Required" at the top (sorted) and add badges.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actionRequiredCount = inbox ? inbox.filter((i: any) => i.status === 'action_required').length : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    メッセージ管理
                    {actionRequiredCount > 0 && (
                        <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">{actionRequiredCount}件の要対応</span>
                    )}
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {inbox && inbox.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {inbox.map(({ user, lastMessage, status }: any) => (
                            <Link
                                href={`/admin/chat/${user.id}`}
                                key={user.id}
                                className={`block hover:bg-slate-50 transition-colors p-4 ${status === 'action_required' ? 'bg-red-50/50 hover:bg-red-50' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200">
                                        {user.avatar_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle className="w-8 h-8 text-slate-400" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold truncate ${status === 'action_required' ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {user.last_name} {user.first_name}
                                                </h3>
                                                {status === 'action_required' && (
                                                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                                                        要返信
                                                    </span>
                                                )}
                                                {status === 'replied' && (
                                                    <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                                        返信済み
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-xs whitespace-nowrap ml-2 ${status === 'action_required' ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                                {new Date(lastMessage.created_at).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${status === 'action_required' ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                                            {lastMessage.is_admin_message ? <span className="text-slate-400 mr-1">あなた:</span> : ""}
                                            {lastMessage.content || "画像が送信されました"}
                                        </p>
                                    </div>

                                    {/* Unread Indicator */}
                                    {status === 'action_required' && (
                                        <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 shadow-sm animate-pulse"></div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-500">
                        <MessageCircle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <p>メッセージはまだありません</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { getChatInbox } from "../actions";
import Link from "next/link";
import { UserCircle, MessageCircle } from "lucide-react";

export default async function AdminChatInbox() {
    let inbox: Awaited<ReturnType<typeof getChatInbox>> = [];
    try {
        inbox = await getChatInbox();
    } catch {
        // Table might not exist yet
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">メッセージ管理</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {inbox && inbox.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {inbox.map(({ user, lastMessage }: any) => (
                            <Link
                                href={`/admin/chat/${user.id}`}
                                key={user.id}
                                className="block hover:bg-slate-50 transition-colors p-4"
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
                                            <h3 className="font-bold text-slate-900 truncate">
                                                {user.last_name} {user.first_name}
                                            </h3>
                                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                {new Date(lastMessage.created_at).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 truncate">
                                            {lastMessage.is_admin_message ? "あなた: " : ""}{lastMessage.content || "画像が送信されました"}
                                        </p>
                                    </div>

                                    {/* Unread Indicator - mocked for now or check is_read */}
                                    {!lastMessage.is_read && !lastMessage.is_admin_message && (
                                        <div className="w-3 h-3 bg-primary-500 rounded-full flex-shrink-0"></div>
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

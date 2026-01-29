import { createClient } from "@/utils/supabase/server";
import { getChatMessages } from "@/app/chat/actions";
import ChatInterface from "@/components/chat/ChatInterface";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default async function MyChatPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const messages = await getChatMessages(user.id);

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col md:static md:bg-transparent md:z-auto md:max-w-4xl md:mx-auto md:py-8 md:block h-[100dvh] md:h-auto">
            {/* Mobile Header */}
            <div className="flex items-center gap-3 p-4 bg-white border-b border-slate-200 shrink-0 md:bg-transparent md:border-none md:p-0 md:mb-6">
                {/* Back button for mobile could be added here if needed, but browser back is fine */}
                <div className="p-2 md:p-3 bg-primary-100 rounded-full text-primary-600 shrink-0">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                    <h1 className="text-lg md:text-2xl font-bold text-slate-900">サポートチャット</h1>
                    <p className="text-slate-500 text-xs md:text-sm hidden md:block">スタッフと直接メッセージや画像のやり取りができます。</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden w-full md:block md:h-auto">
                <ChatInterface
                    initialMessages={messages || []}
                    targetUserId={user.id}
                    currentUserId={user.id}
                />
            </div>
        </div>
    );
}

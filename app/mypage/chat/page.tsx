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
        <div className="max-w-4xl mx-auto py-4 md:py-8 h-[calc(100dvh-80px)] md:h-auto flex flex-col">
            <div className="flex items-center gap-3 mb-4 md:mb-6 shrink-0">
                <div className="p-2 md:p-3 bg-primary-100 rounded-full text-primary-600">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                    <h1 className="text-lg md:text-2xl font-bold text-slate-900">サポートチャット</h1>
                    <p className="text-slate-500 text-xs md:text-sm hidden md:block">スタッフと直接メッセージや画像のやり取りができます。</p>
                </div>
            </div>

            <ChatInterface
                initialMessages={messages || []}
                targetUserId={user.id}
                currentUserId={user.id}
            />
        </div>
    );
}

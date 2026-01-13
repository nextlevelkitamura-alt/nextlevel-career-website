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

    let messages: Awaited<ReturnType<typeof getChatMessages>> = [];
    try {
        messages = await getChatMessages(user.id);
    } catch {
        // Table might not exist yet
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-full text-primary-600">
                    <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">サポートチャット</h1>
                    <p className="text-slate-500 text-sm">スタッフと直接メッセージや画像のやり取りができます。</p>
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

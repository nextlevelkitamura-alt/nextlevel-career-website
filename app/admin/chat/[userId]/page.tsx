import { getChatMessages } from "@/app/chat/actions";
import ChatInterface from "@/components/chat/ChatInterface";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function AdminUserChatPage({ params }: { params: { userId: string } }) {
    const messages = await getChatMessages(params.userId);
    const supabase = createClient();

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', params.userId).single();
    const { data: { user: adminUser } } = await supabase.auth.getUser();

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/admin/chat">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold text-slate-900">
                    {profile?.last_name || "ユーザー"} {profile?.first_name} とのチャット
                </h1>
            </div>

            <div className="flex-1">
                <ChatInterface
                    initialMessages={messages || []}
                    targetUserId={params.userId}
                    currentUserId={adminUser?.id || ""}
                    isAdminView={true}
                />
            </div>
        </div>
    );
}

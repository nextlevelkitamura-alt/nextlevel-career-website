"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteChatConversation } from "@/app/admin/actions";
import { useRouter } from "next/navigation";

export default function DeleteChatButton({ userId, userName }: { userId: string, userName: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(`${userName}さんとのチャット履歴を全て削除しますか？\nこの操作は取り消せません。`)) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteChatConversation(userId);

        if (result.success) {
            router.push("/admin/chat");
        } else {
            alert("削除に失敗しました: " + result.error);
            setIsDeleting(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4 mr-1.5" />
            )}
            チャットを削除
        </Button>
    );
}

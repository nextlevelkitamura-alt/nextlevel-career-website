"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { repairJobDetails } from "../../../actions";
import { Button } from "@/components/ui/button";

export default function RepairDetailsButton({ jobId }: { jobId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRepair = async () => {
        setIsLoading(true);
        try {
            const result = await repairJobDetails(jobId);
            if (result.error) {
                alert(`修復に失敗しました: ${result.error}`);
            } else {
                router.refresh();
            }
        } catch {
            alert("修復中にエラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            type="button"
            onClick={handleRepair}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
            size="sm"
        >
            {isLoading ? "修復中..." : "自動修復（AI抽出データから復元）"}
        </Button>
    );
}

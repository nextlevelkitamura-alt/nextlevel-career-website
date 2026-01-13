"use client";

import { useState } from "react";
import { uploadAvatar } from "../actions";
import { Loader2, Camera, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AvatarUpload({ currentAvatarUrl }: { currentAvatarUrl: string | null }) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Size check (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("ファイルサイズは2MB以下にしてください");
            return;
        }

        setIsUploading(true);

        // Preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadAvatar(formData);

        if (result?.error) {
            toast.error("アップロードに失敗しました: " + result.error);
            setPreviewUrl(currentAvatarUrl); // Revert on error
        } else {
            toast.success("プロフィール写真を更新しました");
        }

        setIsUploading(false);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-slate-300">
                            <Camera className="w-12 h-12" />
                        </div>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full cursor-pointer shadow-md transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>
            </div>
            <p className="text-sm text-slate-500">
                お顔がはっきり分かる写真<br />推奨サイズ: 2MB以下
            </p>
        </div>
    );
}

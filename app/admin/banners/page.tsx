"use client";

import { useState, useEffect, useRef } from "react";
import {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    uploadBannerImage,
    updateBannerOrders,
    type Banner,
} from "../actions/banners";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Loader2,
    Plus,
    Trash2,
    Edit2,
    ArrowUp,
    ArrowDown,
    ImageIcon,
    ExternalLink,
    Eye,
    EyeOff,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editBanner, setEditBanner] = useState<Banner | null>(null);

    // フォーム状態
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchBanners = async () => {
        setIsLoading(true);
        try {
            const data = await getBanners();
            setBanners(data);
        } catch (e) {
            console.error(e);
            toast.error("バナーの取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const resetForm = () => {
        setTitle("");
        setImageUrl("");
        setLinkUrl("");
        setDisplayOrder(0);
        setIsActive(true);
    };

    const openCreate = () => {
        resetForm();
        setDisplayOrder(banners.length);
        setIsCreateOpen(true);
    };

    const openEdit = (banner: Banner) => {
        setEditBanner(banner);
        setTitle(banner.title);
        setImageUrl(banner.image_url);
        setLinkUrl(banner.link_url || "");
        setDisplayOrder(banner.display_order);
        setIsActive(banner.is_active);
    };

    const closeDialog = () => {
        setIsCreateOpen(false);
        setEditBanner(null);
        resetForm();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await uploadBannerImage(formData);
            if (res.error) {
                toast.error(res.error);
            } else if (res.url) {
                setImageUrl(res.url);
                toast.success("画像をアップロードしました");
            }
        } catch {
            toast.error("画像のアップロードに失敗しました");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !imageUrl) {
            toast.error("タイトルと画像は必須です");
            return;
        }

        setIsSaving(true);
        try {
            if (editBanner) {
                const res = await updateBanner(editBanner.id, {
                    title: title.trim(),
                    image_url: imageUrl,
                    link_url: linkUrl.trim() || null,
                    display_order: displayOrder,
                    is_active: isActive,
                });
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success("バナーを更新しました");
                    closeDialog();
                    fetchBanners();
                }
            } else {
                const res = await createBanner({
                    title: title.trim(),
                    image_url: imageUrl,
                    link_url: linkUrl.trim() || undefined,
                    display_order: displayOrder,
                    is_active: isActive,
                });
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success("バナーを作成しました");
                    closeDialog();
                    fetchBanners();
                }
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("このバナーを削除しますか？\n画像データも削除されます。")) return;
        try {
            const res = await deleteBanner(id);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("バナーを削除しました");
                setBanners((prev) => prev.filter((b) => b.id !== id));
            }
        } catch {
            toast.error("削除に失敗しました");
        }
    };

    const handleToggleActive = async (banner: Banner) => {
        const res = await updateBanner(banner.id, { is_active: !banner.is_active });
        if (res.error) {
            toast.error(res.error);
        } else {
            setBanners((prev) =>
                prev.map((b) => (b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
            );
        }
    };

    const handleMoveOrder = async (index: number, direction: "up" | "down") => {
        const swapIndex = direction === "up" ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= banners.length) return;

        const newBanners = [...banners];
        [newBanners[index], newBanners[swapIndex]] = [newBanners[swapIndex], newBanners[index]];

        const orders = newBanners.map((b, i) => ({ id: b.id, display_order: i }));
        setBanners(newBanners.map((b, i) => ({ ...b, display_order: i })));

        const res = await updateBannerOrders(orders);
        if (res.error) {
            toast.error("順序の更新に失敗しました");
            fetchBanners();
        }
    };

    const isDialogOpen = isCreateOpen || !!editBanner;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">バナー管理</h1>
                <div className="flex gap-3">
                    <Link href="/admin/masters">
                        <Button variant="outline">設定に戻る</Button>
                    </Link>
                    <Button
                        onClick={openCreate}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        新規バナー
                    </Button>
                </div>
            </div>

            <p className="text-sm text-slate-500 mb-6">
                トップページに表示するバナーカルーセルを管理します。推奨画像サイズ: 1920x600px（16:5）
            </p>

            {isLoading ? (
                <div className="p-12 text-center">
                    <Loader2 className="animate-spin w-8 h-8 mx-auto text-slate-300" />
                </div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">登録されたバナーはありません</p>
                    <Button
                        onClick={openCreate}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        最初のバナーを作成
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${
                                !banner.is_active ? "opacity-50" : ""
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row">
                                {/* 画像プレビュー */}
                                <div className="relative w-full sm:w-72 aspect-[16/5] sm:aspect-auto sm:h-36 flex-shrink-0 bg-slate-100">
                                    <Image
                                        src={banner.image_url}
                                        alt={banner.title}
                                        fill
                                        className="object-cover"
                                        sizes="288px"
                                    />
                                </div>

                                {/* 情報 */}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-900">
                                                {banner.title}
                                            </span>
                                            {!banner.is_active && (
                                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                                                    非表示
                                                </span>
                                            )}
                                        </div>
                                        {banner.link_url && (
                                            <p className="text-sm text-slate-500 truncate max-w-md flex items-center gap-1">
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                {banner.link_url}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-1">
                                            表示順: {banner.display_order}
                                        </p>
                                    </div>

                                    {/* アクション */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleMoveOrder(index, "up")}
                                            disabled={index === 0}
                                            className="text-slate-500 hover:text-slate-700"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleMoveOrder(index, "down")}
                                            disabled={index === banners.length - 1}
                                            className="text-slate-500 hover:text-slate-700"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </Button>
                                        <div className="flex-1" />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleToggleActive(banner)}
                                            className="text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                        >
                                            {banner.is_active ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openEdit(banner)}
                                            className="text-slate-500 hover:text-primary-600 hover:bg-primary-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(banner.id)}
                                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 作成・編集ダイアログ */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editBanner ? "バナーの編集" : "新規バナー"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                        {/* 画像アップロード */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">
                                バナー画像 <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-slate-500">
                                推奨: 1920x600px（16:5）、5MB以下
                            </p>
                            {imageUrl ? (
                                <div className="relative aspect-[16/5] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                    <Image
                                        src={imageUrl}
                                        alt="プレビュー"
                                        fill
                                        className="object-cover"
                                        sizes="480px"
                                    />
                                    <button
                                        onClick={() => setImageUrl("")}
                                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 transition-colors"
                                >
                                    {isUploading ? (
                                        <Loader2 className="animate-spin w-8 h-8 mx-auto text-slate-400" />
                                    ) : (
                                        <>
                                            <ImageIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                            <p className="text-sm text-slate-500">
                                                クリックして画像を選択
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={handleUpload}
                            />
                        </div>

                        {/* タイトル */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">
                                タイトル <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="バナーのタイトル（管理用）"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* リンクURL */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">
                                リンクURL
                            </label>
                            <p className="text-xs text-slate-500">
                                クリック時の遷移先。求人ページ（/jobs/xxx）や外部URLを指定できます。
                            </p>
                            <input
                                type="text"
                                placeholder="例: /jobs/abc123 または https://example.com"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                            />
                        </div>

                        {/* 表示順・有効フラグ */}
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-bold text-slate-700">表示順</label>
                                <input
                                    type="number"
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={displayOrder}
                                    onChange={(e) =>
                                        setDisplayOrder(parseInt(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">表示状態</label>
                                <button
                                    onClick={() => setIsActive(!isActive)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                        isActive
                                            ? "bg-green-50 border-green-300 text-green-700"
                                            : "bg-slate-50 border-slate-300 text-slate-500"
                                    }`}
                                >
                                    {isActive ? (
                                        <>
                                            <Eye className="w-4 h-4" /> 表示中
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-4 h-4" /> 非表示
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* 保存ボタン */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={closeDialog}>
                                キャンセル
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !title.trim() || !imageUrl}
                                className="bg-primary-600 hover:bg-primary-700 text-white"
                            >
                                {isSaving ? (
                                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                ) : null}
                                {editBanner ? "更新" : "作成"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    uploadBannerImage,
    updateBannerOrders,
    type Banner,
} from "../actions/banners";
import { HighlightCardsManager } from "../highlight-cards/HighlightCardsManager";
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
    LayoutGrid,
    AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

const RECOMMENDED_WIDTH = 1920;
const RECOMMENDED_HEIGHT = 600;

type ImageMeta = { width: number; height: number; size?: number; format?: string };

function useImageMeta(url: string | null) {
    const [meta, setMeta] = useState<ImageMeta | null>(null);
    useEffect(() => {
        if (!url) { setMeta(null); return; }
        const img = new window.Image();
        img.onload = () => setMeta({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => setMeta(null);
        img.src = url;
    }, [url]);
    return meta;
}

function ImageSizeBadge({ meta, className = "" }: { meta: ImageMeta | null; className?: string }) {
    if (!meta) return null;
    const isRecommended = meta.width === RECOMMENDED_WIDTH && meta.height === RECOMMENDED_HEIGHT;
    const sizeText = `${meta.width}x${meta.height}`;
    const fileSizeText = meta.size ? ` | ${(meta.size / 1024).toFixed(0)}KB` : "";
    const formatText = meta.format ? ` | ${meta.format}` : "";
    return (
        <span className={`inline-flex items-center gap-1 text-xs ${isRecommended ? "text-green-600" : "text-amber-600"} ${className}`}>
            {!isRecommended && <AlertTriangle className="w-3 h-3" />}
            {sizeText}{fileSizeText}{formatText}
            {!isRecommended && <span className="text-slate-400 ml-1">(推奨: {RECOMMENDED_WIDTH}x{RECOMMENDED_HEIGHT})</span>}
        </span>
    );
}

function BannerImageMeta({ url }: { url: string }) {
    const meta = useImageMeta(url);
    return <ImageSizeBadge meta={meta} className="mt-1" />;
}

export default function BannersPage() {
    const [activeTab, setActiveTab] = useState<"banners" | "highlight-cards">("banners");
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editBanner, setEditBanner] = useState<Banner | null>(null);

    // フォーム状態
    const [title, setTitle] = useState("");
    const [altText, setAltText] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [linkTarget, setLinkTarget] = useState("_self");
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadMeta, setUploadMeta] = useState<ImageMeta | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ダイアログ内の画像メタ（編集時はURLから取得）
    const editImageMeta = useImageMeta(imageUrl);
    const dialogImageMeta = uploadMeta || editImageMeta;

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

    const resetForm = useCallback(() => {
        setTitle("");
        setAltText("");
        setImageUrl("");
        setLinkUrl("");
        setLinkTarget("_self");
        setDisplayOrder(0);
        setIsActive(true);
        setStartsAt("");
        setEndsAt("");
        setUploadMeta(null);
    }, []);

    const openCreate = () => {
        resetForm();
        setDisplayOrder(banners.length);
        setIsCreateOpen(true);
    };

    const openEdit = (banner: Banner) => {
        setEditBanner(banner);
        setTitle(banner.title);
        setAltText(banner.alt_text || "");
        setImageUrl(banner.image_url);
        setLinkUrl(banner.link_url || "");
        setLinkTarget(banner.link_target || "_self");
        setDisplayOrder(banner.display_order);
        setIsActive(banner.is_active);
        setStartsAt(banner.starts_at ? banner.starts_at.slice(0, 16) : "");
        setEndsAt(banner.ends_at ? banner.ends_at.slice(0, 16) : "");
        setUploadMeta(null);
    };

    const closeDialog = () => {
        setIsCreateOpen(false);
        setEditBanner(null);
        resetForm();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // クライアントサイドで画像メタを取得
        const objectUrl = URL.createObjectURL(file);
        const img = new window.Image();
        img.onload = () => {
            setUploadMeta({
                width: img.naturalWidth,
                height: img.naturalHeight,
                size: file.size,
                format: file.type.split("/")[1]?.toUpperCase() || "",
            });
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;

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
                    alt_text: altText.trim() || null,
                    link_target: linkTarget,
                    display_order: displayOrder,
                    is_active: isActive,
                    starts_at: startsAt || null,
                    ends_at: endsAt || null,
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
                    alt_text: altText.trim() || undefined,
                    link_target: linkTarget,
                    display_order: displayOrder,
                    is_active: isActive,
                    starts_at: startsAt || undefined,
                    ends_at: endsAt || undefined,
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">表示コンテンツ管理</h1>
                <Link href="/admin/masters">
                    <Button variant="outline">設定に戻る</Button>
                </Link>
            </div>

            {/* タブ切り替え */}
            <div className="flex border-b border-slate-200 mb-6">
                <button
                    onClick={() => setActiveTab("banners")}
                    className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === "banners"
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    バナー
                </button>
                <button
                    onClick={() => setActiveTab("highlight-cards")}
                    className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === "highlight-cards"
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    ハイライトカード
                </button>
            </div>

            {/* ハイライトカードタブ */}
            {activeTab === "highlight-cards" && <HighlightCardsManager />}

            {/* バナータブ */}
            {activeTab === "banners" && (<>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-500">
                    トップページに表示するバナーカルーセルを管理します。推奨画像サイズ: {RECOMMENDED_WIDTH}x{RECOMMENDED_HEIGHT}px（16:5）
                </p>
                <Button
                    onClick={openCreate}
                    className="bg-primary-600 hover:bg-primary-700 text-white flex-shrink-0"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    新規バナー
                </Button>
            </div>

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
                                        alt={banner.alt_text || banner.title}
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
                                            {banner.link_target === "_blank" && (
                                                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                                                    別タブ
                                                </span>
                                            )}
                                        </div>
                                        {banner.link_url && (
                                            <p className="text-sm text-slate-500 truncate max-w-md flex items-center gap-1">
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                {banner.link_url}
                                            </p>
                                        )}
                                        <BannerImageMeta url={banner.image_url} />
                                        <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                            <span>表示順: {banner.display_order}</span>
                                            {banner.starts_at && (
                                                <span>開始: {new Date(banner.starts_at).toLocaleDateString("ja-JP")}</span>
                                            )}
                                            {banner.ends_at && (
                                                <span>終了: {new Date(banner.ends_at).toLocaleDateString("ja-JP")}</span>
                                            )}
                                        </div>
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
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                                推奨: {RECOMMENDED_WIDTH}x{RECOMMENDED_HEIGHT}px（16:5）、5MB以下
                            </p>
                            {imageUrl ? (
                                <div>
                                    <div className="relative aspect-[16/5] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                        <Image
                                            src={imageUrl}
                                            alt="プレビュー"
                                            fill
                                            className="object-cover"
                                            sizes="480px"
                                        />
                                        <button
                                            onClick={() => { setImageUrl(""); setUploadMeta(null); }}
                                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <ImageSizeBadge meta={dialogImageMeta} className="mt-1" />
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

                        {/* 代替テキスト */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">代替テキスト（alt）</label>
                            <p className="text-xs text-slate-500">
                                SEO・アクセシビリティ用。空の場合はタイトルが使用されます。
                            </p>
                            <input
                                type="text"
                                placeholder="画像の説明"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                            />
                        </div>

                        {/* リンクURL */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">リンクURL</label>
                            <input
                                type="text"
                                placeholder="例: /jobs/abc123 または https://example.com"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                            />
                        </div>

                        {/* リンクの開き方 */}
                        {linkUrl && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">リンクの開き方</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setLinkTarget("_self")}
                                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                                            linkTarget === "_self"
                                                ? "bg-primary-50 border-primary-300 text-primary-700"
                                                : "bg-white border-slate-300 text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        同じタブ
                                    </button>
                                    <button
                                        onClick={() => setLinkTarget("_blank")}
                                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                                            linkTarget === "_blank"
                                                ? "bg-blue-50 border-blue-300 text-blue-700"
                                                : "bg-white border-slate-300 text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        別タブ
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 表示期間 */}
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-bold text-slate-700">表示開始</label>
                                <input
                                    type="datetime-local"
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={startsAt}
                                    onChange={(e) => setStartsAt(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-bold text-slate-700">表示終了</label>
                                <input
                                    type="datetime-local"
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={endsAt}
                                    onChange={(e) => setEndsAt(e.target.value)}
                                />
                            </div>
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
            </>)}
        </div>
    );
}

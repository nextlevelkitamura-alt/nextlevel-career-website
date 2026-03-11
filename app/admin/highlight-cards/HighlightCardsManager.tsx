"use client";

import { useState, useEffect, useRef } from "react";
import {
    getHighlightCards,
    createHighlightCard,
    updateHighlightCard,
    deleteHighlightCard,
    uploadHighlightCardImage,
    updateHighlightCardOrders,
    type HighlightCard,
} from "../actions/highlightCards";
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
import Image from "next/image";
import { toast } from "sonner";

const CATEGORY_OPTIONS = [
    { value: "news", label: "お知らせ", color: "bg-blue-100 text-blue-700" },
    { value: "job", label: "新着求人", color: "bg-emerald-100 text-emerald-700" },
    { value: "feature", label: "特集", color: "bg-purple-100 text-purple-700" },
    { value: "campaign", label: "キャンペーン", color: "bg-orange-100 text-orange-700" },
];

function getCategoryStyle(category: string) {
    return CATEGORY_OPTIONS.find((c) => c.value === category) || CATEGORY_OPTIONS[0];
}

export function HighlightCardsManager() {
    const [cards, setCards] = useState<HighlightCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editCard, setEditCard] = useState<HighlightCard | null>(null);

    // フォーム状態
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [category, setCategory] = useState("news");
    const [badgeText, setBadgeText] = useState("");
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchCards = async () => {
        setIsLoading(true);
        try {
            const data = await getHighlightCards();
            setCards(data);
        } catch (e) {
            console.error(e);
            toast.error("カードの取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setImageUrl("");
        setLinkUrl("");
        setCategory("news");
        setBadgeText("");
        setDisplayOrder(0);
        setIsActive(true);
        setStartsAt("");
        setEndsAt("");
    };

    const openCreate = () => {
        resetForm();
        setDisplayOrder(cards.length);
        setIsCreateOpen(true);
    };

    const openEdit = (card: HighlightCard) => {
        setEditCard(card);
        setTitle(card.title);
        setDescription(card.description || "");
        setImageUrl(card.image_url);
        setLinkUrl(card.link_url || "");
        setCategory(card.category);
        setBadgeText(card.badge_text || "");
        setDisplayOrder(card.display_order);
        setIsActive(card.is_active);
        setStartsAt(card.starts_at ? card.starts_at.slice(0, 16) : "");
        setEndsAt(card.ends_at ? card.ends_at.slice(0, 16) : "");
    };

    const closeDialog = () => {
        setIsCreateOpen(false);
        setEditCard(null);
        resetForm();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await uploadHighlightCardImage(formData);
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
            const payload = {
                title: title.trim(),
                description: description.trim() || undefined,
                image_url: imageUrl,
                link_url: linkUrl.trim() || undefined,
                category,
                badge_text: badgeText.trim() || undefined,
                display_order: displayOrder,
                is_active: isActive,
                starts_at: startsAt || undefined,
                ends_at: endsAt || undefined,
            };

            if (editCard) {
                const res = await updateHighlightCard(editCard.id, {
                    ...payload,
                    description: payload.description || null,
                    link_url: payload.link_url || null,
                    badge_text: payload.badge_text || null,
                    starts_at: payload.starts_at || null,
                    ends_at: payload.ends_at || null,
                });
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success("カードを更新しました");
                    closeDialog();
                    fetchCards();
                }
            } else {
                const res = await createHighlightCard(payload);
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success("カードを作成しました");
                    closeDialog();
                    fetchCards();
                }
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("このカードを削除しますか？\n画像データも削除されます。")) return;
        try {
            const res = await deleteHighlightCard(id);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("カードを削除しました");
                setCards((prev) => prev.filter((c) => c.id !== id));
            }
        } catch {
            toast.error("削除に失敗しました");
        }
    };

    const handleToggleActive = async (card: HighlightCard) => {
        const res = await updateHighlightCard(card.id, { is_active: !card.is_active });
        if (res.error) {
            toast.error(res.error);
        } else {
            setCards((prev) =>
                prev.map((c) => (c.id === card.id ? { ...c, is_active: !c.is_active } : c))
            );
        }
    };

    const handleMoveOrder = async (index: number, direction: "up" | "down") => {
        const swapIndex = direction === "up" ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= cards.length) return;

        const newCards = [...cards];
        [newCards[index], newCards[swapIndex]] = [newCards[swapIndex], newCards[index]];

        const orders = newCards.map((c, i) => ({ id: c.id, display_order: i }));
        setCards(newCards.map((c, i) => ({ ...c, display_order: i })));

        const res = await updateHighlightCardOrders(orders);
        if (res.error) {
            toast.error("順序の更新に失敗しました");
            fetchCards();
        }
    };

    const isDialogOpen = isCreateOpen || !!editCard;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-500">
                    トップページの「ピックアップ」セクションに表示するカードを管理します。推奨画像サイズ: 800x450px（16:9）
                </p>
                <Button
                    onClick={openCreate}
                    className="bg-primary-600 hover:bg-primary-700 text-white flex-shrink-0"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    新規カード
                </Button>
            </div>

            {isLoading ? (
                <div className="p-12 text-center">
                    <Loader2 className="animate-spin w-8 h-8 mx-auto text-slate-300" />
                </div>
            ) : cards.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">登録されたカードはありません</p>
                    <Button
                        onClick={openCreate}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        最初のカードを作成
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {cards.map((card, index) => (
                        <div
                            key={card.id}
                            className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${
                                !card.is_active ? "opacity-50" : ""
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row">
                                {/* 画像プレビュー */}
                                <div className="relative w-full sm:w-48 aspect-[16/9] sm:aspect-auto sm:h-36 flex-shrink-0 bg-slate-100">
                                    <Image
                                        src={card.image_url}
                                        alt={card.title}
                                        fill
                                        className="object-cover"
                                        sizes="192px"
                                    />
                                    {card.badge_text && (
                                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                            {card.badge_text}
                                        </span>
                                    )}
                                </div>

                                {/* 情報 */}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryStyle(card.category).color}`}>
                                                {getCategoryStyle(card.category).label}
                                            </span>
                                            {!card.is_active && (
                                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                                                    非表示
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-bold text-slate-900">{card.title}</p>
                                        {card.description && (
                                            <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                                                {card.description}
                                            </p>
                                        )}
                                        {card.link_url && (
                                            <p className="text-xs text-slate-400 truncate max-w-md flex items-center gap-1 mt-1">
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                {card.link_url}
                                            </p>
                                        )}
                                        <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                            <span>表示順: {card.display_order}</span>
                                            {card.starts_at && (
                                                <span>開始: {new Date(card.starts_at).toLocaleDateString("ja-JP")}</span>
                                            )}
                                            {card.ends_at && (
                                                <span>終了: {new Date(card.ends_at).toLocaleDateString("ja-JP")}</span>
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
                                            disabled={index === cards.length - 1}
                                            className="text-slate-500 hover:text-slate-700"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </Button>
                                        <div className="flex-1" />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleToggleActive(card)}
                                            className="text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                        >
                                            {card.is_active ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openEdit(card)}
                                            className="text-slate-500 hover:text-primary-600 hover:bg-primary-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(card.id)}
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
                            {editCard ? "カードの編集" : "新規カード"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                        {/* 画像アップロード */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">
                                カード画像 <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-slate-500">
                                推奨: 800x450px（16:9）、5MB以下
                            </p>
                            {imageUrl ? (
                                <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
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
                                placeholder="カードのタイトル"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* 説明文 */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">説明文</label>
                            <textarea
                                placeholder="カードの説明（2行程度）"
                                rows={2}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* カテゴリ・バッジ */}
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-bold text-slate-700">カテゴリ</label>
                                <select
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-bold text-slate-700">バッジ</label>
                                <input
                                    type="text"
                                    placeholder="例: NEW, 期間限定"
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={badgeText}
                                    onChange={(e) => setBadgeText(e.target.value)}
                                />
                            </div>
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
                                {editCard ? "更新" : "作成"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

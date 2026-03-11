"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HighlightCard {
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    link_url: string | null;
    category: string;
    badge_text: string | null;
}

interface HighlightCarouselProps {
    cards: HighlightCard[];
}

export default function HighlightCarousel({ cards }: HighlightCarouselProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: "center", slidesToScroll: 1, duration: 40 },
        [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        onSelect();
        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

    if (cards.length === 0) return null;

    // 1枚の場合はカルーセルなしで中央表示
    if (cards.length === 1) {
        return (
            <section className="pt-6 pb-2 sm:pt-8 sm:pb-4 bg-primary-100">
                <div className="container mx-auto px-4">
                    <p className="text-sm font-bold tracking-widest text-primary-600 text-center mb-3">PICK UP</p>
                    <div className="flex justify-center">
                        <div className="w-[92%] sm:w-[80%] lg:w-[70%]">
                            <CardItem card={cards[0]} priority />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="pt-6 pb-2 sm:pt-8 sm:pb-4 bg-primary-100">
            <div className="container mx-auto px-4">
                <p className="text-sm font-bold tracking-widest text-primary-600 text-center mb-3">PICK UP</p>
                {/* カルーセル */}
                <div className="relative group">
                    {/* 左右矢印（PC） */}
                    {canScrollPrev && (
                        <button
                            onClick={scrollPrev}
                            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/90 shadow-lg border border-slate-200 text-slate-600 hover:text-slate-900 transition-opacity opacity-0 group-hover:opacity-100"
                            aria-label="前へ"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    {canScrollNext && (
                        <button
                            onClick={scrollNext}
                            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/90 shadow-lg border border-slate-200 text-slate-600 hover:text-slate-900 transition-opacity opacity-0 group-hover:opacity-100"
                            aria-label="次へ"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
                        <div className="flex -ml-4">
                            {cards.map((card, index) => (
                                <div
                                    key={card.id}
                                    className="flex-[0_0_92%] sm:flex-[0_0_80%] lg:flex-[0_0_70%] min-w-0 pl-4"
                                >
                                    <CardItem card={card} priority={index < 2} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ドットインジケーター */}
                <div className="flex justify-center gap-2 mt-4">
                    {cards.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                index === selectedIndex
                                    ? "bg-primary-600 w-5"
                                    : "bg-slate-300 hover:bg-slate-400 w-1.5"
                            }`}
                            aria-label={`カード ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function CardItem({ card, priority }: { card: HighlightCard; priority: boolean }) {
    const content = (
        <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
            <div className="relative aspect-[2/1] sm:aspect-[5/2] overflow-hidden">
                <Image
                    src={card.image_url}
                    alt={card.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 70vw"
                    priority={priority}
                />
                {card.badge_text && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full shadow">
                        {card.badge_text}
                    </span>
                )}
            </div>
        </div>
    );

    if (!card.link_url) return content;

    const isExternal = card.link_url.startsWith("http");
    if (isExternal) {
        return (
            <a href={card.link_url} target="_blank" rel="noopener noreferrer" className="block">
                {content}
            </a>
        );
    }

    return (
        <Link href={card.link_url} className="block">
            {content}
        </Link>
    );
}

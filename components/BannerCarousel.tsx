"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";

interface Banner {
    id: string;
    title: string;
    image_url: string;
    link_url: string | null;
}

interface BannerCarouselProps {
    banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: "center" },
        [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        onSelect();
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback(
        (index: number) => emblaApi?.scrollTo(index),
        [emblaApi]
    );

    if (banners.length === 0) return null;

    return (
        <section className="py-8 sm:py-12 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="overflow-hidden rounded-2xl shadow-sm" ref={emblaRef}>
                        <div className="flex">
                            {banners.map((banner, index) => {
                                const slide = (
                                    <div className="relative aspect-[16/5] w-full">
                                        <Image
                                            src={banner.image_url}
                                            alt={banner.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 1024px"
                                            priority={index === 0}
                                        />
                                    </div>
                                );

                                if (banner.link_url) {
                                    const isExternal = banner.link_url.startsWith("http");
                                    if (isExternal) {
                                        return (
                                            <a
                                                key={banner.id}
                                                href={banner.link_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-[0_0_100%] min-w-0 cursor-pointer"
                                            >
                                                {slide}
                                            </a>
                                        );
                                    }
                                    return (
                                        <Link
                                            key={banner.id}
                                            href={banner.link_url}
                                            className="flex-[0_0_100%] min-w-0 cursor-pointer"
                                        >
                                            {slide}
                                        </Link>
                                    );
                                }

                                return (
                                    <div key={banner.id} className="flex-[0_0_100%] min-w-0">
                                        {slide}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {banners.length > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollTo(index)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                        index === selectedIndex
                                            ? "bg-primary-600 w-6"
                                            : "bg-slate-300 hover:bg-slate-400 w-2.5"
                                    }`}
                                    aria-label={`バナー ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

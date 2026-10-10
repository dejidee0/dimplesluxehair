"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MoveRight, Play } from "lucide-react";

const stockTiles = [
  {
    src: "/images/client-media/deep-wave-bundles.jpg",
    alt: "Deep wave hair bundles arranged on a clean white background",
    label: "Deep wave",
  },
  {
    src: "/images/client-media/straight-bundles.jpg",
    alt: "Three sleek straight human-hair bundles",
    label: "Sleek straight",
  },
  {
    src: "/images/client-media/body-wave-closure.jpg",
    alt: "Body wave lace closure showing the lace base and curl pattern",
    label: "Closures",
  },
  {
    src: "/images/client-media/brand-archive.jpg",
    alt: "Original Dimplesluxe Hair That Holds Its Own brand artwork",
    label: "From the archive",
    archive: true,
  },
];

const crochetNotes = [
  {
    src: "/images/client-media/feather-crochet-specs.jpg",
    alt: "Feather crochet hair product specifications including material, length, weight and colour",
    label: "The specification",
  },
  {
    src: "/images/client-media/feather-crochet-features.jpg",
    alt: "Feather crochet construction and pre-separated strand details",
    label: "The construction",
  },
  {
    src: "/images/client-media/feather-crochet-installation.jpg",
    alt: "Four-step visual installation guide for pre-looped feather crochet hair",
    label: "The installation",
  },
];

export default function ClientMediaStory() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPlayback = () => {
      if (!video) return;
      if (motionPreference.matches) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    syncPlayback();
    motionPreference.addEventListener?.("change", syncPlayback);
    return () => motionPreference.removeEventListener?.("change", syncPlayback);
  }, []);

  return (
    <>
      <section className="overflow-hidden bg-black py-20 text-white sm:py-28" aria-labelledby="real-texture-title">
        <div className="luxe-shell">
          <div className="grid gap-7 border-b border-white/20 pb-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <p className="text-[0.64rem] font-black uppercase tracking-[0.22em] text-[#ff5da6]">Client-supplied / Real texture</p>
              <h2 id="real-texture-title" className="mt-4 max-w-[11ch] text-[clamp(3.5rem,7.6vw,7.6rem)] font-black uppercase leading-[.84] tracking-[-0.075em]">
                See the hair. Feel the difference.
              </h2>
            </div>
            <div className="lg:pb-2">
              <p className="max-w-lg text-sm font-medium leading-7 text-white/62 sm:text-base">
                A closer look at the bundles, closures, texture and movement shared directly by Dimplesluxe.
              </p>
              <Link href="/products" className="mt-6 inline-flex items-center gap-3 border-b-2 border-[#ff1783] pb-2 text-[0.68rem] font-black uppercase tracking-[0.14em]">
                Shop the live collection <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.18fr_.82fr]">
            <figure className="group relative min-h-[540px] overflow-hidden bg-[#151515] sm:min-h-[660px] lg:min-h-[760px]">
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                controls
                preload="metadata"
                poster="/images/client-media/feather-crochet-finish.jpg"
                className="absolute inset-0 h-full w-full object-cover"
                aria-label="Dimplesluxe hair shown in motion"
              >
                <source src="/images/client-media/real-hair-motion.mp4" type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
              <div className="pointer-events-none absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.13em] text-black">
                <Play size={12} fill="currentColor" /> Hair in motion
              </div>
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-12 flex items-end justify-between gap-5 p-5 sm:p-8">
                <div>
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#ff5da6]">Movement check</p>
                  <p className="mt-2 max-w-[12ch] text-[clamp(2rem,4vw,4.2rem)] font-black uppercase leading-[.88] tracking-[-0.06em]">Texture that speaks before you do.</p>
                </div>
              </figcaption>
            </figure>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <figure className="group relative min-h-[420px] overflow-hidden bg-[#181818] sm:col-span-2 lg:min-h-0">
                <Image
                  src="/images/client-media/body-wave-display.jpg"
                  alt="Glossy body wave bundles displayed together"
                  fill
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <figcaption className="absolute bottom-0 left-0 p-5 sm:p-6">
                  <span className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-[#ff5da6]">Body wave / Luster study</span>
                  <p className="mt-2 text-2xl font-black uppercase tracking-[-0.04em]">Soft definition. High shine.</p>
                </figcaption>
              </figure>

              <figure className="group relative aspect-square overflow-hidden bg-[#181818]">
                <Image src="/images/client-media/body-wave-inventory.jpg" alt="Rows of body wave bundles prepared as stock" fill sizes="(min-width: 1024px) 20vw, 46vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/72 px-4 py-3 text-[0.58rem] font-black uppercase tracking-[0.16em]">Bundle preparation</figcaption>
              </figure>

              <figure className="group relative aspect-square overflow-hidden bg-[#181818]">
                <Image src="/images/client-media/straight-inventory.jpg" alt="Straight hair bundles packed as inventory" fill sizes="(min-width: 1024px) 20vw, 46vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/72 px-4 py-3 text-[0.58rem] font-black uppercase tracking-[0.16em]">Fresh inventory</figcaption>
              </figure>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stockTiles.map((tile) => (
              <figure key={tile.src} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#181818]">
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    fill
                    sizes="(min-width: 1024px) 23vw, (min-width: 640px) 24vw, 46vw"
                    className={`object-cover transition duration-700 group-hover:scale-[1.04] ${tile.archive ? "grayscale" : ""}`}
                  />
                </div>
                <figcaption className="flex items-center justify-between border-t border-white/20 py-3 text-[0.58rem] font-black uppercase tracking-[0.15em] text-white/62">
                  <span>{tile.label}</span><span className="text-[#ff1783]">/</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1f6] py-20 text-black sm:py-28" aria-labelledby="crochet-guide-title">
        <div className="luxe-shell">
          <div className="grid gap-7 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
            <div>
              <p className="luxe-kicker">Hair notes / Feather crochet</p>
              <h2 id="crochet-guide-title" className="luxe-display mt-4 max-w-[10ch] text-[clamp(3.4rem,7vw,7rem)]">The look, decoded.</h2>
            </div>
            <div className="lg:pb-2">
              <p className="max-w-xl text-sm font-medium leading-7 text-black/62 sm:text-base">
                See the finished body-wave look, then explore the supplied construction and installation guide before choosing your style.
              </p>
              <Link href="/concierge" className="luxe-link mt-6">Ask about feather crochet <MoveRight size={17} /></Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[.82fr_1.18fr]">
            <figure className="group relative min-h-[560px] overflow-hidden bg-white lg:min-h-[760px]">
              <Image src="/images/client-media/feather-crochet-finish.jpg" alt="Finished body wave feather crochet style beside the hair texture" fill sizes="(min-width: 1024px) 40vw, 92vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <p className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-[#ff5da6]">Finished look</p>
                <p className="mt-3 max-w-[12ch] text-[clamp(2rem,4vw,4rem)] font-black uppercase leading-[.9] tracking-[-0.055em]">Body and movement without the guesswork.</p>
              </figcaption>
            </figure>

            <div className="grid gap-4">
              <figure className="relative min-h-[330px] overflow-hidden border border-black/10 bg-white sm:min-h-[430px]">
                <Image src="/images/client-media/feather-crochet-style-guide.jpg" alt="Feather crochet style guide showing the strand and finished braided look" fill sizes="(min-width: 1024px) 55vw, 92vw" className="object-contain" />
              </figure>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {crochetNotes.map((note, index) => (
                  <figure key={note.src} className={`group ${index === 2 ? "col-span-2 sm:col-span-1" : ""}`}>
                    <div className="relative aspect-square overflow-hidden border border-black/10 bg-white">
                      <Image src={note.src} alt={note.alt} fill sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 46vw" className="object-contain transition duration-500 group-hover:scale-[1.025]" />
                    </div>
                    <figcaption className="border-t border-black/15 py-3 text-[0.58rem] font-black uppercase tracking-[0.14em] text-black/58">
                      0{index + 1} / {note.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

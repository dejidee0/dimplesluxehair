"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const slides = [
  {
    name: "Body wave",
    image: "/images/dimplesluxe-hero-2026.png",
    mobilePosition: "78% center",
    kicker: "Premium human hair collection",
    title: <>Luxury hair,<br />redefined<span className="text-[#ff1783]">.</span></>,
    copy: "Discover our premium collection of 100% virgin human hair bundles, extensions and luxury hair products. Quality guaranteed, beauty delivered.",
    primary: { label: "Shop collection", href: "/products" },
    secondary: { label: "Find your texture", href: "/find-your-luxe" },
    light: false,
    align: "left",
  },
  {
    name: "Curly bundles",
    image: "/images/dimplesluxe-hero-curly-2026.png",
    mobilePosition: "72% center",
    kicker: "Deep wave / Curly bundles",
    title: <>Definition from<br />every angle<span className="text-[#ff1783]">.</span></>,
    copy: "Full, glossy curls with the movement and density to make every look feel intentional—from everyday volume to the biggest entrance.",
    primary: { label: "Shop curly hair", href: "/products?category=curly-bundles" },
    secondary: { label: "Request custom order", href: "/concierge" },
    light: false,
    align: "left",
  },
  {
    name: "Sleek straight",
    image: "/images/dimplesluxe-hero-straight-2026.png",
    mobilePosition: "32% center",
    kicker: "Straight lengths / Clean finish",
    title: <>Sleek never<br />means subtle<span className="text-[#ff1783]">.</span></>,
    copy: "Smooth, high-shine lengths made for sharp parts, fluid movement and a finish that stays polished from every direction.",
    primary: { label: "Shop straight hair", href: "/products?texture=Straight" },
    secondary: { label: "Explore all products", href: "/products" },
    light: true,
    align: "right",
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-7, 7]), { stiffness: 90, damping: 18 });
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [6, -6]), { stiffness: 90, damping: 18 });
  const floatX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-18, 18]), { stiffness: 80, damping: 20 });
  const floatY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-12, 12]), { stiffness: 80, damping: 20 });
  const slide = slides[active];

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const changeSlide = (next) => setActive((next + slides.length) % slides.length);
  const moveDepth = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };
  const resetDepth = () => {
    pointerX.set(0);
    pointerY.set(0);
    setPaused(false);
  };

  return (
    <section
      className={`dl-hero relative isolate min-h-[720px] overflow-hidden lg:min-h-[calc(100vh-104px)] ${slide.light ? "bg-[#efefef] text-black" : "bg-black text-white"}`}
      onPointerMove={moveDepth}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={resetDepth}
      aria-roledescription="carousel"
      aria-label="Dimplesluxe featured collections"
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={slide.image}
          src={slide.image}
          alt={`${slide.name} Dimplesluxe campaign`}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.025 }}
          transition={{ opacity: { duration: 0.75 }, scale: { duration: 6.5, ease: "linear" } }}
          className="absolute inset-0 h-full w-full object-cover sm:object-center"
          style={{ objectPosition: slide.mobilePosition }}
        />
      </AnimatePresence>

      <div className={`absolute inset-0 transition-colors duration-700 ${slide.light ? "bg-[linear-gradient(270deg,rgba(255,255,255,.96)_0%,rgba(255,255,255,.84)_42%,rgba(255,255,255,.08)_77%)]" : "bg-[linear-gradient(90deg,rgba(0,0,0,.94)_0%,rgba(0,0,0,.72)_39%,rgba(0,0,0,.06)_76%)]"}`} />
      {!slide.light && <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.7)_0%,transparent_38%)] lg:hidden" />}
      <div className="dl-hero-noise absolute inset-0 opacity-25" />

      <motion.div className="dl-hero-depth absolute right-[8%] top-[18%] hidden h-48 w-48 rounded-full border border-white/20 lg:block" style={{ rotateX, rotateY, x: floatX, y: floatY }} aria-hidden="true">
        <div className="absolute inset-5 rounded-full border border-[#ff1783]/65" />
        <div className="absolute inset-12 rounded-full bg-[#ff1783]/10 shadow-[0_0_70px_rgba(255,23,131,.45)] backdrop-blur-sm" />
      </motion.div>

      <div className="luxe-shell relative flex min-h-[720px] flex-col justify-between py-8 lg:min-h-[calc(100vh-104px)] lg:py-10">
        <div className={`flex items-center gap-3 text-[0.6rem] font-black uppercase tracking-[0.24em] ${slide.light ? "text-black" : "text-white"}`}>
          <span className="h-2.5 w-2.5 bg-[#ff1783]" />
          100% virgin human hair / UK — Worldwide
        </div>

        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
            transition={{ duration: 0.58, ease: [0.2, 0.7, 0.2, 1] }}
            className={`relative z-10 max-w-[800px] pb-32 pt-24 sm:pb-28 ${slide.align === "right" ? "ml-auto text-right" : ""}`}
          >
            <p className="mb-5 text-[0.65rem] font-black uppercase tracking-[0.23em] text-[#f51578] sm:text-xs">{slide.kicker}</p>
            <h1 className="dl-hero-title text-[clamp(2.85rem,12vw,4.2rem)] sm:text-[clamp(4.9rem,8.7vw,9.4rem)]">{slide.title}</h1>
            <p className={`mt-7 max-w-lg text-sm font-semibold leading-6 sm:text-base sm:leading-7 ${slide.align === "right" ? "ml-auto" : ""} ${slide.light ? "text-black/66" : "text-white/74"}`}>{slide.copy}</p>
            <div className={`mt-8 flex flex-col gap-3 sm:flex-row ${slide.align === "right" ? "sm:justify-end" : ""}`}>
              <Link href={slide.primary.href} className="luxe-button-pink">{slide.primary.label} <ArrowUpRight size={17} /></Link>
              <Link href={slide.secondary.href} className={slide.light ? "luxe-button-outline-dark" : "luxe-button-glass"}>{slide.secondary.label} <ArrowRight size={17} /></Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className={`absolute bottom-6 left-0 right-0 z-20 flex items-end justify-between gap-5 ${slide.light ? "text-black" : "text-white"}`}>
          <div className="flex min-w-0 flex-1 gap-2 sm:gap-4">
            {slides.map((item, index) => (
              <button key={item.name} onClick={() => setActive(index)} className="group min-w-0 flex-1 text-left sm:max-w-[160px]" aria-label={`Show ${item.name}`} aria-current={active === index ? "true" : undefined}>
                <span className={`mb-2 hidden text-[0.54rem] font-black uppercase tracking-[0.14em] sm:block ${active === index ? "opacity-100" : "opacity-45"}`}>0{index + 1} / {item.name}</span>
                <span className={`block h-[3px] overflow-hidden ${slide.light ? "bg-black/15" : "bg-white/20"}`}><motion.span className="block h-full bg-[#ff1783]" initial={false} animate={{ width: active === index ? "100%" : "0%" }} transition={{ duration: active === index && !paused ? 6.5 : 0.25, ease: "linear" }} /></span>
              </button>
            ))}
          </div>
          <div className="flex shrink-0 gap-2 pr-1">
            <button onClick={() => changeSlide(active - 1)} className={`grid h-11 w-11 place-items-center rounded-full border transition hover:bg-[#ff1783] hover:text-black ${slide.light ? "border-black/25" : "border-white/30"}`} aria-label="Previous campaign"><ArrowLeft size={18} /></button>
            <button onClick={() => changeSlide(active + 1)} className={`grid h-11 w-11 place-items-center rounded-full border transition hover:bg-[#ff1783] hover:text-black ${slide.light ? "border-black/25" : "border-white/30"}`} aria-label="Next campaign"><ArrowRight size={18} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

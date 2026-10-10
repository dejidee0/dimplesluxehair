"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useCartStore, useAuthStore } from "../../lib/store";

const links = [
  { label: "All products", href: "/products" },
  { label: "Body waves", href: "/products?category=body-waves" },
  { label: "Curly bundles", href: "/products?category=curly-bundles" },
  { label: "Kinky hair", href: "/products?category=kinky-hair", children: [
    { label: "Afro kinky bulk", href: "/products?category=afro-kinky-bulk" },
    { label: "Afro kinky twist", href: "/products?category=afro-kinky-twist" },
  ] },
  { label: "Synthetics", href: "/products?category=synthetics", children: [
    { label: "French curls", href: "/products?category=french-curls" },
    { label: "Pre-stretched extensions", href: "/products?category=prestreched-extensions" },
  ] },
  { label: "Hair match", href: "/find-your-luxe" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { getItemCount, currency, setCurrency } = useCartStore();
  const { user } = useAuthStore();
  const itemCount = mounted ? getItemCount() : 0;

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 bg-white text-black transition-shadow ${scrolled ? "shadow-[0_12px_35px_rgba(0,0,0,.1)]" : ""}`}>
        <div className="flex h-8 items-center justify-between bg-black px-4 text-center text-[0.51rem] font-extrabold uppercase tracking-[0.12em] text-white sm:text-[0.62rem] sm:tracking-[0.18em]">
          <div className="flex-1 text-center">
            <span className="mr-2 inline-block h-1.5 w-1.5 bg-[#ff1783]" /> Free UK delivery £150+ <span className="hidden sm:inline">&nbsp; / &nbsp;30-day returns &nbsp; / &nbsp;Worldwide tracked shipping</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-white/20 pl-3">
            <button
              onClick={() => setCurrency("GBP")}
              className={`transition ${currency === "GBP" ? "font-black text-[#ff1783]" : "text-white/60 hover:text-white"}`}
            >
              GBP (£)
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={() => setCurrency("NGN")}
              className={`transition ${currency === "NGN" ? "font-black text-[#ff1783]" : "text-white/60 hover:text-white"}`}
            >
              NGN (₦)
            </button>
          </div>
        </div>
        <div className="luxe-shell flex h-[72px] items-center justify-between gap-2 sm:gap-5">
          <button onClick={() => setMenuOpen(true)} className="grid h-11 w-11 place-items-center border border-black/15 lg:hidden" aria-label="Open menu"><Menu size={20} /></button>

          <Link href="/" className="shrink-0 leading-none" aria-label="Dimplesluxe home">
            <span className="block text-[1.28rem] font-black uppercase tracking-[-0.075em] sm:text-[1.55rem]">Dimples<span className="text-[#f51578]">luxe</span></span>
            <span className="mt-1 block text-[0.43rem] font-extrabold uppercase tracking-[0.38em] text-black/45">The hair destination</span>
          </Link>

          <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary navigation">
            {links.map((link) => <div key={link.href} className="group/nav relative py-6"><Link href={link.href} className="dl-nav-link text-[0.62rem] font-extrabold uppercase tracking-[0.1em]">{link.label}</Link>{link.children && <div className="pointer-events-none absolute left-1/2 top-[62px] w-64 -translate-x-1/2 translate-y-2 border-t-2 border-[#ff1783] bg-black p-2 opacity-0 shadow-2xl transition duration-200 group-hover/nav:pointer-events-auto group-hover/nav:translate-y-0 group-hover/nav:opacity-100">{link.children.map((child) => <Link key={child.href} href={child.href} className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.12em] text-white/70 last:border-0 hover:bg-[#ff1783] hover:text-black">{child.label}<span>↗</span></Link>)}</div>}</div>)}
          </nav>

          <div className="flex items-center gap-0.5">
            <Link href="/search" className="hidden h-11 w-10 place-items-center transition hover:bg-[#f5f5f5] sm:grid" aria-label="Search"><Search size={19} strokeWidth={2.2} /></Link>
            <Link href={user ? "/account" : "/auth/login"} className="hidden h-11 w-10 place-items-center transition hover:bg-[#f5f5f5] sm:grid" aria-label="Account"><UserRound size={19} strokeWidth={2.2} /></Link>
            <Link href="/cart" className="relative grid h-11 w-10 place-items-center transition hover:bg-[#f5f5f5]" aria-label={`Bag, ${itemCount} items`}>
              <ShoppingBag size={19} strokeWidth={2.2} />
              {itemCount > 0 && <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#f51578] px-1 text-[0.54rem] font-black text-white">{itemCount}</span>}
            </Link>
            <Link href="/concierge" className="ml-2 hidden bg-black px-4 py-3 text-[0.57rem] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#ff1783] hover:text-black 2xl:inline-flex">Custom order</Link>
          </div>
        </div>
      </header>
      <div className="h-[104px]" />

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-black text-white lg:hidden">
          <div className="flex h-20 items-center justify-between border-b border-white/15 px-5">
            <span className="text-2xl font-black uppercase tracking-[-0.075em]">Dimples<span className="text-[#ff1783]">luxe</span></span>
            <button onClick={() => setMenuOpen(false)} className="grid h-11 w-11 place-items-center border border-white/25" aria-label="Close menu"><X size={21} /></button>
          </div>
          <nav className="flex h-[calc(100%-5rem)] flex-col justify-between px-5 py-8" aria-label="Mobile navigation">
            <div>
              {links.map((link, index) => <div key={link.href} className="border-b border-white/15"><Link href={link.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-5 text-[clamp(2rem,9vw,3.4rem)] font-black uppercase leading-none tracking-[-0.06em]"><span>{link.label}</span><span className="text-xs tracking-normal text-[#ff1783]">0{index + 1}</span></Link>{link.children && <div className="mb-4 grid grid-cols-2 gap-2">{link.children.map((child) => <Link key={child.href} href={child.href} onClick={() => setMenuOpen(false)} className="border border-white/15 px-3 py-3 text-[0.62rem] font-black uppercase tracking-[0.1em] text-white/65">{child.label}</Link>)}</div>}</div>)}
            </div>
            <Link href={user ? "/account" : "/auth/login"} onClick={() => setMenuOpen(false)} className="luxe-button-pink w-full">{user ? "My account" : "Sign in"}</Link>
          </nav>
        </div>
      )}
    </>
  );
}

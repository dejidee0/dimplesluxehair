"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
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
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
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
    if (!menuOpen) return undefined;
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      Object.assign(body.style, previous);
      window.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
      menuButtonRef.current?.focus();
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setExpandedMenu(null);
  };

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 bg-white text-black transition-shadow ${scrolled ? "shadow-[0_12px_35px_rgba(0,0,0,.1)]" : ""}`}>
        <div className="flex h-8 min-w-0 items-center justify-between overflow-hidden bg-black px-3 text-[0.5rem] font-extrabold uppercase tracking-[0.09em] text-white sm:px-4 sm:text-[0.62rem] sm:tracking-[0.18em]">
          <div className="min-w-0 flex-1 truncate text-left sm:text-center">
            <span className="mr-2 inline-block h-1.5 w-1.5 bg-[#ff1783]" />Free UK delivery £150+
            <span className="hidden sm:inline">&nbsp; / &nbsp;30-day returns &nbsp; / &nbsp;Worldwide tracked shipping</span>
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-1.5 border-l border-white/20 pl-2 sm:pl-3">
            <button type="button" onClick={() => setCurrency("GBP")} className={`transition ${currency === "GBP" ? "font-black text-[#ff1783]" : "text-white/60 hover:text-white"}`}>GBP (£)</button>
            <span className="text-white/30">|</span>
            <button type="button" onClick={() => setCurrency("NGN")} className={`transition ${currency === "NGN" ? "font-black text-[#ff1783]" : "text-white/60 hover:text-white"}`}>NGN (₦)</button>
          </div>
        </div>

        <div className="luxe-shell grid h-[72px] grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 lg:flex lg:justify-between lg:gap-5">
          <button ref={menuButtonRef} type="button" onClick={() => setMenuOpen(true)} className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff1783] lg:hidden" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="mobile-navigation">
            <Menu size={21} />
          </button>

          <Link href="/" className="min-w-0 justify-self-center text-center leading-none lg:shrink-0 lg:justify-self-auto lg:text-left" aria-label="Dimplesluxe home">
            <span className="block whitespace-nowrap text-[1.12rem] font-black uppercase tracking-[-0.075em] min-[360px]:text-[1.25rem] sm:text-[1.55rem]">Dimples<span className="text-[#f51578]">luxe</span></span>
            <span className="mt-1 hidden text-[0.43rem] font-extrabold uppercase tracking-[0.38em] text-black/45 min-[360px]:block">The hair destination</span>
          </Link>

          <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary navigation">
            {links.map((link) => (
              <div key={link.href} className="group/nav relative py-6">
                <Link href={link.href} className="dl-nav-link text-[0.62rem] font-extrabold uppercase tracking-[0.1em]">{link.label}</Link>
                {link.children && <div className="pointer-events-none absolute left-1/2 top-[62px] w-64 -translate-x-1/2 translate-y-2 border-t-2 border-[#ff1783] bg-black p-2 opacity-0 shadow-2xl transition duration-200 group-hover/nav:pointer-events-auto group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
                  {link.children.map((child) => <Link key={child.href} href={child.href} className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.12em] text-white/70 last:border-0 hover:bg-[#ff1783] hover:text-black">{child.label}<span>↗</span></Link>)}
                </div>}
              </div>
            ))}
          </nav>

          <div className="flex items-center justify-self-end gap-0.5">
            <Link href="/search" className="hidden h-11 w-10 place-items-center transition hover:bg-[#f5f5f5] sm:grid" aria-label="Search"><Search size={19} strokeWidth={2.2} /></Link>
            <Link href={user ? "/account" : "/auth/login"} className="hidden h-11 w-10 place-items-center transition hover:bg-[#f5f5f5] sm:grid" aria-label="Account"><UserRound size={19} strokeWidth={2.2} /></Link>
            <Link href="/cart" className="relative grid h-11 w-11 place-items-center rounded-full transition hover:bg-[#f5f5f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff1783]" aria-label={`Bag, ${itemCount} items`}>
              <ShoppingBag size={19} strokeWidth={2.2} />
              {itemCount > 0 && <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#f51578] px-1 text-[0.54rem] font-black text-white">{itemCount}</span>}
            </Link>
            <Link href="/concierge" className="ml-2 hidden bg-black px-4 py-3 text-[0.57rem] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#ff1783] hover:text-black 2xl:inline-flex">Custom order</Link>
          </div>
        </div>
      </header>
      <div className="h-[104px]" />

      {menuOpen && (
        <div id="mobile-navigation" className="fixed inset-0 z-[70] flex h-[100dvh] flex-col overflow-hidden bg-black text-white lg:hidden" role="dialog" aria-modal="true" aria-label="Main menu">
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/15 px-4 sm:px-5">
            <span className="text-[1.45rem] font-black uppercase tracking-[-0.075em]">Dimples<span className="text-[#ff1783]">luxe</span></span>
            <button ref={closeButtonRef} type="button" onClick={closeMenu} className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff1783]" aria-label="Close menu"><X size={21} /></button>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto overscroll-contain px-4 py-4 sm:px-5" aria-label="Mobile navigation">
            <div>
              {links.map((link, index) => {
                const isExpanded = expandedMenu === link.href;
                return <div key={link.href} className="border-b border-white/15">
                  <div className="flex min-h-[58px] items-center gap-2">
                    <span className="w-7 shrink-0 text-[0.62rem] font-black tracking-[0.1em] text-[#ff1783]">0{index + 1}</span>
                    <Link href={link.href} onClick={closeMenu} className="flex min-h-[58px] min-w-0 flex-1 items-center py-3 text-[clamp(1.45rem,6.7vw,1.8rem)] font-black uppercase leading-[1.02] tracking-[-0.045em] transition hover:text-[#ff5da6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff1783]">{link.label}</Link>
                    {link.children && <button type="button" onClick={() => setExpandedMenu(isExpanded ? null : link.href)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff1783]" aria-label={`${isExpanded ? "Collapse" : "Expand"} ${link.label} subcategories`} aria-expanded={isExpanded} aria-controls={`submenu-${index}`}>
                      <ChevronDown size={19} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>}
                  </div>
                  {link.children && isExpanded && <div id={`submenu-${index}`} className="mb-3 ml-7 border-l border-[#ff1783]/60 pl-4">
                    {link.children.map((child) => <Link key={child.href} href={child.href} onClick={closeMenu} className="flex min-h-11 items-center border-b border-white/10 py-2 text-[0.92rem] font-bold text-white/70 transition last:border-0 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff1783]">{child.label}</Link>)}
                  </div>}
                </div>;
              })}
            </div>
            <div className="sticky bottom-0 mt-5 border-t border-white/15 bg-black pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Link href={user ? "/account" : "/auth/login"} onClick={closeMenu} className="luxe-button-pink w-full">{user ? "My account" : "Sign in"}</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Gem,
  Mail,
  MoveRight,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const collections = [
  {
    number: "01",
    title: "Body waves",
    badge: "100% Virgin Hair",
    note: "Soft movement, natural luster and versatile everyday volume.",
    href: "/products?category=body-waves",
    image: "/images/category-body-wave-clean.png",
  },
  {
    number: "02",
    title: "Curly bundles",
    badge: "Defined HD Curls",
    note: "Defined, bouncy spirals with maximum volume and full density.",
    href: "/products?category=curly-bundles",
    image: "/images/category-curly-bundles-clean.png",
  },
  {
    number: "03",
    title: "Afro kinky bulk",
    badge: "Natural 4C Texture",
    note: "Loose 4C-inspired bulk texture for custom braiding and seamless blending.",
    href: "/products?category=afro-kinky-bulk",
    image: "/images/category-afro-kinky-bulk-clean.png",
  },
  {
    number: "04",
    title: "Afro kinky twist",
    badge: "Textured Twist Bundles",
    note: "Rich defined twists with lasting structure and wearable length.",
    href: "/products?category=afro-kinky-twist",
    image: "/images/category-afro-kinky-twist-clean.png",
  },
  {
    number: "05",
    title: "French curls",
    badge: "Bouncy Curled Ends",
    note: "Sleek braided length finished with soft, statement curled ends.",
    href: "/products?category=french-curls",
    image: "/images/category-french-curls-clean.png",
  },
  {
    number: "06",
    title: "Pre-stretched extensions",
    badge: "Tapered Braiding Fiber",
    note: "Smooth, tangle-free tapered braiding hair for lightweight installs.",
    href: "/products?category=prestreched-extensions",
    image: "/images/category-prestretched-extensions-clean.png",
  },
];

const ticker = [
  "FREE UK DELIVERY £150+",
  "30-DAY RETURNS",
  "100% VIRGIN HAIR",
  "WORLDWIDE SHIPPING",
  "PREMIUM QUALITY",
];

const proof = [
  {
    icon: ShieldCheck,
    number: "100%",
    title: "Virgin hair",
    copy: "Ethically-sourced premium human hair crafted to maintain natural cuticle alignment.",
  },
  {
    icon: Gem,
    number: "LUXE",
    title: "Luxury experience",
    copy: "Personal stylist concierge, bespoke packaging, and priority tracked delivery.",
  },
  {
    icon: Star,
    number: "200+",
    title: "Happy customers",
    copy: "Join 200+ discerning clients worldwide who trust Dimplesluxe for their installs.",
  },
];

const reviews = [
  {
    name: "Aisha Thompson",
    initials: "AT",
    quote:
      "Absolutely love my Body Wave bundles! The quality is incredible, zero tangling and it blends effortlessly with my leave-out.",
  },
  {
    name: "Nia Okonkwo",
    initials: "NO",
    quote:
      "Best hair extensions I've ever purchased in the UK. The curl definition is so bouncy and lush. Will definitely order again!",
  },
  {
    name: "Zuri Davis",
    initials: "ZD",
    quote:
      "The concierge answered my questions within minutes and helped calculate my bundle count. Fast shipping and gorgeous packaging!",
  },
];

function tiltMove(event) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  event.currentTarget.style.setProperty("--rx", `${y * -7}deg`);
  event.currentTarget.style.setProperty("--ry", `${x * 7}deg`);
}

function tiltReset(event) {
  event.currentTarget.style.setProperty("--rx", "0deg");
  event.currentTarget.style.setProperty("--ry", "0deg");
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("idle");

  useEffect(() => {
    let active = true;
    async function loadFeatured() {
      // 1. Try to fetch featured products
      const { data: featured, error: featErr } = await supabase
        .from("products")
        .select(
          "*, category:categories!products_category_id_fkey(name, slug), images:product_images(id, image_url, alt_text, is_primary, sort_order, is_video)"
        )
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(4);

      if (!active) return;

      if (!featErr && featured && featured.length > 0) {
        setFeaturedProducts(featured);
        setLoading(false);
      } else {
        // Fallback to all active products so the featured section is always populated
        const { data: allActive } = await supabase
          .from("products")
          .select(
            "*, category:categories!products_category_id_fkey(name, slug), images:product_images(id, image_url, alt_text, is_primary, sort_order, is_video)"
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(4);

        if (active) {
          setFeaturedProducts(allActive || []);
          setLoading(false);
        }
      }
    }

    loadFeatured();
    return () => {
      active = false;
    };
  }, []);

  async function subscribe(event) {
    event.preventDefault();
    if (!email) return;

    setSubscribeStatus("sending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Subscription failed");
      setSubscribeStatus("sent");
      setEmail("");
      toast.success("Welcome to Dimplesluxe VIP! You’re on the list.");
    } catch {
      setSubscribeStatus("error");
      toast.error("Could not subscribe right now. Please try again.");
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-black">
      <Navbar />
      <main>
        <Hero />

        {/* Scrolling Ticker */}
        <div className="dl-ticker overflow-hidden border-y border-black bg-[#ff1783] py-4 text-black">
          <div className="dl-ticker-track flex w-max items-center gap-8 whitespace-nowrap">
            {[...ticker, ...ticker].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="flex items-center gap-8 text-xs font-black uppercase tracking-[0.16em] sm:text-sm"
              >
                <span>{item}</span>
                <span className="text-xl">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* The 6 Product Families (With Real Mannequin Images & Motion) */}
        <section className="luxe-shell py-20 sm:py-28" id="shop-collections">
          <div className="grid gap-7 border-b border-black pb-8 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
            <div>
              <p className="luxe-kicker">Visual Hair Guide &amp; Families</p>
              <h2 className="luxe-display mt-4 max-w-[12ch] text-[clamp(3.4rem,7.5vw,7.5rem)]">
                Shop your kind of luxe.
              </h2>
            </div>
            <div className="lg:pb-2">
              <p className="max-w-md text-sm font-medium leading-6 text-black/60 sm:text-base">
                Discover our signature textures shown on editorial mannequins. Click any family to filter our live catalogue or request custom lengths.
              </p>
              <Link href="/products" className="luxe-link mt-5">
                View all live products <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                href={collection.href}
                key={collection.title}
                onPointerMove={tiltMove}
                onPointerLeave={tiltReset}
                className="dl-category-card dl-tilt-card group relative flex min-h-[390px] flex-col overflow-hidden border border-black/10 bg-white p-5 text-black sm:min-h-[430px]"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[0.62rem] font-black tracking-[0.2em] text-black/45">
                    /{collection.number}
                  </span>
                  <span className="rounded-full border border-black/10 bg-[#fff2f8] px-3 py-1 text-[0.56rem] font-black uppercase tracking-wider text-[#c30059]">
                    {collection.badge}
                  </span>
                </div>

                <div className="relative my-2 min-h-0 flex-1">
                  <Image
                    src={collection.image}
                    alt={`${collection.title} hair texture on an editorial mannequin`}
                    fill
                    sizes="(min-width: 1024px) 29vw, (min-width: 640px) 46vw, 92vw"
                    className="dl-category-image object-contain object-center"
                  />
                </div>

                <div className="dl-tilt-lift relative z-10 border-t border-black/10 pt-4">
                  <p className="text-[clamp(1.65rem,2.7vw,2.7rem)] font-black uppercase leading-[.88] tracking-[-0.06em]">
                    {collection.title}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <span className="max-w-[30ch] text-[0.7rem] font-semibold leading-5 text-black/58">
                      {collection.note}
                    </span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black text-white transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-[#ff1783] group-hover:text-black">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products (Live from Database) */}
        <section className="bg-[#f5f5f5] py-20 sm:py-28">
          <div className="luxe-shell">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="luxe-kicker">Live Catalogue Selection</p>
                <h2 className="luxe-display mt-4 text-[clamp(3.4rem,7vw,7rem)]">
                  The hot list.
                </h2>
                <p className="mt-4 max-w-lg text-sm font-medium leading-6 text-black/60">
                  Real in-stock bundles and extensions pulled directly from the Dimplesluxe database.
                </p>
              </div>
              <Link href="/products" className="luxe-link">
                View all live products <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-x-6">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="animate-pulse">
                    <div className="aspect-[4/5] bg-[#dedede]" />
                    <div className="mt-4 h-4 w-2/3 bg-[#dedede]" />
                    <div className="mt-3 h-3 w-1/3 bg-[#dedede]" />
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Link
                href="/products"
                className="group mt-10 flex min-h-[230px] items-end justify-between gap-5 overflow-hidden bg-black p-6 text-white sm:p-9"
              >
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#ff5da6]">
                    Premium human hair collection
                  </p>
                  <p className="mt-4 max-w-[12ch] text-[clamp(2.7rem,7vw,6.5rem)] font-black uppercase leading-[.85] tracking-[-0.07em]">
                    Meet your next look.
                  </p>
                </div>
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#ff1783] text-black transition group-hover:rotate-12 group-hover:bg-white sm:h-24 sm:w-24">
                  <ArrowUpRight size={34} />
                </span>
              </Link>
            )}
          </div>
        </section>

        {/* Why Choose Dimplesluxe (200+ Happy Customers) */}
        <section className="bg-black py-20 text-white sm:py-28">
          <div className="luxe-shell">
            <div className="grid gap-7 lg:grid-cols-[1fr_.72fr] lg:items-end">
              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#ff5da6]">
                  Why choose Dimplesluxe
                </p>
                <h2 className="mt-5 max-w-[11ch] text-[clamp(3.8rem,8vw,8rem)] font-black uppercase leading-[.84] tracking-[-0.075em]">
                  Quality you can feel.
                </h2>
              </div>
              <div className="lg:pb-2">
                <p className="max-w-lg text-sm font-medium leading-7 text-white/60 sm:text-base">
                  Every bundle is inspected to guarantee full cuticles, natural movement, and long-lasting installs with zero shedding.
                </p>
                <div className="mt-6 flex items-center gap-3 text-sm font-black">
                  <span className="text-2xl text-[#ff1783]">4.98</span>
                  <span className="flex text-[#ff1783]" aria-label="4.98 out of 5 stars">
                    ★★★★★
                  </span>
                  <span className="text-white/45">200+ happy clients</span>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {proof.map((item) => (
                <article
                  key={item.title}
                  onPointerMove={tiltMove}
                  onPointerLeave={tiltReset}
                  className="dl-tilt-card group min-h-[320px] border border-white/16 bg-white/[.045] p-6 sm:p-8"
                >
                  <div className="dl-tilt-lift flex h-full flex-col justify-between">
                    <item.icon className="text-[#ff1783]" size={32} />
                    <div>
                      <p className="text-[clamp(3rem,6vw,6rem)] font-black uppercase leading-none tracking-[-0.07em]">
                        {item.number}
                      </p>
                      <h3 className="mt-4 text-lg font-black uppercase tracking-[-0.025em]">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
                        {item.copy}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Friendly guided Hair Match */}
        <section className="bg-black py-16 text-white sm:py-24">
          <div className="luxe-shell">
            <div className="dl-service-panel grid overflow-hidden border border-white/15 lg:grid-cols-[1.08fr_.92fr]">
              <div className="flex flex-col justify-between gap-14 p-7 sm:p-12 lg:p-14">
                <div className="flex items-center justify-between text-[0.6rem] font-black uppercase tracking-[0.19em] text-white/45">
                  <span>Find Your Luxe</span>
                  <span>About 60 seconds</span>
                </div>
                <div>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#ff1783] text-black">
                    <Sparkles size={20} />
                  </span>
                  <h2 className="mt-7 max-w-[10ch] text-[clamp(3.1rem,6.2vw,6.4rem)] font-black uppercase leading-[.85] tracking-[-0.075em]">
                    Your hair, made easy.
                  </h2>
                  <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-white/62 sm:text-base">
                    Three simple choices. We match your goal, texture and length with live products—then suggest a sensible bundle count.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between bg-[#ff1783] p-7 text-black sm:p-12 lg:p-14">
                <div className="space-y-3">
                  {["Choose the look", "Pick a texture", "See your matched edit"].map((item, index) => (
                    <div key={item} className="flex items-center gap-4 border-b border-black/20 py-4">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-black text-[0.65rem] font-black text-white">0{index + 1}</span>
                      <span className="text-sm font-black uppercase tracking-[-0.01em]">{item}</span>
                      {index === 2 && <CheckCircle2 className="ml-auto" size={18} />}
                    </div>
                  ))}
                </div>
                <Link href="/find-your-luxe" className="mt-12 inline-flex items-center justify-between border-t-2 border-black pt-5 text-sm font-black uppercase tracking-[0.12em]">
                  Start my match <MoveRight size={21} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Real Customer Reviews */}
        <section className="luxe-shell py-20 sm:py-28">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="luxe-kicker">Real customer reviews</p>
              <h2 className="luxe-display mt-4 max-w-[12ch] text-[clamp(3.6rem,7vw,7rem)]">
                Loved in real life.
              </h2>
            </div>
            <div className="flex items-center gap-3 text-sm font-black">
              <span className="text-xl text-[#f51578]">4.98</span>
              <span className="text-[#f51578]">★★★★★</span>
              <span className="text-black/50">200+ Reviews</span>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <article
                key={review.name}
                onPointerMove={tiltMove}
                onPointerLeave={tiltReset}
                className={`dl-tilt-card min-h-[340px] p-6 sm:p-8 ${
                  index === 1 ? "bg-[#ff1783] text-black" : "bg-[#f5f5f5] text-black"
                }`}
              >
                <div className="dl-tilt-lift flex h-full flex-col justify-between">
                  <Quote
                    size={30}
                    className={index === 1 ? "text-black" : "text-[#f51578]"}
                  />
                  <p className="my-8 text-lg font-bold leading-7 tracking-[-0.02em] sm:text-xl">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4 border-t border-black/15 pt-5">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-full text-xs font-black ${
                        index === 1 ? "bg-black text-white" : "bg-[#ff1783] text-black"
                      }`}
                    >
                      {review.initials}
                    </span>
                    <div>
                      <p className="text-sm font-black uppercase">{review.name}</p>
                      <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.17em] opacity-50">
                        Verified customer
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Smart, calm concierge entry */}
        <section className="luxe-shell pb-20 sm:pb-28">
          <div
            onPointerMove={tiltMove}
            onPointerLeave={tiltReset}
            className="dl-concierge-card dl-tilt-card group relative overflow-hidden border border-black/15 bg-[#fff7fb] px-6 py-9 sm:px-10 sm:py-11 lg:px-12"
          >
            <div className="dl-concierge-orbit absolute -right-14 -top-20 h-64 w-64 rounded-full border-[38px] border-[#ff1783] opacity-70" />
            <div className="dl-concierge-glint" />
            <div className="dl-tilt-lift relative grid gap-9 lg:grid-cols-[1fr_.72fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black px-3 py-1 text-[0.6rem] font-black uppercase tracking-wider text-white">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff1783] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff1783]"></span>
                  </span>
                    Stylist concierge
                </span>
                  <span className="text-[0.6rem] font-black uppercase tracking-wider text-[#c30059]">Human advice, no guesswork</span>
                </div>
                <h2 className="mt-5 max-w-[12ch] text-[clamp(2.5rem,5vw,5rem)] font-black uppercase leading-[.88] tracking-[-0.065em]">Need a second opinion?</h2>
                <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-black/64 sm:text-base">Share the look you want—even if you are not sure of the texture or length. We turn it into a clear product and bundle recommendation.</p>
              </div>
              <div>
                <div className="grid gap-2 text-xs font-bold text-black/72">
                  {["Texture and blend advice", "Bundle-count guidance", "Custom-order support"].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 border-b border-black/10 py-2.5"><CheckCircle2 size={15} className="shrink-0 text-[#e90069]" /><span>{feat}</span></div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/concierge" className="luxe-button-dark">
                    Ask the concierge <ArrowUpRight size={17} />
                </Link>
                <a
                  href="mailto:dimplesluxe@gmail.com?subject=Hair%20Consultation%20Inquiry"
                  className="luxe-button-quiet"
                >
                    Email instead
                </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Functional "New drops. Hair notes. No noise." Newsletter */}
        <section className="bg-[#ff1783] py-16 sm:py-20">
          <div className="luxe-shell grid gap-10 lg:grid-cols-[1fr_.75fr] lg:items-end">
            <div>
              <p className="text-[0.64rem] font-black uppercase tracking-[0.2em] text-black">
                VIP Early Access
              </p>
              <h2 className="mt-4 max-w-[11ch] text-[clamp(3.2rem,7vw,7rem)] font-black uppercase leading-[.84] tracking-[-0.075em] text-black">
                New drops. Hair notes. No noise.
              </h2>
            </div>

            <form onSubmit={subscribe} className="lg:pb-2">
              <label
                htmlFor="newsletter-email"
                className="text-xs font-black uppercase tracking-[0.16em] text-black"
              >
                Enter your email address
              </label>
              <div className="mt-3 flex border-b-2 border-black">
                <input
                  id="newsletter-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 bg-transparent py-4 text-base font-bold text-black outline-none placeholder:text-black/50"
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === "sending"}
                  className="flex items-center gap-2 px-3 text-xs font-black uppercase tracking-[0.13em] text-black transition hover:opacity-75 disabled:opacity-50"
                >
                  {subscribeStatus === "sending" ? "Joining..." : "Join the list"}{" "}
                  <Mail size={17} />
                </button>
              </div>

              {subscribeStatus === "sent" && (
                <p className="mt-3 text-xs font-black text-black">
                  ✓ You’re on the VIP list. Welcome to Dimplesluxe!
                </p>
              )}
              {subscribeStatus === "error" && (
                <p className="mt-3 text-xs font-black text-black">
                  Could not submit. You can also email dimplesluxe@gmail.com directly.
                </p>
              )}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

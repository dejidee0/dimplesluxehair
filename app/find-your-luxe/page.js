"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, HelpCircle, RotateCcw, ShoppingBag, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { supabase } from "../../lib/supabase";
import { useCartStore } from "../../lib/store";
import toast from "react-hot-toast";

const questions = [
  {
    key: "goal",
    eyebrow: "Step 01 / Your Style Goal",
    title: "What style are you creating?",
    copy: "Tell us your styling plan so Hair Match prioritises the right part of our live catalogue.",
    options: [
      {
        value: "bundles",
        label: "Sew-In / Bundles Install",
        note: "Virgin human hair bundles for traditional installs, leave-outs, and everyday wear.",
      },
      {
        value: "curls",
        label: "Bouncy Curls & Volume",
        note: "Defined curl patterns, maximum body, and statement texture.",
      },
      {
        value: "protective",
        label: "Protective Styling Hair",
        note: "Kinky bulk, twists, French curls, and pre-stretched braiding extensions.",
      },
      {
        value: "not-sure",
        label: "Explore Top Recommendations",
        note: "Show me the highest-rated pieces across all Dimplesluxe collections.",
      },
    ],
  },
  {
    key: "texture",
    eyebrow: "Step 02 / Preferred Texture",
    title: "Which hair texture feels like you?",
    copy: "We compare your texture preference with our active stock so you get an effortless blend.",
    options: [
      {
        value: "Body Wave",
        label: "Body Wave / Soft S-Wave",
        note: "Polished, flowing movement that holds curls and straightens easily.",
      },
      {
        value: "Curly",
        label: "Defined Curly / Bounce Curls",
        note: "Deep curls and natural volume with rich bounce and definition.",
      },
      {
        value: "Kinky",
        label: "Afro Kinky / Coily Textures",
        note: "Seamless 4A-4C natural texture match for bulk braiding or twists.",
      },
      {
        value: "Straight",
        label: "Bone Straight / Braiding Hair",
        note: "Ultra-sleek bone straight bundles or smooth pre-stretched extensions.",
      },
    ],
  },
  {
    key: "length",
    eyebrow: "Step 03 / Desired Length",
    title: "What length are you aiming for?",
    copy: "Hair Match calculates the exact bundle count and density required for your chosen length.",
    options: [
      {
        value: "16",
        label: "Short to Medium (14–16\")",
        note: "Chic shoulder-to-collarbone length. 2 bundles recommended for full install.",
      },
      {
        value: "20",
        label: "Signature Length (18–22\")",
        note: "Versatile mid-back statement length. 2 to 3 bundles recommended.",
      },
      {
        value: "26",
        label: "Dramatic Luxury (24–30\")",
        note: "Show-stopping waist-length hair. 3 to 4 bundles recommended for fullness.",
      },
    ],
  },
];

const textureTerms = {
  "Body Wave": ["body wave", "wavy", "wave"],
  Curly: ["curly", "curl", "bounce", "french"],
  Kinky: ["kinky", "coily", "afro", "twist", "bulk"],
  Straight: ["straight", "prestretch", "pre-stretch", "braid"],
};

const goalTerms = {
  bundles: ["bundle", "body wave", "human hair"],
  curls: ["curl", "curly", "bounce", "wave"],
  protective: ["kinky", "twist", "synthetic", "french", "prestretch", "braid", "bulk"],
  "not-sure": [],
};

const normalise = (val) => String(val || "").toLowerCase();
const extractDigits = (val) => Number(String(val || "").match(/\d+/)?.[0] || 0);

function scoreProduct(product, answers) {
  const cat = product.category || {};
  const haystack = normalise([product.name, cat.name, cat.slug, ...(product.textures || [])].join(" "));
  let score = product.is_featured ? 2 : 1;

  for (const term of goalTerms[answers.goal] || []) {
    if (haystack.includes(term)) score += 4;
  }
  for (const term of textureTerms[answers.texture] || []) {
    if (haystack.includes(term)) score += 6;
  }

  const requestedLen = Number(answers.length);
  const productLengths = (product.lengths || []).map(extractDigits).filter(Boolean);
  if (requestedLen && productLengths.length) {
    const closest = Math.min(...productLengths.map((l) => Math.abs(l - requestedLen)));
    if (closest === 0) score += 5;
    else if (closest <= 4) score += 3;
  }
  return score;
}

function calculateBundleCount(lengthValue, goal) {
  if (goal === "protective") return 1;
  const len = Number(lengthValue);
  if (len >= 24) return 3;
  if (len >= 18) return 3;
  return 2;
}

export default function FindYourLuxePage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCartStore();

  const isComplete = step === questions.length;
  const currentQuestion = questions[step];
  const recommendedBundles = calculateBundleCount(answers.length, answers.goal);

  useEffect(() => {
    if (!isComplete) return;
    let active = true;

    async function findLiveMatches() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories!products_category_id_fkey(name, slug), images:product_images(id, image_url, alt_text, is_primary, sort_order, is_video)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!active) return;
      if (error || !data) {
        setProducts([]);
      } else {
        const ranked = data
          .map((prod) => ({ product: prod, score: scoreProduct(prod, answers) }))
          .sort((a, b) => b.score - a.score)
          .map(({ product }) => product)
          .slice(0, 8);
        setProducts(ranked);
      }
      setLoading(false);
    }

    findLiveMatches();
    return () => {
      active = false;
    };
  }, [isComplete, answers]);

  const recommendationTitle = useMemo(() => {
    const tex = answers.texture || "Dimplesluxe";
    const gl =
      answers.goal === "protective"
        ? "Protective Styling"
        : answers.goal === "curls"
        ? "Bouncy Curls"
        : answers.goal === "bundles"
        ? "Virgin Bundles"
        : "Signature";
    return `${tex} ${gl}`;
  }, [answers]);

  const chooseOption = (val) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: val }));
    setStep((prev) => prev + 1);
  };

  const restartQuiz = () => {
    setStep(0);
    setAnswers({});
    setProducts([]);
  };

  const addRecommendationToCart = (product) => {
    for (let i = 0; i < recommendedBundles; i++) {
      addItem(product);
    }
    toast.success(
      recommendedBundles > 1
        ? `${recommendedBundles} × ${product.name} added to your bag!`
        : `${product.name} added to your bag!`
    );
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main>
        {!isComplete ? (
          <section className="relative overflow-hidden bg-[#f6f6f4] text-black">

            <div className="luxe-shell relative grid gap-6 py-10 lg:grid-cols-[.7fr_1.3fr] lg:items-stretch lg:py-16">
              {/* Left Explanatory Sidebar */}
              <aside className="flex flex-col justify-between bg-black p-6 text-white sm:p-9 lg:min-h-[600px]">
                <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-wider text-[#ff5da6]">
                  <Sparkles size={13} /> Interactive Hair Match
                </div>

                <h1 className="mt-5 text-[clamp(2.7rem,5vw,5rem)] font-black uppercase leading-[.86] tracking-[-0.07em]">
                  No jargon. Just your look.
                </h1>

                <div className="mt-5 border-t border-white/15 pt-4 text-xs leading-6 text-white/65">
                  <p>Three quick choices help us rank the live collection and give you a useful bundle-count starting point.</p>
                </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-10 space-y-3">
                  {[
                    "Select your styling goal",
                    "Choose your natural texture match",
                    "Pick your desired length & bundle count",
                  ].map((label, idx) => (
                    <div
                      key={label}
                      className={`flex items-center gap-3 text-xs font-bold transition ${
                        idx <= step ? "text-white" : "text-white/40"
                      }`}
                    >
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full text-[0.68rem] font-black ${
                          idx < step
                            ? "bg-[#ff1783] text-black"
                            : idx === step
                            ? "border-2 border-[#ff1783] text-[#ff1783]"
                            : "border border-white/25 text-white/40"
                        }`}
                      >
                        {idx < step ? <Check size={13} /> : idx + 1}
                      </span>
                      {label}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-2">
                  {questions.map((q, idx) => (
                    <span
                      key={q.key}
                      className={`h-1 flex-1 transition-all duration-300 ${
                        idx <= step ? "bg-[#ff1783]" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-[0.6rem] font-black uppercase tracking-[0.16em] text-white/45">
                  Question {step + 1} of {questions.length}
                </p>
              </aside>

              {/* Right Interactive Question Form */}
              <div className="border border-black/10 bg-white p-6 shadow-[0_22px_70px_rgba(0,0,0,.08)] sm:p-9 lg:p-12">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#c30059]">
                  {currentQuestion.eyebrow}
                </p>
                <h2 className="mt-4 text-[clamp(2.4rem,4.5vw,4.5rem)] font-black uppercase leading-[.88] tracking-[-0.06em]">
                  {currentQuestion.title}
                </h2>
                <p className="mt-4 text-sm font-medium leading-6 text-black/55 sm:text-base">
                  {currentQuestion.copy}
                </p>

                <div className="mt-7 grid gap-3">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => chooseOption(opt.value)}
                      className="group flex min-h-[104px] items-center gap-4 border border-black/12 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-black hover:shadow-[0_10px_28px_rgba(0,0,0,.07)] sm:p-5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1f1ef] text-[0.65rem] font-black transition group-hover:bg-[#ff1783]">{String(currentQuestion.options.indexOf(opt) + 1).padStart(2, "0")}</span>
                      <div>
                        <span className="block text-lg font-black uppercase tracking-tight">
                          {opt.label}
                        </span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-black/52">
                          {opt.note}
                        </span>
                      </div>
                      <ArrowRight size={18} className="ml-auto shrink-0 text-black/35 transition group-hover:translate-x-1 group-hover:text-black" />
                    </button>
                  ))}
                </div>

                {step > 0 && (
                  <button
                    onClick={() => setStep((curr) => curr - 1)}
                    className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black/50 hover:text-black"
                  >
                    <ArrowLeft size={14} /> Back to previous question
                  </button>
                )}
              </div>
            </div>
          </section>
        ) : (
          /* Results View */
          <section className="luxe-shell py-14 sm:py-20">
            <div className="grid gap-8 border-b border-black pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="luxe-kicker">Hair Match Results / Live Catalogue</p>
                <h1 className="luxe-display mt-3 text-[clamp(2.8rem,6vw,6rem)]">
                  Your {recommendationTitle} Edit.
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-black/65 sm:text-base">
                  Based on your preferences, these live in-stock pieces match your look directly from our Supabase database. Click any piece to inspect length variants or add our bundle recommendation straight to your bag.
                </p>
              </div>
              <button onClick={restartQuiz} className="luxe-button-quiet">
                <RotateCcw size={15} /> Retake Hair Match
              </button>
            </div>

            {/* Recommended Bundle Calculation Banner */}
            <div className="mt-10 border-2 border-black bg-black p-6 text-white sm:p-10">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#ff5da6]">
                    Stylist Installation Formula
                  </p>
                  <h2 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">
                    {recommendedBundles > 1
                      ? `Recommended: ${recommendedBundles} Bundles for your chosen length (${answers.length}")`
                      : "Recommended: 1 Pack / Piece for your selected protective style"}
                  </h2>
                  <p className="mt-2 max-w-xl text-xs leading-5 text-white/70 sm:text-sm">
                    Hair lengths over 18 inches require 3 bundles for optimal fullness from root to ends without thinness. You can adjust the exact count inside your bag anytime.
                  </p>
                </div>

                {products.length > 0 && (
                  <button
                    onClick={() => addRecommendationToCart(products[0])}
                    className="luxe-button-pink shrink-0 py-4 text-xs font-black uppercase tracking-wider"
                  >
                    <ShoppingBag size={17} /> Add {recommendedBundles > 1 ? `${recommendedBundles} × ` : ""}
                    {products[0].name}
                  </button>
                )}
              </div>
            </div>

            {/* Live Matched Product Grid */}
            <div className="mt-12">
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-black/60">
                Top Matched Pieces from our Live Database:
              </h3>

              {loading ? (
                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="animate-pulse">
                      <div className="aspect-[4/5] bg-[#ededed]" />
                      <div className="mt-4 h-4 w-3/4 bg-[#ededed]" />
                      <div className="mt-3 h-3 w-1/3 bg-[#ededed]" />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="mt-8 border-2 border-dashed border-black/20 p-12 text-center">
                  <Sparkles size={32} className="mx-auto text-[#ff1783]" />
                  <h3 className="mt-4 text-2xl font-black uppercase">No exact catalogue match</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-black/60">
                    Browse every available piece or request a custom order through our concierge.
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <Link href="/products" className="luxe-button">
                      Browse all products
                    </Link>
                    <Link href="/concierge" className="luxe-button-quiet">
                      Speak with concierge
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Concierge Callout */}
            <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-black/15 pt-10 sm:flex-row sm:items-center">
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight">Need a custom blend or consultation?</h4>
                <p className="mt-1 text-sm text-black/60">
                  Send your reference photos or requirements directly to our head stylist at dimplesluxe@gmail.com.
                </p>
              </div>
              <Link href="/concierge" className="luxe-button-dark shrink-0">
                Request custom consultation <ArrowUpRight size={16} />
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

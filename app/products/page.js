"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, SlidersHorizontal, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { supabase } from "../../lib/supabase";

const textureOptions = ["All textures", "Straight", "Body Wave", "Kinky Curly", "Loose Wave", "Deep Wave"];

export default function ProductsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorySlug, setCategorySlug] = useState(params.get("category") || "");
  const [texture, setTexture] = useState(params.get("texture") || "");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setCategorySlug(params.get("category") || "");
    setTexture(params.get("texture") || "");
  }, [params]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name, slug, parent_id, sort_order")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setCategories(data || []));
  }, []);

  // Top level categories
  const topLevelCategories = useMemo(
    () => categories.filter((category) => !category.parent_id),
    [categories]
  );

  // Active category object
  const activeCategory = useMemo(() => {
    if (!categorySlug) return null;
    // Normalize prestretched spelling variations
    const target = categorySlug === "prestretched-extensions" ? "prestreched-extensions" : categorySlug;
    return categories.find((c) => c.slug === target);
  }, [categories, categorySlug]);

  // Determine active parent category if a subcategory is selected
  const activeParentCategory = useMemo(() => {
    if (!activeCategory) return null;
    if (!activeCategory.parent_id) return activeCategory;
    return categories.find((c) => c.id === activeCategory.parent_id) || null;
  }, [categories, activeCategory]);

  // Subcategories for the current parent
  const subcategoriesForParent = useMemo(() => {
    if (!activeParentCategory) return [];
    return categories.filter((c) => c.parent_id === activeParentCategory.id);
  }, [categories, activeParentCategory]);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      setLoading(true);

      // Fetch all active products with full details
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories!products_category_id_fkey(name, slug, parent_id), images:product_images(id, image_url, alt_text, is_primary, sort_order, is_video)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(60);

      if (!active) return;
      if (error || !data) {
        setProducts([]);
        setLoading(false);
        return;
      }

      let filtered = [...data];

      // Smart Category Filtering
      if (categorySlug) {
        const normSlug = categorySlug === "prestretched-extensions" ? "prestreched-extensions" : categorySlug;

        if (normSlug === "body-waves") {
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === "body-waves" ||
              p.name?.toLowerCase().includes("body wave") ||
              (p.textures || []).some((t) => t?.toLowerCase().includes("body wave"))
          );
        } else if (normSlug === "curly-bundles") {
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === "curly-bundles" ||
              p.name?.toLowerCase().includes("curly") ||
              (p.textures || []).some((t) => t?.toLowerCase().includes("curly"))
          );
        } else if (normSlug === "kinky-hair") {
          // Parent Kinky: include kinky hair and all child subcategories
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === "kinky-hair" ||
              p.category?.slug === "afro-kinky-bulk" ||
              p.category?.slug === "afro-kinky-twist" ||
              p.name?.toLowerCase().includes("kinky") ||
              (p.textures || []).some((t) => t?.toLowerCase().includes("kinky"))
          );
        } else if (normSlug === "afro-kinky-bulk") {
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === "afro-kinky-bulk" ||
              p.name?.toLowerCase().includes("bulk") ||
              (p.name?.toLowerCase().includes("kinky") && !p.name?.toLowerCase().includes("twist"))
          );
        } else if (normSlug === "afro-kinky-twist") {
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === "afro-kinky-twist" ||
              p.name?.toLowerCase().includes("twist")
          );
        } else if (normSlug === "synthetics") {
          // Parent Synthetics: include all synthetic products and subcategories
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === "synthetics" ||
              p.category?.slug === "french-curls" ||
              p.category?.slug === "prestreched-extensions" ||
              p.name?.toLowerCase().includes("synthetic") ||
              p.name?.toLowerCase().includes("prestrech") ||
              p.name?.toLowerCase().includes("french")
          );
        } else if (normSlug === "prestreched-extensions") {
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === "prestreched-extensions" ||
              (activeCategory?.id && p.subcategory_id === activeCategory.id) ||
              p.name?.toLowerCase().includes("prestrech") ||
              p.slug?.toLowerCase().includes("prestrech") ||
              p.name?.toLowerCase().includes("extension")
          );
        } else if (normSlug === "french-curls") {
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === "french-curls" ||
              (activeCategory?.id && p.subcategory_id === activeCategory.id) ||
              p.name?.toLowerCase().includes("french")
          );
        } else if (normSlug === "afro-kinky-bulk") {
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === "afro-kinky-bulk" ||
              (activeCategory?.id && p.subcategory_id === activeCategory.id) ||
              p.name?.toLowerCase().includes("bulk")
          );
        } else if (normSlug === "afro-kinky-twist") {
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === "afro-kinky-twist" ||
              (activeCategory?.id && p.subcategory_id === activeCategory.id) ||
              p.name?.toLowerCase().includes("twist")
          );
        } else {
          // Fallback exact slug or subcategory match
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === normSlug ||
              (activeCategory?.id && p.subcategory_id === activeCategory.id)
          );
        }
      }

      // Texture filter
      if (texture && texture !== "All textures") {
        filtered = filtered.filter((p) =>
          (p.textures || []).some((t) => t?.toLowerCase().includes(texture.toLowerCase())) ||
          p.name?.toLowerCase().includes(texture.toLowerCase())
        );
      }

      // Sort
      if (sort === "price-low") {
        filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      } else if (sort === "price-high") {
        filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      } else if (sort === "name") {
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      } else {
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      }

      setProducts(filtered);
      setLoading(false);
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, [categorySlug, texture, sort]);

  const selectCategory = (slug) => {
    setCategorySlug(slug);
    const query = new URLSearchParams();
    if (slug) query.set("category", slug);
    if (texture) query.set("texture", texture);
    router.push(query.toString() ? `/products?${query.toString()}` : "/products");
  };

  const selectTexture = (opt) => {
    const val = opt === "All textures" ? "" : opt;
    setTexture(val);
    const query = new URLSearchParams();
    if (categorySlug) query.set("category", categorySlug);
    if (val) query.set("texture", val);
    router.push(query.toString() ? `/products?${query.toString()}` : "/products");
  };

  const reset = () => {
    setCategorySlug("");
    setTexture("");
    router.push("/products");
  };

  const isFrenchCurlsSelected = categorySlug === "french-curls";
  const isKinkySubSelected = categorySlug === "afro-kinky-bulk" || categorySlug === "afro-kinky-twist";

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main>
        {/* Header Hero Banner */}
        <section className="border-b border-black bg-black py-12 text-white sm:py-16">
          <div className="luxe-shell">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#ff5da6]">
              {activeCategory ? `The collection / ${activeCategory.name}` : "The live collection"}
            </p>
            <h1 className="luxe-display mt-3 text-[clamp(2.8rem,6.5vw,6rem)] text-white">
              {activeCategory ? activeCategory.name : "Shop all hair."}
            </h1>
            <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-white/65 sm:text-base">
              Explore our live human hair bundles, textured kinky curls, and synthetic braiding extensions. Sourced ethically for luxury movement and seamless installs.
            </p>
          </div>
        </section>

        {/* Filter Navigation Bar */}
        <section className="border-b border-black/10 bg-[#f7f7f7] py-6">
          <div className="luxe-shell space-y-4">
            {/* Primary Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => selectCategory("")}
                className={`px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] transition ${
                  !categorySlug
                    ? "bg-[#ff1783] text-black shadow-sm"
                    : "border border-black/15 bg-white text-black hover:border-black"
                }`}
              >
                All hair
              </button>
              {topLevelCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.slug)}
                  className={`px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] transition ${
                    activeParentCategory?.slug === cat.slug
                      ? "bg-[#ff1783] text-black shadow-sm"
                      : "border border-black/15 bg-white text-black hover:border-black"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Subcategory Secondary Tabs (Shown when Synthetics or Kinky Hair is active) */}
            {subcategoriesForParent.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-black/10 pt-3">
                <span className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-black/50">
                  Sub-categories:
                </span>
                <button
                  onClick={() => selectCategory(activeParentCategory.slug)}
                  className={`px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] transition ${
                    categorySlug === activeParentCategory.slug
                      ? "bg-black text-white"
                      : "border border-black/15 bg-white text-black hover:border-black"
                  }`}
                >
                  All {activeParentCategory.name}
                </button>
                {subcategoriesForParent.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => selectCategory(sub.slug)}
                    className={`px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] transition ${
                      categorySlug === sub.slug
                        ? "bg-black text-[#ff1783]"
                        : "border border-black/15 bg-white text-black hover:border-black"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}

            {/* Refine by Texture & Sort */}
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-1.5 text-[0.6rem] font-black uppercase tracking-[0.14em] text-black/50">
                  <SlidersHorizontal size={13} /> Texture:
                </span>
                {textureOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => selectTexture(opt)}
                    className={`text-xs transition ${
                      (opt === "All textures" && !texture) || texture === opt
                        ? "font-black text-[#ff1783] underline underline-offset-4"
                        : "font-semibold text-black/60 hover:text-black"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.12em] text-black/60">
                  Sort:
                  <span className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="appearance-none border-b-2 border-black bg-transparent py-1 pr-6 text-xs font-black uppercase text-black outline-none"
                    >
                      <option value="newest">Newest drops</option>
                      <option value="price-low">Price: low to high</option>
                      <option value="price-high">Price: high to low</option>
                      <option value="name">Alphabetical (A–Z)</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
                  </span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid & Results Section */}
        <section className="luxe-shell py-10 sm:py-14">
          <div className="flex items-center justify-between pb-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-black/50">
              {loading ? "Scanning live catalogue..." : `${products.length} ${products.length === 1 ? "product" : "products"} available`}
            </p>
            {(categorySlug || texture) && (
              <button
                onClick={reset}
                className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#ff1783] underline underline-offset-4 hover:text-black"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Special message if user selected French curls or specific subcategory with incoming batch */}
          {isFrenchCurlsSelected && products.length === 0 && (
            <div className="mb-10 border-2 border-black bg-[#fff5fa] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Sparkles size={28} className="shrink-0 text-[#ff1783]" />
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">French Curls Drops Arriving</h3>
                  <p className="mt-2 text-sm leading-6 text-black/70">
                    Our high-grade synthetic French Curls with defined bouncy curled ends are currently being restocked for our next VIP drop! You can request a priority custom order right now, or browse related synthetic styles below.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/concierge" className="luxe-button-pink">
                      Request custom French Curls <ArrowUpRight size={15} />
                    </Link>
                    <button onClick={() => selectCategory("synthetics")} className="luxe-button-quiet">
                      Browse all synthetics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isKinkySubSelected && products.length === 0 && (
            <div className="mb-10 border-2 border-black bg-[#fff5fa] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Sparkles size={28} className="shrink-0 text-[#ff1783]" />
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Afro Kinky Custom Orders Open</h3>
                  <p className="mt-2 text-sm leading-6 text-black/70">
                    We source 100% human hair Afro Kinky Bulk and Twisted bundles tailored to your required fullness and length. Speak with our concierge for immediate custom dispatch.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/concierge" className="luxe-button-pink">
                      Order custom Kinky Hair <ArrowUpRight size={15} />
                    </Link>
                    <button onClick={() => selectCategory("kinky-hair")} className="luxe-button-quiet">
                      Browse Kinky collection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-[4/5] bg-[#ededed]" />
                  <div className="mt-4 h-4 w-3/4 bg-[#ededed]" />
                  <div className="mt-3 h-3 w-1/3 bg-[#ededed]" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-black/20 p-12 text-center">
              <p className="text-3xl font-black uppercase tracking-tight">No products match this exact filter.</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-black/60">
                Try selecting &ldquo;All hair&rdquo; to browse every live in-stock piece, or reach out to our Concierge for custom sourcing.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={reset} className="luxe-button">
                  View all hair
                </button>
                <Link href="/concierge" className="luxe-button-quiet">
                  Custom concierge order
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

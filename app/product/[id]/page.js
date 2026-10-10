"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { supabase } from "../../../lib/supabase";
import { useCartStore } from "../../../lib/store";
import { formatPrice } from "../../../lib/currency";
import { getProductImage } from "../../../lib/productImage";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem, currency, exchangeRate } = useCartStore();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [length, setLength] = useState("");
  const [colour, setColour] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [panel, setPanel] = useState("details");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories!products_category_id_fkey(name, slug), images:product_images(id, image_url, alt_text, is_primary, sort_order, is_video)")
        .eq("id", params.id)
        .eq("is_active", true)
        .single();

      if (!active) return;
      if (error || !data) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const images = (data.images || []).sort((first, second) => (first.sort_order || 0) - (second.sort_order || 0));
      const loaded = { ...data, images };
      setProduct(loaded);
      setLength(data.lengths?.[0] || "");
      setColour(data.colors?.[0] || "");
      setLoading(false);

      const { data: relatedData } = await supabase
        .from("products")
        .select("*, category:categories!products_category_id_fkey(name, slug), images:product_images(id, image_url, alt_text, is_primary, sort_order, is_video)")
        .eq("is_active", true)
        .neq("id", data.id)
        .eq("category_id", data.category_id)
        .limit(4);

      if (active) setRelated(relatedData || []);
    }

    if (params.id) load();
    return () => {
      active = false;
    };
  }, [params.id]);

  const fallbackImage = useMemo(() => getProductImage(product), [product]);

  const media = useMemo(() => {
    if (product?.images?.length) return product.images;
    return [{ image_url: fallbackImage, alt_text: product?.name }];
  }, [product, fallbackImage]);

  const selectedMedia = media[mediaIndex] || media[0];
  const isVideo = selectedMedia?.is_video;
  const stock = product?.stock || 0;

  const addToBag = () => {
    if (!product || stock < 1) return;
    const item = { ...product, selectedLength: length, selectedColor: colour };
    for (let index = 0; index < quantity; index += 1) addItem(item);
    toast.success(`${quantity} ${quantity === 1 ? "piece" : "pieces"} added to your bag`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Navbar />
        <main className="luxe-shell grid gap-10 py-16 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse bg-[#ededed]" />
          <div className="space-y-6 py-8">
            <div className="h-4 w-28 animate-pulse bg-[#ededed]" />
            <div className="h-16 w-3/4 animate-pulse bg-[#ededed]" />
            <div className="h-8 w-1/3 animate-pulse bg-[#ededed]" />
            <div className="h-24 w-full animate-pulse bg-[#ededed]" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Navbar />
        <main className="luxe-shell py-28 text-center">
          <p className="luxe-kicker">Catalogue update</p>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl">
            This piece is unavailable.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/60">
            It may be temporarily restocked or moved to another drop. Explore our available live collections.
          </p>
          <Link href="/products" className="luxe-button mt-8">
            Browse all products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const next = () => setMediaIndex((current) => (current + 1) % media.length);
  const previous = () => setMediaIndex((current) => (current - 1 + media.length) % media.length);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main>
        <div className="luxe-shell py-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-black/55 hover:text-[#ff1783]"
          >
            <ArrowLeft size={14} /> Back to all hair
          </Link>
        </div>

        <section className="luxe-shell grid gap-10 pb-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-24">
          {/* Gallery Media */}
          <div>
            <div className="relative aspect-[4/5] overflow-hidden bg-[#eeeeee] border border-black/10">
              {isVideo ? (
                <video src={selectedMedia.image_url} className="h-full w-full object-cover" controls playsInline />
              ) : (
                <img
                  src={selectedMedia.image_url || fallbackImage}
                  alt={selectedMedia.alt_text || product.name}
                  className="h-full w-full object-cover"
                />
              )}
              {media.length > 1 && (
                <>
                  <button
                    onClick={previous}
                    className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-white text-black shadow-md transition hover:bg-[#ff1783]"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-white text-black shadow-md transition hover:bg-[#ff1783]"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {media.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {media.map((item, index) => (
                  <button
                    key={item.id || index}
                    onClick={() => setMediaIndex(index)}
                    className={`relative h-20 w-16 shrink-0 overflow-hidden border-2 transition ${
                      mediaIndex === index ? "border-[#ff1783]" : "border-black/15 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={item.image_url || fallbackImage} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Purchase Form */}
          <div className="lg:pt-2">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#ff1783]">
              {product.category?.name || "Dimplesluxe collection"}
            </p>
            <h1 className="mt-3 text-[clamp(2.5rem,5.5vw,4.5rem)] font-black uppercase leading-[.88] tracking-[-0.06em]">
              {product.name}
            </h1>

            {product.short_description && (
              <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-black/65 sm:text-base">
                {product.short_description}
              </p>
            )}

            <div className="mt-6 flex items-baseline gap-3 border-b border-black/15 pb-6">
              <p className="text-3xl font-black uppercase tracking-tight text-black">
                {formatPrice(product.price, currency, exchangeRate)}
              </p>
              {product.original_price > product.price && (
                <p className="text-base font-bold text-black/40 line-through">
                  {formatPrice(product.original_price, currency, exchangeRate)}
                </p>
              )}
            </div>

            <div className="space-y-6 py-6">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.14em]">
                <span className="text-black/60">Configure your order</span>
                <span className={stock > 0 ? "text-[#ff1783]" : "text-black/40"}>
                  {stock > 0 ? `In Stock (${stock} available)` : "Sold out"}
                </span>
              </div>

              {product.lengths?.length > 0 && (
                <fieldset>
                  <legend className="text-xs font-black uppercase tracking-[0.14em]">
                    Length {length && <span className="text-[#ff1783]">/ {length}&quot;</span>}
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.lengths.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setLength(opt)}
                        className={`min-w-14 border px-4 py-2.5 text-xs font-black transition ${
                          length === opt
                            ? "border-black bg-black text-white"
                            : "border-black/20 bg-white text-black hover:border-black"
                        }`}
                      >
                        {opt}&quot;
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {product.colors?.length > 0 && (
                <fieldset>
                  <legend className="text-xs font-black uppercase tracking-[0.14em]">
                    Colour {colour && <span className="text-[#ff1783]">/ {colour}</span>}
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.colors.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setColour(opt)}
                        className={`border px-4 py-2.5 text-xs font-black uppercase transition ${
                          colour === opt
                            ? "border-black bg-black text-white"
                            : "border-black/20 bg-white text-black hover:border-black"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* Quantity Stepper & Add to Bag */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <div className="flex border-2 border-black bg-white">
                  <button
                    onClick={() => setQuantity((curr) => Math.max(1, curr - 1))}
                    className="grid h-14 w-12 place-items-center hover:bg-black/5"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="grid min-w-12 place-items-center text-base font-black">{quantity}</span>
                  <button
                    onClick={() => setQuantity((curr) => Math.min(stock || 1, curr + 1))}
                    className="grid h-14 w-12 place-items-center hover:bg-black/5"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={addToBag}
                  disabled={!stock}
                  className="luxe-button-pink flex-1 py-4 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingBag size={18} /> {stock ? "Add to bag" : "Sold out"}
                </button>
              </div>

              {/* Guarantees */}
              <div className="mt-8 grid gap-4 border-t border-black/15 pt-6 sm:grid-cols-3">
                {[
                  ["Ethically Sourced", "100% human hair or premium synthetic fiber."],
                  ["Fast UK Delivery", "Tracked courier dispatch with international shipping."],
                  ["Hair Concierge", "Need a recommendation? Speak directly to our stylists."],
                ].map(([title, copy]) => (
                  <div key={title}>
                    <Check size={16} className="text-[#ff1783]" />
                    <p className="mt-2 text-xs font-black uppercase tracking-tight">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-black/60">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tabbed Specs and Care Info */}
        <section className="border-t border-black/15 bg-[#fbfbfb]">
          <div className="luxe-shell py-12 sm:py-16">
            <div className="flex gap-8 border-b border-black/15">
              <button
                onClick={() => setPanel("details")}
                className={`pb-4 text-xs font-black uppercase tracking-[0.16em] transition ${
                  panel === "details" ? "border-b-2 border-[#ff1783] text-black" : "text-black/40 hover:text-black"
                }`}
              >
                The Details & Specs
              </button>
              <button
                onClick={() => setPanel("care")}
                className={`pb-4 text-xs font-black uppercase tracking-[0.16em] transition ${
                  panel === "care" ? "border-b-2 border-[#ff1783] text-black" : "text-black/40 hover:text-black"
                }`}
              >
                Care & Maintenance
              </button>
            </div>

            {panel === "details" ? (
              <div className="grid gap-8 pt-8 md:grid-cols-[1.2fr_.8fr]">
                <p className="max-w-2xl text-sm leading-7 text-black/75 sm:text-base">
                  {product.description || product.short_description || "Experience the distinct texture and longevity of Dimplesluxe hair. Formulated to retain natural luster and bounce across installs."}
                </p>
                <dl className="space-y-3 text-xs font-bold uppercase tracking-wider">
                  <div className="flex justify-between border-b border-black/10 pb-3">
                    <dt className="text-black/50">Texture</dt>
                    <dd>{product.textures?.join(" / ") || "Natural"}</dd>
                  </div>
                  <div className="flex justify-between border-b border-black/10 pb-3">
                    <dt className="text-black/50">Origin</dt>
                    <dd>{product.origin_country || "Raw / Virgin Sourced"}</dd>
                  </div>
                  {product.weight && (
                    <div className="flex justify-between border-b border-black/10 pb-3">
                      <dt className="text-black/50">Weight</dt>
                      <dd>{product.weight}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
              <div className="max-w-2xl py-8">
                <h3 className="text-2xl font-black uppercase tracking-tight">Preserving Your Dimplesluxe Hair</h3>
                <p className="mt-3 text-sm leading-7 text-black/70">
                  Wash gently using lukewarm water and sulfate-free moisturizing shampoo. Deep condition regularly, avoid heavy grease, and use a heat protectant when heat-styling. For twists and braiding extensions, sleep with a silk or satin bonnet.
                </p>
                <Link href="/concierge" className="luxe-link mt-6">
                  Speak to the hair concierge for custom routine <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="luxe-shell py-16 sm:py-24">
            <div className="flex items-end justify-between border-b border-black pb-6">
              <div>
                <p className="luxe-kicker">You might also love</p>
                <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl">
                  Complete the look.
                </h2>
              </div>
              <Link href="/products" className="luxe-link hidden sm:inline-flex">
                View all hair <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

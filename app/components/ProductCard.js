"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, Plus } from "lucide-react";
import { useCartStore, useWishlistStore } from "../../lib/store";
import { formatPrice } from "../../lib/currency";
import { getProductImage } from "../../lib/productImage";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addItem, currency, exchangeRate } = useCartStore();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistStore();
  const image = getProductImage(product);
  const saved = isWishlisted(product.id);
  const texture = Array.isArray(product.textures) ? product.textures[0] : product.textures;

  const addToBag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to your bag`);
  };

  const toggleSaved = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (saved) {
      removeFromWishlist(product.id);
      toast.success("Removed from saved pieces");
    } else {
      addToWishlist(product);
      toast.success("Saved for later");
    }
  };

  return (
    <article className="group relative">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#eeeeee]">
          <img src={image} alt={product.name} className="luxe-card-image h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute left-3 top-3 flex gap-2">
            {product.is_new && <span className="bg-black px-3 py-1.5 text-[0.56rem] font-black uppercase tracking-[0.15em] text-white">New</span>}
            {product.is_sale && <span className="bg-[#ff1783] px-3 py-1.5 text-[0.56rem] font-black uppercase tracking-[0.15em] text-black">Sale</span>}
          </div>
          <button onClick={toggleSaved} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-black shadow-sm transition hover:scale-105" aria-label={saved ? "Remove from saved pieces" : "Save this piece"}>
            <Heart size={17} className={saved ? "fill-[#ff1783] text-[#ff1783]" : ""} />
          </button>
          <button onClick={addToBag} className="absolute bottom-3 right-3 grid h-12 w-12 translate-y-3 place-items-center rounded-full bg-[#ff1783] text-black opacity-0 transition duration-300 hover:scale-105 group-hover:translate-y-0 group-hover:opacity-100" aria-label={`Add ${product.name} to bag`}><Plus size={22} /></button>
        </div>
        <div className="border-b border-black/15 py-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[0.59rem] font-black uppercase tracking-[0.17em] text-black/45">{texture || product.category?.name || "The collection"}</p>
            <ArrowUpRight size={16} className="text-[#f51578]" />
          </div>
          <h3 className="text-base font-extrabold uppercase leading-tight tracking-[-0.025em] text-black sm:text-lg">{product.name}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-sm font-bold text-black">{formatPrice(product.price, currency, exchangeRate)}</p>
            {product.original_price > product.price && <p className="text-xs text-black/40 line-through">{formatPrice(product.original_price, currency, exchangeRate)}</p>}
          </div>
          {Array.isArray(product.lengths) && product.lengths.length > 0 && <p className="mt-2 text-[0.68rem] font-semibold text-black/50">{product.lengths.slice(0, 4).join(" / ")}{product.lengths.length > 4 ? " + more" : ""}</p>}
        </div>
      </Link>
    </article>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCartStore } from "../../lib/store";
import { formatPrice } from "../../lib/currency";
import { getProductImage } from "../../lib/productImage";

export default function CartPage() {
  const { items, currency, exchangeRate, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const subtotal = getTotal();

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main className="luxe-shell py-12 sm:py-16">
        <div className="border-b border-black pb-8">
          <p className="luxe-kicker">Your shopping edit</p>
          <h1 className="luxe-display mt-3 text-[clamp(2.5rem,6vw,5.5rem)] text-black">
            Your shopping bag.
          </h1>
        </div>

        {items.length === 0 ? (
          <section className="py-24 text-center">
            <ShoppingBag className="mx-auto text-[#ff1783]" size={38} />
            <h2 className="mt-5 text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Your bag is currently empty.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-black/60">
              Discover our live catalogue or use our interactive Hair Match to find your perfect install bundles.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/products" className="luxe-button-pink">
                Shop all hair
              </Link>
              <Link href="/find-your-luxe" className="luxe-button-quiet">
                Start hair match quiz
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-10 pt-8 lg:grid-cols-[1.25fr_.75fr] lg:gap-16">
            <section>
              <div className="flex items-center justify-between pb-4 text-xs font-black uppercase tracking-wider text-black/60">
                <p>
                  {items.length} {items.length === 1 ? "piece" : "pieces"} selected
                </p>
                <button
                  onClick={clearCart}
                  className="text-xs font-black uppercase text-[#ff1783] underline underline-offset-4 hover:text-black"
                >
                  Clear bag
                </button>
              </div>

              <div className="border-t border-black/15">
                {items.map((item) => (
                  <article
                    key={`${item.id}-${item.selectedLength || ""}-${item.selectedColor || ""}`}
                    className="grid grid-cols-[94px_1fr] gap-4 border-b border-black/15 py-6 sm:grid-cols-[130px_1fr_auto] sm:gap-6"
                  >
                    <Link
                      href={`/product/${item.id}`}
                      className="aspect-[4/5] overflow-hidden border border-black/10 bg-[#eeeeee]"
                    >
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div>
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-[#ff1783]">
                        {item.textures?.[0] || item.category?.name || "Virgin Hair"}
                      </p>
                      <Link
                        href={`/product/${item.id}`}
                        className="mt-1 block text-lg font-black uppercase tracking-tight hover:text-[#ff1783]"
                      >
                        {item.name}
                      </Link>

                      {(item.selectedLength || item.selectedColor) && (
                        <p className="mt-1 text-xs font-bold text-black/60">
                          {item.selectedLength && `${item.selectedLength}"`}
                          {item.selectedLength && item.selectedColor && " / "}
                          {item.selectedColor}
                        </p>
                      )}

                      <p className="mt-2 text-sm font-black text-black">
                        {formatPrice(item.price, currency, exchangeRate)}
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex border border-black bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="grid h-9 w-9 place-items-center hover:bg-black/5"
                            aria-label={`Reduce ${item.name} quantity`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="grid min-w-9 place-items-center text-xs font-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="grid h-9 w-9 place-items-center hover:bg-black/5"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center gap-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-black/50 hover:text-[#ff1783]"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>

                    <p className="hidden self-start pt-5 text-base font-black sm:block">
                      {formatPrice(item.price * item.quantity, currency, exchangeRate)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* Order Summary Sidebar */}
            <aside className="h-fit border border-black bg-black p-6 text-white sm:p-8 lg:sticky lg:top-28">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#ff5da6]">
                Order Summary
              </p>
              <div className="mt-6 space-y-4 border-y border-white/15 py-5 text-xs font-bold uppercase tracking-wider">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal, currency, exchangeRate)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Delivery</span>
                  <span className="text-white">Calculated at checkout</span>
                </div>
              </div>
              <div className="mt-6 flex items-baseline justify-between">
                <span className="text-sm font-black uppercase tracking-wider">Total</span>
                <span className="text-3xl font-black text-[#ff1783]">
                  {formatPrice(subtotal, currency, exchangeRate)}
                </span>
              </div>
              <Link href="/checkout" className="luxe-button-pink mt-7 flex w-full justify-center">
                Proceed to checkout <ArrowRight size={16} />
              </Link>
              <p className="mt-5 text-[0.65rem] leading-5 text-white/50">
                Guaranteed secure checkout via Stripe & Paystack. Free UK delivery on orders over £150.
              </p>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

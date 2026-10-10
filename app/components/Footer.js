import Link from "next/link";
import { ArrowUpRight, Instagram } from "lucide-react";

const shopLinks = [
  ["Shop all hair", "/products"],
  ["Body waves", "/products?category=body-waves"],
  ["Curly bundles", "/products?category=curly-bundles"],
  ["Kinky hair", "/products?category=kinky-hair"],
  ["Afro kinky bulk", "/products?category=afro-kinky-bulk"],
  ["Afro kinky twist", "/products?category=afro-kinky-twist"],
  ["Synthetics", "/products?category=synthetics"],
  ["French curls", "/products?category=french-curls"],
  ["Pre-stretched extensions", "/products?category=prestreched-extensions"],
  ["Hair match quiz", "/find-your-luxe"],
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="border-b border-white/15">
        <div className="luxe-shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-[clamp(2.4rem,6vw,5.7rem)] font-black uppercase leading-[.86] tracking-[-0.075em]">Your next look<br /><span className="text-[#ff1783]">starts here.</span></p>
          <Link href="/products" className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#ff1783] text-black transition hover:rotate-12 hover:bg-white sm:h-20 sm:w-20" aria-label="Shop the collection"><ArrowUpRight size={30} /></Link>
        </div>
      </div>
      <div className="luxe-shell grid gap-12 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_.6fr_.6fr_.7fr]">
        <div>
          <p className="text-3xl font-black uppercase tracking-[-0.075em]">Dimples<span className="text-[#ff1783]">luxe</span></p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">Premium human hair, high-impact texture and a better way to find the look that feels like you.</p>
          <a href="mailto:dimplesluxe@gmail.com" className="mt-7 inline-flex border-b border-[#ff1783] pb-1 text-sm font-semibold transition hover:text-[#ff1783]">dimplesluxe@gmail.com</a>
        </div>
        <div>
          <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.2em] text-[#ff5da6]">Shop</p>
          <ul className="mt-5 space-y-3 text-sm font-semibold text-white/65">
            {shopLinks.map(([label, href]) => <li key={href}><Link href={href} className="transition hover:text-white">{label}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.2em] text-[#ff5da6]">Connect</p>
          <ul className="mt-5 space-y-3 text-sm font-semibold text-white/65">
            <li><Link href="/concierge" className="transition hover:text-white">Hair concierge</Link></li>
            <li><Link href="/account" className="transition hover:text-white">My account</Link></li>
            <li><a href="https://www.instagram.com/" className="inline-flex items-center gap-2 transition hover:text-white">Instagram <Instagram size={14} /></a></li>
          </ul>
        </div>
        <div>
          <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.2em] text-[#ff5da6]">Customer care</p>
          <ul className="mt-5 space-y-3 text-sm font-semibold text-white/65">
            <li><Link href="/about" className="transition hover:text-white">About us</Link></li>
            <li><Link href="/contact" className="transition hover:text-white">Contact us</Link></li>
            <li><Link href="/faq" className="transition hover:text-white">FAQ</Link></li>
            <li><span>Free UK delivery £150+</span></li>
            <li><span>30-day returns</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="luxe-shell flex flex-col gap-2 py-5 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Dimplesluxe</span><span>Premium hair / Unapologetic energy</span>
        </div>
      </div>
    </footer>
  );
}

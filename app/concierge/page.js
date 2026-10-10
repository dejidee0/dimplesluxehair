"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const textures = ["I am not sure yet", "Straight", "Body Wave", "Loose Wave", "Deep Wave", "Kinky Curly", "Kinky Twist"];
const lengths = ["I am not sure yet", "14–16 inches", "18–20 inches", "22–24 inches", "26 inches and beyond"];

export default function ConciergePage() {
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", desiredLook: "", preferredTexture: "", preferredLength: "", budget: "", contactPreference: "Email", notes: "" });
  const [formStep, setFormStep] = useState(1);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/consultations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your request.");
      setStatus("sent");
    } catch (submissionError) {
      setError(submissionError.message || "Unable to send your request.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4]"><Navbar /><main>
      <section className="bg-black text-white"><div className="luxe-shell grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_.72fr] lg:items-end"><div><p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#ff5da6]">The Dimplesluxe concierge</p><h1 className="luxe-display mt-4 max-w-[10ch] text-5xl sm:text-7xl">Tell us the look. We&apos;ll make it clear.</h1></div><p className="max-w-md text-sm leading-7 text-white/62 sm:text-base">You do not need to know every hair term. Share what you want and our stylist will turn it into a texture, length and bundle recommendation.</p></div></section>
      <section className="luxe-shell grid gap-6 py-10 sm:py-16 lg:grid-cols-[.62fr_1.38fr]">
        <aside className="flex flex-col justify-between bg-[#ff1783] p-6 sm:p-9"><div><p className="text-[0.62rem] font-black uppercase tracking-[0.18em]">A smarter consultation</p><h2 className="mt-4 max-w-[9ch] text-4xl font-black uppercase leading-[.9] tracking-[-.055em]">Two short steps. Human follow-up.</h2></div><div className="mt-12 space-y-3">{[["01", "The look", "Your contact, occasion and desired finish."], ["02", "The details", "Texture, length, budget and anything else."], ["03", "Our reply", "A stylist responds through your chosen channel."]].map(([number, title, copy]) => <div key={number} className="grid grid-cols-[2rem_1fr] gap-3 border-t border-black/20 pt-3"><span className="text-[0.62rem] font-black">{number}</span><div><h3 className="text-sm font-black uppercase">{title}</h3><p className="mt-1 text-xs leading-5 text-black/65">{copy}</p></div></div>)}</div></aside>
        {status === "sent" ? (
          <div className="flex min-h-[520px] flex-col justify-center bg-white p-8 shadow-[0_22px_70px_rgba(0,0,0,.08)] sm:p-12">
            <CheckCircle2 className="text-[#e90069]" size={38} />
            <p className="luxe-kicker mt-7">Request received</p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-[-.045em]">Your vision is with us.</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-black/60">Your request has been saved. Keep an eye on the contact channel you selected for the stylist&apos;s response.</p>
            <button onClick={() => { setStatus("idle"); setFormStep(1); setForm({ customerName: "", customerEmail: "", customerPhone: "", desiredLook: "", preferredTexture: "", preferredLength: "", budget: "", contactPreference: "Email", notes: "" }); }} className="luxe-button mt-8 w-fit">Start another request</button>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white p-6 shadow-[0_22px_70px_rgba(0,0,0,.08)] sm:p-10">
            <div className="flex items-center justify-between border-b border-black/10 pb-5">
              <div><p className="luxe-kicker">Your consultation</p><p className="mt-1 text-xs text-black/45">Step {formStep} of 2</p></div>
              <div className="flex w-28 gap-2"><span className="h-1.5 flex-1 rounded-full bg-[#ff1783]" /><span className={`h-1.5 flex-1 rounded-full ${formStep === 2 ? "bg-[#ff1783]" : "bg-black/10"}`} /></div>
            </div>

            {formStep === 1 ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field label="Your name" name="customerName" value={form.customerName} onChange={update} required />
                <Field label="Email address" name="customerEmail" type="email" value={form.customerEmail} onChange={update} required />
                <Field label="Phone / WhatsApp (optional)" name="customerPhone" value={form.customerPhone} onChange={update} />
                <Select label="Best way to reach you" name="contactPreference" value={form.contactPreference} onChange={update} options={["Email", "Phone call", "WhatsApp"]} />
                <div className="sm:col-span-2"><Field label="What look or occasion are you planning?" name="desiredLook" value={form.desiredLook} onChange={update} placeholder="Birthday curls, everyday volume, wedding install..." /></div>
                <div className="sm:col-span-2 flex justify-end border-t border-black/10 pt-5"><button type="button" onClick={() => { if (!form.customerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) { setError("Add your name and a valid email to continue."); return; } setError(""); setFormStep(2); }} className="luxe-button">Choose hair details <ArrowRight size={15} /></button></div>
              </div>
            ) : (
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Select label="Desired texture" name="preferredTexture" value={form.preferredTexture} onChange={update} options={textures} />
                <Select label="Length in mind" name="preferredLength" value={form.preferredLength} onChange={update} options={lengths} />
                <Select label="Your budget range" name="budget" value={form.budget} onChange={update} options={["I would rather discuss it", "Under £100", "£100–£200", "£200–£350", "£350+"]} />
                <label className="block sm:col-span-2"><span className="text-[0.64rem] font-bold uppercase tracking-[0.13em] text-black/55">Anything else we should know?</span><textarea name="notes" value={form.notes} onChange={update} rows={4} className="mt-2 w-full resize-y border border-black/15 bg-[#f8f8f6] px-4 py-3 text-sm outline-none transition focus:border-black" placeholder="What you love, want to avoid, or any question you have." /></label>
                <div className="sm:col-span-2 flex flex-col gap-4 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => setFormStep(1)} className="text-xs font-black uppercase tracking-wider text-black/50 hover:text-black">Back to contact details</button><button disabled={status === "sending"} className="luxe-button disabled:cursor-wait disabled:opacity-60">{status === "sending" ? "Sending your request" : "Send to the concierge"} <ArrowRight size={15} /></button></div>
              </div>
            )}
            {error && <p className="mt-4 text-sm font-semibold text-[#c30059]">{error}</p>}
          </form>
        )}
      </section>
      <section className="bg-[#f5e7eb]"><div className="luxe-shell flex flex-col gap-5 py-10 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Sparkles className="text-[#a41c5c]" size={19} /><p className="font-serif text-2xl">Already know exactly what you want?</p></div><a href="/products" className="luxe-link">Shop the collection <ArrowRight size={15} /></a></div></section>
    </main><Footer /></div>
  );
}

function Field({ label, name, type = "text", value, onChange, required, placeholder }) {
  return <label className="block"><span className="text-[0.64rem] font-bold uppercase tracking-[0.13em] text-black/55">{label}</span><input required={required} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mt-2 w-full border border-black/15 bg-[#f8f8f6] px-4 py-3 text-sm outline-none transition placeholder:text-black/35 focus:border-black" /></label>;
}

function Select({ label, name, value, onChange, options }) {
  return <label className="block"><span className="text-[0.64rem] font-bold uppercase tracking-[0.13em] text-black/55">{label}</span><select name={name} value={value} onChange={onChange} className="mt-2 w-full border border-black/15 bg-[#f8f8f6] px-4 py-3 text-sm outline-none transition focus:border-black"><option value="">Select one</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

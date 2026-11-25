import { Link } from 'react-router-dom';
import { Award, Compass, Layers, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function AboutPage() {
  useDocumentTitle('About Us');

  return (
    <div>
      <section className="border-b border-slate-200 bg-[#F5F3EE] py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">Our Philosophy</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Designing everyday instruments with quiet longevity.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Velora was founded on a straightforward premise: the objects you reach for every morning
            — your headphones, kettle, keyboard, and carry pack — deserve architectural care and
            repairable engineering.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="overflow-hidden rounded-3xl border border-slate-200 lg:col-span-6">
            <img
              src="/images/hero-lifestyle.jpg"
              alt="Velora studio workspace with headphones, lamp, and ceramic mug"
              width="1200"
              height="675"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <div className="space-y-5 lg:col-span-6">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Honest materials, zero planned obsolescence.
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              Instead of seasonal disposable trends, we work directly with small-batch ceramicists,
              acoustic engineers, and heritage textile mills. Every product undergoes a multi-month
              durability trial before entering our catalog.
            </p>
            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <Compass className="h-5 w-5 text-[#0F4C5C]" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-slate-900">Tactile Design</p>
                <p className="mt-1 text-xs text-slate-600">Solid walnut, anodized alloy &amp; wool.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <Layers className="h-5 w-5 text-[#C26D2D]" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-slate-900">Modular Parts</p>
                <p className="mt-1 text-xs text-slate-600">Replaceable cushions &amp; switches.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <Award className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-slate-900">2-Year Care</p>
                <p className="mt-1 text-xs text-slate-600">Full studio warranty coverage.</p>
              </div>
            </div>

            <div className="pt-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F4C5C] px-6 py-3 text-sm font-bold text-white hover:bg-[#0A3642]"
              >
                Explore the Collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

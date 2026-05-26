import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: "Wedding Planning Tips That Actually Work (2026 Guide) | QuickWeds",
  description: "Use these practical wedding planning tips to save money, reduce stress, manage RSVPs, organize guests, and plan your wedding with more confidence.",
  alternates: {
    canonical: '/tips',
  },
  openGraph: {
    title: "Wedding Planning Tips That Actually Work (2026 Guide)",
    description: "Practical wedding planning tips for budgets, guests, RSVPs, suppliers, timelines, and stress-free organization.",
    url: '/tips',
    siteName: 'QuickWeds',
    type: 'article',
  },
};

export default function TipsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Lightbulb className="w-6 h-6" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/80">2026 Guide</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground leading-[1.1]">
            10 Wedding Planning Tips That Actually Work
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-10">
        {/* Introduction */}
        <div className="prose prose-lg prose-neutral max-w-none text-text-secondary">
          <p className="text-xl leading-relaxed text-foreground font-medium">
            Planning a wedding can feel exciting and overwhelming at the same time.
          </p>
          <p>
            With so many decisions, costs, and timelines, it is easy to get stressed or go over budget. But here is the truth:
          </p>
          <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-2xl">
            <p className="font-bold text-primary text-xl m-0">Smart couples do not plan harder — they plan smarter.</p>
          </div>
          <p>
            In this guide, you will learn practical wedding planning tips that actually work, used by real couples to stay organized, save money, and enjoy their big day.
          </p>

          <hr className="my-12 border-border" />

          {/* Tips */}
          <div className="space-y-16">
            
            {/* Tip 1 */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">1. Start With Your Top 3 Priorities</h2>
              <p>Before choosing anything, sit down with your partner and ask: <strong className="text-foreground">&quot;What matters most to us?&quot;</strong></p>
              <p className="mt-4 font-semibold">Common priorities:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Venue</li>
                <li>Photography</li>
                <li>Food & catering</li>
                <li>Guest experience</li>
              </ul>
              <div className="bg-neutral p-5 rounded-2xl mt-6">
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Pro Tip</p>
                <p className="m-0 text-foreground font-medium">Focus your budget on your top 3 priorities, and simplify the rest.</p>
              </div>
            </section>

            {/* Tip 2 */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">2. Set a Budget — Then Add 10–15%</h2>
              <p>One of the biggest mistakes couples make is underestimating costs.</p>
              <p className="mt-4 font-semibold">Hidden wedding expenses include:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Service charges</li>
                <li>Overtime fees</li>
                <li>Styling upgrades</li>
                <li>Supplier add-ons</li>
              </ul>
              <div className="bg-neutral p-5 rounded-2xl mt-6">
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Pro Tip</p>
                <p className="m-0 text-foreground font-medium mb-3">Add a 10–15% buffer to your total budget.</p>
                <ul className="space-y-2">
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Prevents last-minute stress</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Keeps finances under control</li>
                </ul>
              </div>
            </section>

            {/* Tip 3 */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">3. Book Your Venue First</h2>
              <p>Your venue impacts almost everything:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Wedding date</li>
                <li>Number of guests</li>
                <li>Theme and styling</li>
              </ul>
              <div className="bg-neutral p-5 rounded-2xl mt-6">
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Best Practice</p>
                <p className="m-0 text-foreground font-medium mb-3">Book your venue 6–12 months in advance.</p>
                <ul className="space-y-2">
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Secures your preferred date</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Helps you plan faster</li>
                </ul>
              </div>
            </section>

            {/* Tip 4 */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">4. Keep Your Guest List Small (If You Want to Save Money)</h2>
              <p>More guests = higher cost.</p>
              <p className="mt-4 font-semibold">Every additional guest affects:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Catering</li>
                <li>Seating</li>
                <li>Invitations</li>
                <li>Souvenirs</li>
              </ul>
              <div className="bg-neutral p-5 rounded-2xl mt-6">
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Pro Tip</p>
                <p className="m-0 text-foreground font-medium">Ask: &quot;Have we talked to this person in the last year?&quot; If not, reconsider.</p>
              </div>
            </section>

            {/* Tip 5 */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">5. Use a Wedding Planning Tool</h2>
              <p>Manual planning = messy.</p>
              <p>Instead of juggling spreadsheets, messages, and notes... Use an all-in-one platform like QuickWeds to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 mb-6">
                <li>Track your budget</li>
                <li>Manage your checklist</li>
                <li>Handle RSVPs automatically</li>
                <li>Collaborate with your partner</li>
              </ul>
              
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl mt-6 text-center">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Plan Smarter with QuickWeds</h3>
                <ul className="text-left space-y-2 mb-6 max-w-sm mx-auto">
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Saves time</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Avoids missed tasks</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Keeps everything organized</li>
                </ul>
                <Link href="/builder" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover">
                  Create Your Free Wedding Site <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>

            {/* Tip 6 */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">6. Create a Realistic Timeline</h2>
              <p>Wedding planning takes time. Here is a simple breakdown:</p>
              <ul className="space-y-3 mt-4">
                <li><strong className="text-foreground">12 months before:</strong> Venue + major suppliers</li>
                <li><strong className="text-foreground">6 months before:</strong> Styling + attire</li>
                <li><strong className="text-foreground">3 months before:</strong> Invitations + final details</li>
                <li><strong className="text-foreground">1 month before:</strong> Confirm everything</li>
              </ul>
              <div className="bg-neutral p-5 rounded-2xl mt-6">
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Pro Tip</p>
                <p className="m-0 text-foreground font-medium">Always give yourself buffer time for delays.</p>
              </div>
            </section>

            {/* Tip 7 */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">7. Choose Suppliers You Trust (Not Just the Cheapest)</h2>
              <p>Budget matters—but reliability matters more.</p>
              <p className="mt-4 font-semibold">Bad vendors can cause:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Delays</li>
                <li>Stress</li>
                <li>Poor quality results</li>
              </ul>
              <div className="bg-neutral p-5 rounded-2xl mt-6">
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Pro Tip</p>
                <p className="m-0 text-foreground font-medium mb-2">Always check their:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Reviews</li>
                  <li>Portfolio</li>
                  <li>Communication style</li>
                </ul>
              </div>
            </section>

            {/* Tip 8 */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">8. Do Not Overcomplicate Your Theme</h2>
              <p>Pinterest can inspire... but also overwhelm.</p>
              <div className="bg-neutral p-5 rounded-2xl mt-6">
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Pro Tip</p>
                <p className="m-0 text-foreground font-medium mb-3">Stick to 2–3 main colors and one consistent theme.</p>
                <ul className="space-y-2">
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Looks more elegant</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Easier to execute</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> More budget-friendly</li>
                </ul>
              </div>
            </section>

            {/* Tip 9 */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">9. Focus on Guest Experience</h2>
              <p>Guests will not remember every detail...</p>
              <p className="mt-4 font-semibold">...but they will remember:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>The vibe</li>
                <li>The food</li>
                <li>The flow of the program</li>
              </ul>
              <div className="bg-neutral p-5 rounded-2xl mt-6">
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Pro Tip</p>
                <p className="m-0 text-foreground font-medium">Prioritize comfort and enjoyment over perfection.</p>
              </div>
            </section>

            {/* Tip 10 */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">10. Remember What the Day Is Really About</h2>
              <p>It is easy to get lost in planning. But your wedding is about:</p>
              <ul className="list-none space-y-3 mt-4">
                <li className="flex gap-3 items-center"><div className="h-2 w-2 bg-primary rounded-full"></div> <span className="font-medium text-foreground">Celebrating your relationship</span></li>
                <li className="flex gap-3 items-center"><div className="h-2 w-2 bg-primary rounded-full"></div> <span className="font-medium text-foreground">Starting your new life together</span></li>
              </ul>
              <div className="bg-primary p-6 rounded-2xl mt-8 text-white">
                <p className="text-xs font-black uppercase tracking-widest text-white/80 mb-2">Final Tip</p>
                <p className="text-2xl font-serif font-bold m-0">Do not aim for perfection — aim for meaning.</p>
              </div>
            </section>

          </div>

          <hr className="my-16 border-border" />

          {/* CTA Footer */}
          <div className="text-center pb-12">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Plan Your Wedding the Smart Way</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto">
              Planning does not have to be stressful. Stay organized from start to finish.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left mb-10">
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                <p className="font-bold text-foreground">Build your website</p>
              </div>
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                <p className="font-bold text-foreground">Manage RSVPs automatically</p>
              </div>
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                <p className="font-bold text-foreground">Track your budget in real-time</p>
              </div>
              <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                <p className="font-bold text-foreground">Stay organized everywhere</p>
              </div>
            </div>
            
            <Link href="/builder" className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-primary px-10 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover hover:-translate-y-1">
              Start Planning Smarter Today <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

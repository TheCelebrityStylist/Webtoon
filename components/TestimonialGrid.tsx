const testimonials = [
  ["Alina R.", "Beta reader", "The pacing is addictive. I came for one episode and read three series in a weekend."],
  ["Marco D.", "Comic letterer", "The vertical reader is clean, fast, and actually respects typography."],
  ["Noa V.", "Beta creator", "Fast Pass framing is clear. I know exactly what readers see and when."],
  ["Claire M.", "Festival curator", "Editorially this feels focused: premium tone, not clickbait chaos."],
  ["Jonas K.", "Mobile UX designer", "Buttons are obvious, screens are scannable, and I never got lost."],
  ["Eva T.", "Pilot cohort reader", "I appreciate that pricing is transparent and doesn't force a subscription."],
  ["Milan P.", "Storyboard artist", "AI Studio gave me an outline I could actually ship from."],
  ["Sofia N.", "Student reader", "The free-first model made it easy to try new genres."],
] as const;

export function TestimonialGrid() {
  return (
    <section className="section-shell">
      <h2 className="text-2xl font-semibold tracking-tight">Beta feedback</h2>
      <p className="mt-2 text-sm text-slate-600">All testimonials below are fictionalized beta-style feedback examples for MVP positioning.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map(([name, role, quote]) => (
          <figure key={name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <blockquote className="text-sm text-slate-700">“{quote}”</blockquote>
            <figcaption className="mt-3 text-xs text-slate-500">{name} · {role}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

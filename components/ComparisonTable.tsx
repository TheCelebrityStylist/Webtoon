export function ComparisonTable() {
  const rows = [
    ["Primary value", "Community discovery", "Premium episode feed", "Progression fiction", "Community + completion economics"],
    ["Content format", "Mixed prose", "Vertical comics", "Serialized fiction", "Vertical webtoons + community"],
    ["Discovery model", "Tags + communities", "Feed + ranking", "Guided progression", "Community shelves + curated lanes"],
    ["Monetization for creators", "Limited/varied", "Platform split", "Premium unlocks", "Unlocks + tips + bundles + creator plans"],
    ["Monetization for readers", "Mostly wait model", "Coins/Fast Pass", "Subscription/progression", "Credits + Continuity+ + bundles"],
    ["Completion mechanics", "Weak", "Moderate", "Strong", "Arc lane + streak + reward layers"],
    ["Spoiler protection", "None", "Limited", "Moderate", "Spoiler Shield + early unlock windows"],
    ["Editorial curation", "Low", "Medium", "Medium", "High (EU originals focus)"],
    ["IP ownership clarity", "Varies", "Varies", "Varies", "Explicit creator-first terms"],
    ["Analytics depth", "Basic", "Basic", "Moderate", "Creator portal retention + conversion views"],
    ["Localization support", "Community-led", "Limited", "Limited", "Localization drafts + language lanes"],
  ] as const;

  return (
    <section className="section-shell">
      <h2 className="text-2xl font-semibold tracking-tight">Competitor comparison</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2">Capability</th>
              <th className="py-2">Wattpad</th>
              <th className="py-2">WEBTOON</th>
              <th className="py-2">Foretelling</th>
              <th className="py-2">EU Webtoon</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {rows.map((row) => (
              <tr key={row[0]} className="border-b border-slate-100 align-top">
                {row.map((cell, i) => <td key={`${row[0]}-${i}`} className="py-2 pr-3">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">If you like Wattpad for discovery, you’ll like EU Webtoon for discovery + completion loops.</div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">If you like WEBTOON visuals, you’ll like EU Webtoon for arc momentum controls.</div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">If you like Foretelling progression, you’ll like EU Webtoon for progression + community.</div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function MobileActionBar() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      const goingDown = current > lastY + 8;
      const goingUp = current < lastY - 8;
      if (goingDown && current > 100) setVisible(false);
      if (goingUp || current < 40) setVisible(true);
      lastY = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`fixed inset-x-4 bottom-4 z-40 transition-transform duration-200 md:hidden ${visible ? "translate-y-0" : "translate-y-24"}`}>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
        <Link href="/series" className="cta-primary px-3 py-2 text-xs" onClick={() => trackEvent("mobile_bar_start_reading")}>Start reading</Link>
        <Link href="/series" className="cta-secondary px-3 py-2 text-xs" onClick={() => trackEvent("mobile_bar_browse")}>Browse library</Link>
      </div>
    </div>
  );
}

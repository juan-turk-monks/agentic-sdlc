"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => setCount((current) => current - 1)}
        aria-label="Decrement counter"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-solid border-black/[.08] text-xl font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        −
      </button>
      <output
        aria-live="polite"
        className="min-w-16 text-center text-3xl font-semibold tabular-nums tracking-tight text-black dark:text-zinc-50"
      >
        {count}
      </output>
      <button
        type="button"
        onClick={() => setCount((current) => current + 1)}
        aria-label="Increment counter"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-solid border-black/[.08] text-xl font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        +
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <button
        type="button"
        data-testid="counter-button"
        onClick={() => setCount((c) => c + 1)}
        className="rounded-full bg-[#1f883d] px-8 py-4 text-2xl font-semibold text-white"
      >
        {count}
      </button>
    </div>
  );
}

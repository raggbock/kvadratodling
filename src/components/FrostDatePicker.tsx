"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface FrostDatePickerProps {
  value: string; // ISO date string "YYYY-MM-DD"
}

export function FrostDatePicker({ value }: FrostDatePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("frostDate", e.target.value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="frost-date" className="text-sm font-medium text-gray-700">
        Sista frostdag
      </label>
      <input
        id="frost-date"
        type="date"
        value={value}
        onChange={handleChange}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
      />
    </div>
  );
}

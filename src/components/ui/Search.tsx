"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search() {
  const searchParams = useSearchParams();
  const { push } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    params.delete("limit");
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    push(`?${params.toString()}`);
  }, 500);

  return (
    <div className="relative w-full sm:w-fit">
      <div className="absolute left-0 w-10 h-full justify-center flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="#696969"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
      <input
        defaultValue={searchParams.get("query")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        type="text"
        placeholder="Search"
        className="pl-10 __input w-full sm:w-80"
      />
    </div>
  );
}

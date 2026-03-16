"use client";

import { useState } from "react";
import { SearchField } from "@/components/ui/search-field";
export function BoardSearch() {
  const [search, setSearch] = useState("");

  return (
    <div className="mt-8">
      <SearchField value={search} onChange={setSearch} placeholder="Search..." />
    </div>
  );
}

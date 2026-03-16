"use client";

import { useQueryState } from "nuqs";
import { SearchField } from "./ui/search-field";

export function RulesSearch() {
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="mt-6 hidden w-full max-w-[320px] md:block">
      <form className="h-full w-full" onSubmit={handleSubmit}>
        <SearchField
          value={search}
          onChange={setSearch}
          onKeyDown={handleKeyDown}
          placeholder="Search rules..."
        />
      </form>
    </div>
  );
}

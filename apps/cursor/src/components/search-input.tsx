"use client";

import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { SearchField } from "./ui/search-field";

export function SearchInput({
  placeholder,
  className,
  shallow = true,
}: {
  placeholder: string;
  className?: string;
  shallow?: boolean;
}) {
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    shallow,
  });

  return (
    <SearchField
      placeholder={placeholder}
      value={search}
      onChange={setSearch}
      className={cn("w-full", className)}
    />
  );
}

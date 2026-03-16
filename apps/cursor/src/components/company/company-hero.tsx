"use client";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useRef } from "react";

export function CompanyHero({
  companyId,
  isOwner,
  hero,
}: {
  companyId: string;
  isOwner: boolean;
  hero: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      return;
    }

    const MAX_FILE_SIZE = 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return;
    }

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

      await supabase.storage
        .from("avatars")
        .upload(`${companyId}/hero/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${companyId}/hero/${fileName}`);

      await supabase
        .from("companies")
        .update({
          hero: publicUrl,
        })
        .eq("id", companyId);

      router.refresh();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div
      className="relative mb-0 h-[180px] w-full overflow-hidden rounded-xl border border-border bg-card md:h-[220px]"
      style={{
        backgroundImage: !hero
          ? `repeating-linear-gradient(
      -60deg,
      transparent,
      transparent 1px,
      color-mix(in oklab, var(--base) 16%, transparent) 1px,
      color-mix(in oklab, var(--base) 16%, transparent) 2px,
      transparent 2px,
      transparent 6px
    )`
          : "none",
      }}
    >
      {hero && (
        <Image
          src={hero}
          alt="Hero"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--bg-chrome)]/16 via-transparent to-transparent" />
      {isOwner && (
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept="image/*"
        />
      )}

      {isOwner && (
        <button
          aria-label="Change cover image"
          className="absolute right-4 top-4 flex h-9 items-center gap-2 rounded-full border border-border bg-card/92 px-3 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={12}
            height={12}
            fill="none"
          >
            <mask
              id="a"
              width={12}
              height={12}
              x={0}
              y={0}
              maskUnits="userSpaceOnUse"
              style={{
                maskType: "alpha",
              }}
            >
              <path fill="#D9D9D9" d="M0 0h12v12H0z" />
            </mask>
            <g mask="url(#a)">
              <path
                fill="currentColor"
                d="M1.5 10.5v-9h5.463l-1 1H2.5v7h7V6.025l1-1V10.5h-9Zm3-3V5.375L9.813.062 11.9 2.2 6.625 7.5H4.5Zm1-1h.7l2.9-2.9-.35-.35-.363-.35L5.5 5.787V6.5Z"
              />
            </g>
          </svg>
          <span className="hidden md:inline">Edit cover</span>
        </button>
      )}
    </div>
  );
}

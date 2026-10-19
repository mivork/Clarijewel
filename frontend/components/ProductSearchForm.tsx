"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GEM_TYPES, METAL_TYPES, ITEM_TYPES } from "@/lib/constants";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function ProductSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [gemType, setGemType] = useState(searchParams.get("gem_type") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [metalType, setMetalType] = useState(searchParams.get("metal_type") ?? "");
  const [birthstoneMonth, setBirthstoneMonth] = useState(
    searchParams.get("birthstone_month") ?? ""
  );
  const [priceMin, setPriceMin] = useState(searchParams.get("price_min") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("price_max") ?? "");

  const submit = (overrides: {
    q?: string;
    gemType?: string;
    category?: string;
    metalType?: string;
    birthstoneMonth?: string;
    priceMin?: string;
    priceMax?: string;
  }) => {
    const params = new URLSearchParams();
    const values = {
      q,
      gemType,
      category,
      metalType,
      birthstoneMonth,
      priceMin,
      priceMax,
      ...overrides,
    };
    if (values.q) params.set("q", values.q);
    if (values.gemType) params.set("gem_type", values.gemType);
    if (values.category) params.set("category", values.category);
    if (values.metalType) params.set("metal_type", values.metalType);
    if (values.birthstoneMonth) params.set("birthstone_month", values.birthstoneMonth);
    if (values.priceMin) params.set("price_min", values.priceMin);
    if (values.priceMax) params.set("price_max", values.priceMax);
    router.push(`/?${params.toString()}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        padding: "16px 0",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        placeholder="キーワード検索"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ flex: "1 1 200px" }}
      />
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          submit({ category: e.target.value });
        }}
      >
        <option value="">カテゴリー（すべて）</option>
        {ITEM_TYPES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={gemType}
        onChange={(e) => {
          setGemType(e.target.value);
          submit({ gemType: e.target.value });
        }}
      >
        <option value="">宝石の種類（すべて）</option>
        {GEM_TYPES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <select
        value={metalType}
        onChange={(e) => {
          setMetalType(e.target.value);
          submit({ metalType: e.target.value });
        }}
      >
        <option value="">地金（すべて）</option>
        {METAL_TYPES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={birthstoneMonth}
        onChange={(e) => {
          setBirthstoneMonth(e.target.value);
          submit({ birthstoneMonth: e.target.value });
        }}
      >
        <option value="">誕生石（すべて）</option>
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            {m}月
          </option>
        ))}
      </select>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input
          type="number"
          inputMode="numeric"
          placeholder="価格下限"
          min={0}
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          style={{ width: 110 }}
        />
        <span style={{ color: "var(--color-muted)" }}>〜</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="価格上限"
          min={0}
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          style={{ width: 110 }}
        />
      </div>
      <button type="submit">検索</button>
    </form>
  );
}

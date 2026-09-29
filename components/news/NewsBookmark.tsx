"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

interface Props {
  articleId: string;
  labels?: { save: string; saved: string };
}

const KEY = "sportverge:bookmarks";

export function NewsBookmark({ articleId, labels }: Props) {
  const [saved, setSaved] = useState(false);
  const t = labels ?? { save: "Save", saved: "Saved" };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      setSaved(ids.includes(articleId));
    } catch {}
  }, [articleId]);

  function toggle() {
    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = saved ? ids.filter((x) => x !== articleId) : [...ids, articleId];
      localStorage.setItem(KEY, JSON.stringify(next));
      setSaved(!saved);
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center justify-center w-10 h-10 rounded-xl backdrop-blur-xl border transition-all ${saved ? "bg-lime/10 border-lime/40 text-lime" : "bg-surface/60 border-edge text-muted hover:text-lime hover:border-lime/40"}`}
      aria-label={saved ? t.saved : t.save}
      title={saved ? t.saved : t.save}
    >
      <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
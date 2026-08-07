"use client";

import { create } from "zustand";
import { HC_COLLECTIONS, HC_ARTICLES, type Collection, type Article } from "@/components/help-center/data";

type ColUpdater = Collection[] | ((prev: Collection[]) => Collection[]);
type ArtUpdater = Article[] | ((prev: Article[]) => Article[]);

interface HelpCenterState {
  collections: Collection[];
  articles: Article[];
  setCollections: (u: ColUpdater) => void;
  setArticles: (u: ArtUpdater) => void;
}

export const useHelpCenterStore = create<HelpCenterState>((set) => ({
  collections: HC_COLLECTIONS,
  articles: HC_ARTICLES,
  setCollections: (u) => set((s) => ({ collections: typeof u === "function" ? u(s.collections) : u })),
  setArticles: (u) => set((s) => ({ articles: typeof u === "function" ? u(s.articles) : u })),
}));

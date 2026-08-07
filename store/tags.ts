"use client";

import { create } from "zustand";
import { TAGS_SEED, type Tag } from "@/components/tags/data";

type TagsUpdater = Tag[] | ((prev: Tag[]) => Tag[]);

interface TagsState {
  tags: Tag[];
  setTags: (updater: TagsUpdater) => void;
}

/** In-memory tags store. The inbox filters and the contact panel read the same list. */
export const useTagsStore = create<TagsState>((set) => ({
  tags: TAGS_SEED,
  setTags: (updater) =>
    set((s) => ({ tags: typeof updater === "function" ? updater(s.tags) : updater })),
}));

import { v } from "convex/values";

export const tierValidator = v.union(
  v.literal("S"),
  v.literal("A"),
  v.literal("B"),
  v.literal("C"),
  v.literal("D"),
);

export const sessionStatusValidator = v.union(
  v.literal("draft"),
  v.literal("live"),
  v.literal("completed"),
);

export const itemStatusValidator = v.union(
  v.literal("pool"),
  v.literal("staged"),
  v.literal("placed"),
);

export const itemSourceValidator = v.union(
  v.literal("upload"),
  v.literal("tiermaker_import"),
  v.literal("url_paste"),
);

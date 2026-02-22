/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as communityPlacements from "../communityPlacements.js";
import type * as items from "../items.js";
import type * as lib_placement from "../lib/placement.js";
import type * as lib_scoring from "../lib/scoring.js";
import type * as lib_validators from "../lib/validators.js";
import type * as participation from "../participation.js";
import type * as sessions from "../sessions.js";
import type * as streamerPlacements from "../streamerPlacements.js";
import type * as users from "../users.js";
import type * as votes from "../votes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  communityPlacements: typeof communityPlacements;
  items: typeof items;
  "lib/placement": typeof lib_placement;
  "lib/scoring": typeof lib_scoring;
  "lib/validators": typeof lib_validators;
  participation: typeof participation;
  sessions: typeof sessions;
  streamerPlacements: typeof streamerPlacements;
  users: typeof users;
  votes: typeof votes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

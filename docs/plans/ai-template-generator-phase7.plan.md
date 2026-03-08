---
name: AI Template Generator
overview: Post-MVP planning doc for a native template creation flow that helps hosts brainstorm tier list ideas, generate candidate items, source representative images, and create item pools without depending on TierMaker.
source: in-repo planning follow-up after MVP phases 5 and 6
current_focus: Pre-implementation planning only
depends_on:
  - Validate Phase 5 manually
  - Validate Phase 6 manually
  - Deploy the MVP web + realtime stack
isProject: false
---

# AI Template Generator - Phase 7 Plan

This plan is intentionally separate from the MVP plan. The goal is to finish testing and deployment for phases 5 and 6 first, then start a new feature track for native template generation.

## Why This Exists

TierMaker import is not a reliable foundation for onboarding because automated access can be blocked. A native template generator gives the product a first-party creation path:

- hosts can start from a topic instead of a prebuilt external template
- item generation no longer depends on TierMaker availability
- the product can evolve toward higher-quality onboarding and better creator retention

## Product Goal

A host should be able to type a prompt like:

- `best fast food fries`
- `top Nintendo villains`
- `anime arcs to argue about on stream`

Then the app should help them:

- brainstorm a usable tier list concept
- generate a candidate item pool
- review and edit the pool
- attach representative images
- create the session with those items

## Recommended Scope Order

### Phase 7A - Text-Only Template Generator MVP

Start here. This is the fastest path to validating the feature without image licensing or scraping complexity.

- `7A.1` Add a generator entry point in the host dashboard or session setup flow
- `7A.2` Accept a prompt plus optional constraints:
  - target item count
  - content domain
  - audience tone
  - exclusions
- `7A.3` Generate candidate item labels server-side
- `7A.4` Let the host approve, remove, reorder, and add manual items
- `7A.5` Save the approved list directly into the session item pool
- `7A.6` Track prompt, generated draft, and accepted item count for product learning

### Phase 7B - Assisted Image Suggestions

Only do this after the text-only flow feels good.

- `7B.1` For each approved item, generate one or more image suggestions
- `7B.2` Let the host confirm, replace, or skip each image
- `7B.3` Store accepted image URLs or uploaded copies
- `7B.4` Support a text-only fallback when no safe image is available

### Phase 7C - Source-Guided Template Generation

This can improve quality for lists based on known franchises or public datasets.

- `7C.1` Let the host provide source URLs or a source type
- `7C.2` Extract candidate entities from approved source pages
- `7C.3` De-duplicate and normalize candidate items
- `7C.4` Show provenance so the host can trust where items came from

## UX Concept

### Entry Point

Add a new host action alongside manual item entry:

- `Generate With AI`

### Draft Flow

1. Host enters a prompt.
2. App proposes 3 possible list angles or one direct item draft.
3. Host chooses a draft.
4. App shows the generated item pool in an editable checklist/table.
5. Host removes weak items, adds missing ones, and confirms.
6. App creates the pool in the session.

### Host Controls To Include

- prompt input
- target item count
- “make it broader / more niche / more chaotic” refinement actions
- add/remove item editing
- duplicate detection
- image optionality instead of image requirement

## Backend And Data Ideas

Potential additions:

- `templateDrafts` table
- metadata fields for:
  - prompt
  - generation model/provider
  - source strategy
  - accepted/rejected items
  - createdBy host
- server actions for:
  - generate draft
  - refine draft
  - accept draft into session

## LLM/System Design Notes

The model should generate structured output, not freeform prose. Prefer a schema like:

- list title
- short concept summary
- candidate items[]
- optional notes or warnings

Quality controls:

- enforce max item counts
- reject duplicates
- avoid vague labels
- keep item naming style consistent
- prefer recognizable entities over abstract category fragments

## Image Strategy Options

These should be treated as separate product and legal choices, not mixed into the first MVP.

### Option 1 - Text-Only First

Best first implementation.

- fastest to ship
- no image licensing complexity
- still useful for stream voting

### Option 2 - User-Provided Images

Safer than scraping.

- upload a zip/folder
- paste image URLs the user controls
- auto-label from filenames where possible

### Option 3 - Assisted Search Suggestions

Potentially useful, but riskier.

- app searches for representative images
- host must confirm each one
- may require source restrictions or licensing policy

## Risks

### Product Risks

- generated lists may be generic or repetitive
- item pools may include duplicates, low-signal picks, or odd omissions
- too much generation without host control could feel untrustworthy

### Legal And Policy Risks

- image sourcing can create licensing or copyright issues
- using external websites as machine-readable data sources may trigger terms-of-service concerns
- this is one reason a text-first generator is the safest first phase

### Cost Risks

- iterative prompting and image workflows can become expensive
- moderation and prompt-safety costs may rise if hosts generate edgy or branded content

## Testing Plan

When this phase begins, testing should include:

- prompt quality across several content domains
- duplicate removal
- consistent item formatting
- host editing before import
- empty or low-confidence generation fallbacks
- rate limiting and abuse controls
- evaluation sets for:
  - games
  - anime
  - movies
  - food
  - Twitch/stream culture

## Suggested Execution Sequence

1. Finish manual testing for phase 5.
2. Finish manual testing for phase 6.
3. Deploy MVP web and realtime.
4. Gather first real-world feedback on session creation friction.
5. Start `Phase 7A - Text-Only Template Generator MVP`.
6. Add image assistance only after text-only generation proves useful.

## Recommended MVP For Phase 7

If we want the fastest sensible version:

- prompt input
- structured item generation
- host review/edit UI
- approve into session pool
- no automatic internet image fetching in v1

That gives the product a first-party way to create tier list sessions without depending on TierMaker or risky scraping workarounds.

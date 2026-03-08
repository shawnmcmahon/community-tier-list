import assert from "node:assert/strict";
import test from "node:test";

import {
  isTierMakerBotBlockPage,
  normalizeTierMakerUrl,
  parseTierMakerTemplateHtml,
  TierMakerImportError,
} from "./tiermaker.ts";

test("normalizeTierMakerUrl accepts direct create urls", () => {
  const url = normalizeTierMakerUrl(
    "https://tiermaker.com/create/smash-ultimate-characters?ref=homepage#top",
  );

  assert.equal(url.toString(), "https://tiermaker.com/create/smash-ultimate-characters");
});

test("normalizeTierMakerUrl rejects non-create urls", () => {
  assert.throws(
    () => normalizeTierMakerUrl("https://tiermaker.com/categories/anime"),
    (error: unknown) =>
      error instanceof TierMakerImportError &&
      error.status === 400 &&
      error.message.includes("direct TierMaker template URL"),
  );
});

test("parseTierMakerTemplateHtml extracts draggable filler images", () => {
  const html = `
    <html>
      <head>
        <title>Create a Smash Ultimate Tier List - TierMaker</title>
      </head>
      <body>
        <img class="draggable-filler" src="/images/chart/chart/mario.png" />
        <img class="draggable-filler" src="/images/chart/chart/princess-peach.png" />
      </body>
    </html>
  `;

  const parsed = parseTierMakerTemplateHtml(
    html,
    new URL("https://tiermaker.com/create/smash-ultimate"),
  );

  assert.equal(parsed.title, "Smash Ultimate");
  assert.deepEqual(parsed.items, [
    {
      label: "Mario",
      imageUrl: "https://tiermaker.com/images/chart/chart/mario.png",
    },
    {
      label: "Princess Peach",
      imageUrl: "https://tiermaker.com/images/chart/chart/princess-peach.png",
    },
  ]);
});

test("parseTierMakerTemplateHtml dedupes repeated image references", () => {
  const html = `
    <div
      class="character"
      style="background-image:url(&quot;/images/chart/chart/fox-mccloud.png&quot;)"
    ></div>
    <script>
      window.__DATA__ = {
        "items": [
          "https:\\/\\/tiermaker.com\\/images\\/chart\\/chart\\/fox-mccloud.png",
          "https:\\/\\/tiermaker.com\\/images\\/chart\\/chart\\/falco-lombardi.png"
        ]
      };
    </script>
  `;

  const parsed = parseTierMakerTemplateHtml(
    html,
    new URL("https://tiermaker.com/create/star-fox"),
  );

  assert.deepEqual(
    parsed.items.map((item) => item.imageUrl),
    [
      "https://tiermaker.com/images/chart/chart/fox-mccloud.png",
      "https://tiermaker.com/images/chart/chart/falco-lombardi.png",
    ],
  );
});

test("parseTierMakerTemplateHtml fails on bot-block pages", () => {
  const html = `
    <html>
      <head><title>Just a moment...</title></head>
      <body>Enable JavaScript and cookies to continue __cf_chl_</body>
    </html>
  `;

  assert.equal(isTierMakerBotBlockPage(html), true);
  assert.throws(
    () =>
      parseTierMakerTemplateHtml(
        html,
        new URL("https://tiermaker.com/create/some-list"),
      ),
    (error: unknown) =>
      error instanceof TierMakerImportError &&
      error.status === 502 &&
      error.message.includes("blocked"),
  );
});

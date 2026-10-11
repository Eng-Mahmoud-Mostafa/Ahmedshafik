import assert from "node:assert/strict";
import { test } from "node:test";

import {
  parseInstagramPermalink,
  parseInstagramProfile,
} from "../src/lib/instagram.ts";
import {
  publishedInstagramPosts,
  verifiedInstagramProfile,
  type InstagramConfig,
} from "../src/content/instagram.ts";

/**
 * The gallery embeds whatever the owner supplies, so the two things worth
 * asserting are that only genuine Instagram permalinks are accepted and that
 * the verification gate is honoured. Both run without a DOM.
 */

test("accepts canonical post and Reel permalinks", () => {
  const post = parseInstagramPermalink("https://www.instagram.com/p/Cabc123_-/");
  assert.deepEqual(post, {
    kind: "post",
    shortcode: "Cabc123_-",
    url: "https://www.instagram.com/p/Cabc123_-/",
  });

  const reel = parseInstagramPermalink("https://www.instagram.com/reel/Cxyz789/");
  assert.equal(reel?.kind, "reel");
  assert.equal(reel?.url, "https://www.instagram.com/reel/Cxyz789/");
});

test("normalises share links and strips query strings", () => {
  const shared = parseInstagramPermalink(
    "https://instagram.com/reels/Cabc123/?igsh=abc&utm_source=ig_web_copy_link",
  );
  assert.equal(shared?.kind, "reel");
  assert.equal(shared?.url, "https://www.instagram.com/reel/Cabc123/");
});

test("rejects anything that is not an Instagram permalink", () => {
  const rejected = [
    "",
    "not a url",
    "http://www.instagram.com/p/Cabc123/",
    "https://www.instagram.com/ahmed/",
    "https://www.instagram.com/p/",
    "https://evil.com/p/Cabc123/",
    "https://www.instagram.com.evil.com/p/Cabc123/",
  ];
  for (const value of rejected) {
    assert.equal(parseInstagramPermalink(value), null, `should reject: ${value}`);
  }
});

test("accepts a profile handle but not a post URL", () => {
  assert.equal(
    parseInstagramProfile("https://www.instagram.com/ahmed.shafik_18/"),
    "https://www.instagram.com/ahmed.shafik_18/",
  );
  assert.equal(parseInstagramProfile("instagram.com/ahmed"), null);
  assert.equal(parseInstagramProfile("https://www.instagram.com/p/Cabc123/"), null);
  assert.equal(parseInstagramProfile(""), null);
});

test("the shipped config invents no profile and no posts", () => {
  const shipped: InstagramConfig = { profileUrl: "", handle: "", posts: [] };
  assert.equal(verifiedInstagramProfile(shipped), null);
  assert.deepEqual(publishedInstagramPosts(shipped), []);
});

test("only verified or owner-approved posts with valid URLs are published", () => {
  const config: InstagramConfig = {
    profileUrl: "https://www.instagram.com/ahmed/",
    handle: "ahmed",
    posts: [
      {
        id: "approved",
        url: "https://www.instagram.com/p/AAAA/",
        verification: "owner-approved",
        sources: [],
      },
      {
        id: "verified",
        url: "https://www.instagram.com/reel/BBBB/",
        verification: "verified",
        sources: [],
      },
      {
        id: "draft",
        url: "https://www.instagram.com/p/CCCC/",
        verification: "unverified",
        sources: [],
      },
      {
        id: "broken",
        url: "https://example.com/p/DDDD/",
        verification: "verified",
        sources: [],
      },
    ],
  };

  const published = publishedInstagramPosts(config);
  assert.deepEqual(
    published.map((post) => post.id),
    ["approved", "verified"],
  );
  assert.equal(published[1].kind, "reel");
  assert.equal(verifiedInstagramProfile(config), "https://www.instagram.com/ahmed/");
});

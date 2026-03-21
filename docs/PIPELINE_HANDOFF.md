# IoniaScience Content Handoff Spec

This document defines the handoff between the paper-selection/scoring pipeline and the blog-writing stage.

## Goals

The handoff should be:
- structured enough for automation
- simple enough to inspect manually
- aligned with the Astro blog repo layout
- compatible with draft-first publishing

## Output target

The blog writer should create one folder per article under:

```text
src/data/blog/en/<slug>/
```

Each generated article should include:
- `index.mdx`
- `heroImage.png` (or use a known fallback image path when no per-post hero exists)
- optional `figure-1.png`, `figure-2.png`, etc.

## Blog frontmatter requirements

Minimum required frontmatter for the current Astro schema:

```yaml
---
title: "..."
description: |
  ...
authors:
  - main-author
pubDate: 2026-03-20
heroImage: ./heroImage.png
categories:
  - Biology
draft: true
---
```

Recommended extra frontmatter fields for research posts:

```yaml
doi: "10.1371/journal.pone.xxxxxxx"
source_url: "https://..."
pdf_url: "https://..."
journal: "PLOS ONE"
paperDate: 2026-03-19
score_version: "v1_editorial_ranked_science_bias_v3"
overall_score: 3.2
viral_potential_score: 2.8
impact_score: 3.6
production_ease_score: 3.08
primary_topic: "Biotechnology / Mycology"
content_angle: "Engineering heat-tolerant fungi to boost production of anticancer compounds"
```

## Draft policy

Generated posts should default to:

```yaml
draft: true
```

until the review/publish workflow is finalized.

## Category policy

Use broad, reader-facing categories rather than ultra-specific scientific taxonomies.

Recommended category set:
- Biology
- Astronomy
- AI
- Medicine & Health
- Physics
- Chemistry
- Earth & Climate
- Engineering
- Neuroscience
- Agriculture
- Mathematics
- Psychology

A post may have 1-3 categories.

## Selector -> writer handoff schema

The selector should emit a structured payload like this for each chosen paper:

```json
{
  "selection_date": "2026-03-20",
  "selection_window_days": 3,
  "selection_reason": "Top biology candidate in rolling 3-day window",
  "paper": {
    "doi": "10.1371/journal.pone.0345065",
    "title": "Enhanced ganoderic acids production by using thermotolerant Ganoderma tsugae at high-temperature liquid cultivation",
    "abstract": "...",
    "paper_url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0345065",
    "published_at": "2026-03-17T14:00:00Z",
    "journal": "PLOS ONE",
    "authors_json": [],
    "keywords_json": ["Biotechnology", "Fungi"]
  },
  "scores": {
    "scorer_version": "v1_editorial_ranked_science_bias_v3",
    "novelty_score": 3,
    "public_interest_score": 2,
    "visualizability_score": 2,
    "utility_score": 4,
    "wonder_score": 2,
    "credibility_score": 4,
    "overall_score": 2.95,
    "viral_potential_score": 2.45,
    "impact_score": 3.4,
    "production_ease_score": 2.59,
    "primary_topic": "Biotechnology / Mycology",
    "content_angle": "Engineering heat-tolerant fungi to boost production of anticancer compounds",
    "audience_fit": "science-curious adults",
    "visual_mode": "diagram",
    "hooks_json": [
      "Scientists engineered a heat-loving fungus to make more cancer-fighting compounds."
    ],
    "red_flags_json": [
      "Incremental biotech advance",
      "Needs real-world validation"
    ],
    "rationale_json": {
      "summary_reason": "Solid biotech advance with practical value, but somewhat technical.",
      "score_reasons": {}
    }
  },
  "routing": {
    "topic_bucket": "Biology",
    "candidate_type": "blog",
    "video_candidate": false,
    "priority_rank": 2,
    "rolling_window_rank": 1
  },
  "assets": {
    "hero_image_mode": "fallback",
    "figure_candidates": [],
    "manim_candidate": false
  }
}
```

## Writer responsibilities

Given the handoff payload, the writer should:
1. build a clean slug
2. choose 1-3 broad categories
3. create draft frontmatter
4. write an accessible narrative post in MDX
5. include a TL;DR block
6. include caveats/limitations
7. include a sources section
8. embed figures when useful and available
9. write into `src/data/blog/en/<slug>/index.mdx`

## Recommended MDX body structure

Use this article structure by default:
1. hook opening
2. `> **TL;DR**`
3. why this topic matters
4. what the researchers did
5. what they found
6. why it matters for readers or science
7. caveats and open questions
8. optional figures with plain-language captions
9. sources

## Slug rules

Slug should be:
- lowercase
- hyphen-separated
- ASCII-safe where possible
- derived from title, but shortened when overly long
- stable enough that re-runs don’t produce wildly different paths

## Future extensions

Later, this handoff can be extended with:
- `trend_relevance_score`
- `brand_fit_score`
- `publish_decision`
- `social_post_candidates`
- `video_plan`
- `newsletter_candidate`

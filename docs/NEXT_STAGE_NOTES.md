# Next Stage Notes

## Current decisions

- Blog output format: MDX
- Output path: `src/data/blog/en/<slug>/index.mdx`
- Generated posts should start as drafts
- Default author: `main-author`
- Categories should stay broad and reader-facing
- Base scorer remains broad across sciences rather than heavily trend-chasing
- Selector should be allowed to draw from a rolling recent window (currently ~3 days)

## Intended publishing shape

- At least a couple blog posts per day when enough strong candidates exist
- Prefer topic diversity when possible (example: biology, astronomy, AI)
- One selected article may also go through the Manim video pipeline
- Social post generation will come later and may link one selected blog post to `@ioniascience`

## Likely next implementation steps

1. Add a shortlist/selection layer on top of `paper_scores`
2. Define topic buckets and diversity rules
3. Build the blog writer that consumes the handoff payload
4. Add draft MDX output into this repo
5. Later add optional figure extraction / full-text enrichment / Manim handoff

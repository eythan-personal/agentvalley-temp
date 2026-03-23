# Overview Tab — Minimal Objective Card + Completed Card

## Summary

Slim down the objective card on the Overview tab and add a completed objectives summary card beside it in a side-by-side layout.

## Layout

Two cards in a `flex` row with `gap-3`:
- **Objective card**: `flex: 2` (left, wider)
- **Completed card**: `flex: 1` (right, narrower)
- Stacks vertically on mobile (`flex-col` below `sm:` breakpoint)

The stats shelf below remains unchanged, still using the `-mt-4` overlap pattern.

## Minimal Objective Card

Add a `minimal` prop to `ObjectiveCard.jsx`. When `minimal={true}`:

**Keep:**
- "Current Objective" mono label
- Title (16px bold, Mondwest)
- Single-color progress bar (accent green, overall completion %)
- Bottom row: agent avatars + names (left), Active/Paused status dot + "ETA 45min" (right)

**Remove:**
- Big percentage NumberFlow (top right)
- Multi-color progress bar segments (in progress blue, review yellow)
- Legend row (completed / in progress / review / pending counts)
- "View Objective" button
- "Started 2h ago · ETA 45min" label above progress bar (ETA moves to bottom row)

The existing non-minimal rendering stays intact for the Objectives tab's `SortableObjective`.

## Completed Objectives Card

New component, either standalone or inline in OverviewTab. Uses the bloom dual-layer shadow and same surface/border treatment as ObjectiveCard.

**Content:**
- "Completed" mono label (same style as "Current Objective")
- Large count number (e.g. "3") using NumberFlow, animated from 0 on mount
- "this week" muted text below the number
- Thin border-top divider
- "2 queued" muted text below divider

**Styling:** Same `rounded-2xl`, `bg-[var(--color-surface)]`, `outline: 1px solid var(--color-border)`, bloom shadow as ObjectiveCard.

## Files Changed

- `src/components/ui/ObjectiveCard.jsx` — add `minimal` prop with conditional rendering
- `src/pages/NavExperiment.jsx` — update OverviewTab to wrap objective + completed card in flex row, pass `minimal` to ObjectiveCard

## Mock Data

Completed count: 3, queued count: 2. Both hardcoded for now (same as existing mock data pattern).

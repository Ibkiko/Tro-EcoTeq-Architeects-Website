# Admin Branch Workflow

Use the `cms` branch for admin-managed content.

## Managed paths

- `content/buy-plans.json`
- `Images/Buy-Plan/`

## Flow

1. Switch to `cms`
2. Update buy-plan records in `content/buy-plans.json`
3. Add or replace plan images in `Images/Buy-Plan/`
4. Commit and push `cms`
5. GitHub Actions syncs those managed files into `main`
6. The live `Buy Plan` page updates from `main`

## Important limitation

The current custom `admin/` UI still saves edits in browser storage only. It does not commit files to GitHub by itself.

For true admin uploads directly from the browser into the `cms` branch, the next step is replacing or extending the current admin with a Git-backed CMS flow.

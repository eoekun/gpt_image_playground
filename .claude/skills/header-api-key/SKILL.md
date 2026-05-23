---
name: header-api-key
description: Implement or adjust the private-site lazy API Key selection flow backed by api.eoekun.me token-authenticated keys.
---

# Private-site API Key flow

Use this skill when changing the private-site API Key setup flow.

## Behavior

- Header must not show an `API Key` button.
- On app initialization, read `token` and `src_host` from `window.location.search`.
- Cache them in `sessionStorage` as `gip-entry-token` and `gip-entry-src-host`.
- Immediately remove `token` and `src_host` from the URL with `window.history.replaceState`, preserving other query params and hash.
- Do not fetch API Key lists during initialization.
- If the current active profile has no API Key, show `请到设置中获取并选择 API Key` once per session.
- In Settings → API 配置, keep provider/profile/API URL/model/mode fields read-only for the private deployment.
- Only API Key is editable.
- Clicking the API Key fetch button lazily calls `https://api.eoekun.me/api/v1/keys?page=1&page_size=50&sort_by=created_at&sort_order=desc&timezone=Asia%2FShanghai` with `Authorization: Bearer ${token}`.
- Accept only payloads with `code === 0` and `data.items` as an array.
- Use only active keys and display `name`, masked `key`, and `group.name`.
- If one active key is returned, select it immediately; if multiple are returned, show the list for manual selection.
- On selection, update the active profile API Key through the existing SettingsModal profile update path.
- On missing/expired token, failed fetch, or no active keys, use the cached `src_host` in the failure toast and do not hard-code a main-site URL.

## Constraints

Keep changes surgical. Do not remove the underlying multi-profile/provider data model; restrict the private-site UI instead.

## Verification

Run `npm run build`, then verify: URL token/src_host are cached and removed without fetching keys; Header has no API Key button; Settings API fields are read-only except API Key; clicking the fetch button loads/selects keys lazily.

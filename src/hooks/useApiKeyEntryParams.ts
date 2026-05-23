import { useEffect, useRef } from 'react'
import { getActiveApiProfile } from '../lib/apiProfiles'
import { useStore } from '../store'

export const API_KEY_ENTRY_TOKEN_STORAGE_KEY = 'gip-entry-token'
export const API_KEY_ENTRY_SRC_HOST_STORAGE_KEY = 'gip-entry-src-host'
const API_KEY_EMPTY_HINT_STORAGE_KEY = 'gip-api-key-empty-hint-shown'
const ENTRY_PARAM_KEYS = ['token', 'src_host']

function sanitizeSrcHost(value: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return ''

  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.host
  } catch {
    return ''
  }
}

function cacheEntryParams(searchParams: URLSearchParams) {
  const token = searchParams.get('token')?.trim()
  const srcHost = sanitizeSrcHost(searchParams.get('src_host'))

  if (token) sessionStorage.setItem(API_KEY_ENTRY_TOKEN_STORAGE_KEY, token)
  if (srcHost) sessionStorage.setItem(API_KEY_ENTRY_SRC_HOST_STORAGE_KEY, srcHost)

  if (!ENTRY_PARAM_KEYS.some((key) => searchParams.has(key))) return

  for (const key of ENTRY_PARAM_KEYS) searchParams.delete(key)
  const nextSearch = searchParams.toString()
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', nextUrl)
}

export function getCachedApiKeyEntryToken() {
  return sessionStorage.getItem(API_KEY_ENTRY_TOKEN_STORAGE_KEY)?.trim() ?? ''
}

export function getCachedApiKeyEntrySrcHost() {
  return sessionStorage.getItem(API_KEY_ENTRY_SRC_HOST_STORAGE_KEY)?.trim() ?? ''
}

export function getApiKeyEntryFailureMessage() {
  const srcHost = getCachedApiKeyEntrySrcHost()
  return srcHost
    ? `登录会话失效，请从 ${srcHost} 重新进入或创建 API Key`
    : '登录会话失效，请从主站重新进入或创建 API Key'
}

export function useApiKeyEntryParams() {
  const initializedRef = useRef(false)
  const showToast = useStore((s) => s.showToast)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const searchParams = new URLSearchParams(window.location.search)
    cacheEntryParams(searchParams)

    const activeProfile = getActiveApiProfile(useStore.getState().settings)
    if (activeProfile.apiKey.trim()) return
    if (sessionStorage.getItem(API_KEY_EMPTY_HINT_STORAGE_KEY) === '1') return

    sessionStorage.setItem(API_KEY_EMPTY_HINT_STORAGE_KEY, '1')
    showToast('请到设置中获取并选择 API Key', 'info', 'center', 6000)
  }, [showToast])
}

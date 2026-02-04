const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "")

export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  if (envUrl) return stripTrailingSlash(envUrl)
  if (typeof window !== "undefined") return window.location.origin
  return null
}

export function buildOAuthRedirectUrl(returnTo?: string) {
  const baseUrl = getSiteUrl()
  if (!baseUrl) return null

  const url = new URL("/auth/callback", baseUrl)
  if (returnTo) {
    url.searchParams.set("redirect", returnTo)
  }
  return url.toString()
}

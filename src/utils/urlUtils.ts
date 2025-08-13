/**
 * Utility functions for handling URLs and links
 */

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(string: string): boolean {
  if (!string || typeof string !== 'string') return false
  
  try {
    // Check if it starts with http/https
    if (string.startsWith('http://') || string.startsWith('https://')) {
      new URL(string)
      return true
    }
    
    // Check if it's a domain-like string (contains dots and common TLDs)
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/
    if (domainPattern.test(string)) {
      return true
    }
    
    return false
  } catch {
    return false
  }
}

/**
 * Ensure URL has protocol
 */
export function ensureProtocol(url: string): string {
  if (!url) return url
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Add https:// as default protocol
  return `https://${url}`
}

/**
 * Extract domain from URL for display
 */
export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(ensureProtocol(url))
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

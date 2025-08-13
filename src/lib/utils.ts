import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date) {
  const originalDate = new Date(date)
  // Add 7 hours for Thailand timezone (UTC+7)
  const thailandDate = new Date(originalDate.getTime() + (7 * 60 * 60 * 1000))
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(thailandDate)
}

export function formatChatTime(date: string | Date) {
  const messageDate = new Date(date)
  const now = new Date()

  const diffInMs = now.getTime() - messageDate.getTime() - 7 * 60 * 60 * 1000 // Adjust for Thailand timezone
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) {
    return 'just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else {
    // For older messages, show full date with Thailand timezone adjustment
    const thailandDate = new Date(messageDate.getTime() + (7 * 60 * 60 * 1000))
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(thailandDate)
  }
}

export function formatCurrency(amount: number, currency: string = 'THB') {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function truncateText(text: string, maxLength: number = 100) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhoneNumber(phone: string) {
  const phoneRegex = /^(\+66|0)[0-9]{8,9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function generateChatId() {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

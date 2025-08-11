// Utility functions for video handling

export function getVideoType(url: string): 'youtube' | 'vimeo' | 'direct' | 'other' | null {
  if (!url) return null
  
  // YouTube detection
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/embed/')) {
    return 'youtube'
  }
  
  // Vimeo detection
  if (url.includes('vimeo.com/')) {
    return 'vimeo'
  }
  
  // Direct video files
  if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
    return 'direct'
  }
  
  // Other video platforms (Dailymotion, Twitch, etc.)
  if (url.includes('dailymotion.com') || url.includes('twitch.tv') || url.includes('tiktok.com')) {
    return 'other'
  }
  
  return null
}

export function getYouTubeEmbedUrl(url: string): string {
  // Extract video ID from various YouTube URL formats
  let videoId = ''
  
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1])
    videoId = urlParams.get('v') || ''
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0]
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1].split('?')[0]
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}

export function getVimeoEmbedUrl(url: string): string {
  // Extract video ID from Vimeo URL
  const match = url.match(/vimeo\.com\/(\d+)/)
  const videoId = match ? match[1] : ''
  
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url
}

export function isVideoUrl(url: string): boolean {
  return getVideoType(url) !== null
}

export function isImageUrl(url: string): boolean {
  return url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null
}

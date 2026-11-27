import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Warung Gery', short_name: 'Warung Gery', start_url: '/', display: 'standalone',
    background_color: '#F6F8F3', theme_color: '#0F5C4D',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}

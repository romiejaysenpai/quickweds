import type { MetadataRoute } from 'next';

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QuickWeds',
    short_name: 'QuickWeds',
    description: 'Create wedding websites, manage RSVPs, and plan your wedding from one mobile-friendly workspace.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFF8F4',
    theme_color: '#D16C78',
    categories: ['lifestyle', 'productivity', 'events'],
    lang: 'en',
    icons: [
      ...iconSizes.map((size) => ({
        src: `/icons/icon-${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any' as const,
      })),
      ...iconSizes.map((size) => ({
        src: `/icons/maskable-${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'maskable' as const,
      })),
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Open your QuickWeds dashboard.',
        url: '/dashboard',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Create Wedding',
        short_name: 'Create',
        description: 'Start or edit a wedding website.',
        url: '/builder',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Supplier Directory',
        short_name: 'Suppliers',
        description: 'Browse wedding suppliers.',
        url: '/suppliers',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
    share_target: {
      action: '/share-target',
      method: 'GET',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
      },
    },
  };
}

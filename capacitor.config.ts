import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quickweds.app',
  appName: 'QuickWeds',
  webDir: 'public',
  backgroundColor: '#FFF8F4',
  appendUserAgent: 'QuickWeds-iOS-App',
  server: {
    url: 'https://quickweds.site',
    cleartext: false,
  },
  ios: {
    contentInset: 'never',
  },
};

export default config;

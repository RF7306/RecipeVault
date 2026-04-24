import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.recipevault.app',
  appName: 'RecipeVault',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;

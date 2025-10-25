import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify'; // or 'static' is fine too

export default defineConfig({
  site: 'https://science.ionialabs.com',
  output: 'static',        // 'server' or 'static' also fine; hybrid works with functions if needed
  adapter: netlify(),
  integrations: [],
});

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { createServer } from 'vite';

let server;
let baseUrl = 'http://127.0.0.1:5199';

const REQUIRED_ROUTES = [
  { path: '/', expectedText: 'FormFit AI' },
  { path: '/tools', expectedText: 'Tools' },
  { path: '/photo', expectedText: 'Photo Preparation' },
  { path: '/signature', expectedText: 'Signature Preparation' },
  { path: '/document', expectedText: 'Document Scanner' },
  { path: '/pdf', expectedText: 'PDF Tools' },
  { path: '/presets', expectedText: 'Application Presets' },
  { path: '/history', expectedText: 'Processing History' },
  { path: '/settings', expectedText: 'Settings' },
  { path: '/help', expectedText: 'Help Center' },
  { path: '/privacy', expectedText: 'Privacy Policy' },
  { path: '/terms', expectedText: 'Terms of Service' },
];

describe('Direct URL and SPA Routing Verification', () => {
  before(async () => {
    server = await createServer({
      root: 'frontend',
      configFile: 'frontend/vite.config.js',
      server: { port: 5199, host: '127.0.0.1' },
      logLevel: 'silent',
    });
    await server.listen();
    const address = server.httpServer?.address();
    const port = typeof address === 'object' && address ? address.port : 5199;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) {
      await server.close();
    }
  });

  for (const route of REQUIRED_ROUTES) {
    test(`route ${route.path} returns HTTP 200 OK and mounts index.html`, async () => {
      const res = await fetch(`${baseUrl}${route.path}`);
      assert.strictEqual(res.status, 200, `Expected status 200 for ${route.path}`);
      const text = await res.text();
      assert.ok(text.includes('id="root"'), `Route ${route.path} must serve the React mounting root`);
      assert.ok(text.includes('/src/main.jsx'), `Route ${route.path} must load main.jsx`);
    });
  }
});

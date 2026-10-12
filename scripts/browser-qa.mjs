import { chromium, firefox, webkit } from 'playwright';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173/';
const pages = [
  '', 'concept/', 'longseller/', 'longseller/snowpeak-takibi/', 'categories/', 'archive/', 'repair/', 'value/',
  'journal/', 'about/', 'contact/', 'privacy/', 'rankings/torch/'
];
const viewports = [
  ['360',360,800], ['390',390,844], ['430',430,900],
  ['tablet',768,1024], ['laptop',1366,768],
  ['desktop',1440,1000], ['large',1920,1080],
];
const engines = [['chromium', chromium], ['firefox', firefox], ['webkit', webkit]];

let failed = false;

// Dedicated opening-video check: validate source and autoplay/muted attributes without relying on Linux H.264 decoding.
{
  const browser = await chromium.launch({ headless:true });
  const context = await browser.newContext({ viewport:{width:1440,height:900}, reducedMotion:'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(String(err)));
  await page.goto(base, { waitUntil:'load' });

  const attrs = await page.locator('[data-opening] video').evaluate((v) => ({
    muted: v.muted,
    autoplay: v.autoplay,
    playsInline: v.playsInline,
    source: v.querySelector('source')?.getAttribute('src') || ''
  }));
  const sourceUrl = new URL(attrs.source, base).href;
  const response = await page.request.get(sourceUrl);
  const contentType = response.headers()['content-type'] || '';
  const openingOk =
    attrs.muted &&
    attrs.autoplay &&
    attrs.playsInline &&
    sourceUrl.endsWith('/media/opening.mp4') &&
    response.status() === 200 &&
    contentType.includes('video/mp4') &&
    errors.length === 0;

  console.log(JSON.stringify({check:'opening-video',attrs,sourceUrl,status:response.status(),contentType,errors,ok:openingOk}));
  if (!openingOk) failed = true;
  await context.close();
  await browser.close();
}

for (const [engineName, launcher] of engines) {
  const browser = await launcher.launch({ headless:true });
  for (const [label,width,height] of viewports) {
    const context = await browser.newContext({ viewport:{width,height}, reducedMotion:'no-preference' });
    for (const path of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', err => errors.push(String(err)));

      await page.addInitScript(() => sessionStorage.setItem('camp-ten-opening','1'));
      const res = await page.goto(new URL(path, base).href, { waitUntil:'load' });
      await page.waitForTimeout(80);

      const status = res?.status() || 0;
      const metrics = await page.evaluate(() => ({
        iw: innerWidth,
        sw: document.documentElement.scrollWidth,
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        imgs: [...document.images].map(i => ({src:i.currentSrc || i.src, broken:i.complete && i.naturalWidth === 0}))
      }));
      const overflow = metrics.sw > metrics.iw + 1;
      const brokenImages = metrics.imgs.filter(x => x.broken);

      let menuOk = true;
      if (width <= 768 && path === '') {
        const trigger = page.locator('[data-menu-open]');
        menuOk = await trigger.isVisible();
        if (menuOk) {
          await trigger.click();
          menuOk = await page.locator('[data-menu][data-open="true"]').isVisible()
            && await page.locator('[data-menu-close]').isVisible();
          if (menuOk) await page.locator('[data-menu-close]').click();
        }
      }

      const ok = status < 400 && !!metrics.h1 && !overflow && errors.length === 0 && brokenImages.length === 0 && menuOk;
      console.log(JSON.stringify({engine:engineName,label,path:path||'/',status,h1:metrics.h1,overflow,errors,brokenImages,menuOk,ok}));
      if (!ok) failed = true;
      await page.close();
    }
    await context.close();
  }
  await browser.close();
}
if (failed) process.exit(1);

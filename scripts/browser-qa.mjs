import { chromium } from 'playwright';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173/';
const pages = [
  '', 'concept/', 'categories/', 'archive/', 'repair/', 'value/',
  'journal/', 'about/', 'contact/', 'privacy/', 'rankings/torch/'
];
const viewports = [
  ['360',360,800],['390',390,844],['430',430,900],['tablet',768,1024],['desktop',1440,1000]
];

const browser = await chromium.launch({ headless: true });
let failed = false;
const report = [];
for (const [label,width,height] of viewports) {
  const context = await browser.newContext({ viewport:{width,height}, reducedMotion:'no-preference' });
  for (const path of pages) {
    const page = await context.newPage();
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(String(err)));
    await page.addInitScript(() => sessionStorage.setItem('camp-ten-opening','1'));
    const res = await page.goto(new URL(path, base).href, { waitUntil:'networkidle' });
    const status = res?.status() || 0;
    const metrics = await page.evaluate(() => ({
      iw: innerWidth,
      sw: document.documentElement.scrollWidth,
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      imgs: [...document.images].map(i => ({src:i.currentSrc || i.src, ok:i.complete && i.naturalWidth > 0}))
    }));
    const overflow = metrics.sw > metrics.iw + 1;
    const brokenImages = metrics.imgs.filter(x => !x.ok);
    let menuOk = true;
    if (width <= 768 && path === '') {
      const trigger = page.locator('[data-menu-open]');
      menuOk = await trigger.isVisible();
      if (menuOk) {
        await trigger.click();
        menuOk = await page.locator('[data-menu][data-open="true"]').isVisible()
          && await page.locator('[data-menu-close]').isVisible();
      }
    }
    const ok = status < 400 && !!metrics.h1 && !overflow && errors.length === 0 && brokenImages.length === 0 && menuOk;
    if (!ok) failed = true;
    report.push({label,path:path||'/',status,h1:metrics.h1,overflow,errors,brokenImages,menuOk,ok});
    await page.close();
  }
  await context.close();
}
await browser.close();

for (const row of report) console.log(JSON.stringify(row));
if (failed) process.exit(1);

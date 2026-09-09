import fs from 'node:fs';
import { chromium } from '@playwright/test';
  const source = fs.readFileSync('src/components/templates/TemplateRenderer.tsx', 'utf8');
  const block = source.split('export const TEMPLATE_COMPONENTS = {')[1].split('} satisfies')[0];
  const ids = [...block.matchAll(/^    ['"]?([a-z-]+)['"]?:/gm)].map(m => m[1]);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.route('**/api/analytics/track', r => r.fulfill({json:{success:true}}));
  await page.route('**/api/public/guest-book**', r => r.fulfill({json:{entries:[]}}));
  const results=[];
  for (const width of [375,1440]) {
    await page.setViewportSize({width,height:900});
    for (const id of ids) {
      try {
        await page.goto(`http://localhost:3000/w/template-${id}`,{waitUntil:'domcontentloaded',timeout:20000});
        await page.locator('#details').first().waitFor({timeout:10000});
        const data = await page.evaluate(() => {
          const counts={}; document.querySelectorAll('[id]').forEach(e=>{if(e.id)counts[e.id]=(counts[e.id]||0)+1});
          return {overflow:document.documentElement.scrollWidth-innerWidth,duplicateIds:Object.entries(counts).filter(([k,n])=>n>1),rsvp:document.querySelectorAll('#rsvp').length};
        });
        results.push({id,width,...data});
      } catch(e){results.push({id,width,error:e.message.slice(0,160)});}
      fs.writeFileSync('audit/template-results.json',JSON.stringify(results,null,2));
    }
    fs.writeFileSync('audit/template-results.json',JSON.stringify(results,null,2));
    console.log(JSON.stringify({width,count:ids.length,errors:results.filter(x=>x.width===width&&x.error),overflow:results.filter(x=>x.width===width&&x.overflow>2),duplicates:results.filter(x=>x.width===width&&x.duplicateIds?.length).length}));
  }
  await browser.close();

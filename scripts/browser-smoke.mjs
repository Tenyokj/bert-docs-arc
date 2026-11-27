import {createRequire} from "node:module";
import {mkdirSync,writeFileSync} from "node:fs";
import assert from "node:assert/strict";
import {docs} from "../assets/docs-data.js";
const require=createRequire(process.env.BERT_FRONTEND_PACKAGE || new URL('../../bert-frontend/package.json',import.meta.url));
const {chromium}=require("@playwright/test");
const base=process.env.DOCS_PREVIEW_URL || "http://127.0.0.1:3200";
assert(["127.0.0.1","localhost"].includes(new URL(base).hostname));
mkdirSync(".qa",{recursive:true});
const browser=await chromium.launch({headless:true});const errors=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',colorScheme:'light',permissions:["clipboard-read","clipboard-write"]});
 const page=await context.newPage();page.on("pageerror",error=>errors.push(error.message));
 await page.goto(base);await page.locator("#doc h1").waitFor();await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:".qa/home-light.png",fullPage:true});
 await page.getByRole("button",{name:"Switch to dark theme",exact:true}).click();
 assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(16, 15, 35)');
 assert(await page.locator('.doc-card').first().evaluate(el=>getComputedStyle(el).backgroundImage.includes('linear-gradient')));
 assert.equal(await page.locator('.doc-card .card-symbol svg').count(),4);
 assert(await page.locator('.site-footer a svg').count()>=16);
 await page.screenshot({path:".qa/home-dark.png",fullPage:true});
 await page.reload();await page.locator('#doc h1').waitFor();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.getByRole('button',{name:'Toggle documentation navigation'}).click();assert(await page.locator('body').evaluate(el=>el.classList.contains('nav-collapsed')));
 await page.getByRole('button',{name:'Toggle documentation navigation'}).click();
 await page.getByRole('button',{name:/Search documentation/}).click();
 await page.getByRole('searchbox').fill('correction deadline');
 await page.locator('.search-result').first().waitFor();
 const first=await page.locator('.search-result').first().getAttribute('data-search-slug');
 await page.getByRole('searchbox').press('ArrowDown');
 const second=await page.locator('.search-result.selected').getAttribute('data-search-slug');assert.notEqual(second,first);
 await page.getByRole('searchbox').press('Enter');await page.waitForURL(`**/#${second}`);
 await page.getByRole('button',{name:/Search documentation/}).click();await page.getByRole('searchbox').fill('zzzz-nothing-in-the-protocol');await page.locator('.empty-search').waitFor();await page.keyboard.press('Escape');
 assert.equal(await page.locator('#searchDialog').evaluate(el=>el.open),false);
 for(const doc of docs){
  await page.evaluate(slug=>location.hash=slug,doc.slug);
  await page.waitForFunction(slug=>document.title.startsWith(slug),doc.title);
  assert.equal(await page.locator('#doc h1').count(),1,doc.slug);
  assert(await page.locator('#doc').innerText(),doc.slug);
 }
 console.log(`PASS all ${docs.length} documentation routes`);
 await page.setViewportSize({width:320,height:900});
 for(const doc of docs){
  await page.evaluate(slug=>location.hash=slug,doc.slug);
  await page.waitForFunction(title=>document.title.startsWith(title),doc.title);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${doc.slug}: overflow at 320`);
 }
 console.log(`PASS all ${docs.length} routes at 320px`);
 for(const slug of ['docs-home','user-v2-delivery','v3-overview','contract-grantmanagerupgradeable','source-current-release']){
  await page.goto(`${base}/#${slug}`);await page.locator('#doc h1').waitFor();
  for(const width of [1440,1190,1024,768,390,320]){
   await page.setViewportSize({width,height:1000});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${slug}: overflow at ${width}`);
   if(width===390)await page.screenshot({path:`.qa/${slug}-mobile.png`});
  }
 }
 await page.setViewportSize({width:390,height:900});await page.goto(base);await page.locator('#doc h1').waitFor();
 await page.evaluate(()=>location.hash='doc');assert.equal(await page.locator('#doc').evaluate(el=>document.activeElement===el),true);
 await page.getByRole('button',{name:'Toggle documentation navigation'}).click();await page.locator('#sidebar.open').waitFor();
 await page.keyboard.press('Escape');assert.equal(await page.locator('#sidebar.open').count(),0);
 await page.goto(`${base}/#contributing-guide`);await page.locator('.code-copy-button').first().waitFor();
 await page.locator('.code-copy-button').first().click();assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).split('\n')[0],'npm ci');
 await page.goto(`${base}/#user-v2-delivery`);await page.locator('#outline a').first().waitFor({state:'attached'});
 const heading=await page.locator('#outline a').first().getAttribute('href');await page.evaluate(hash=>location.hash=hash,heading);await page.waitForURL(`**/${heading}`);
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Blocked')}});});const safe=await blocked.newPage();safe.on('pageerror',error=>errors.push(error.message));await safe.goto(base);await safe.locator('#doc h1').waitFor();
 assert.deepEqual(errors,[]);
 const response=await context.request.get(`${base}/whitepaper/BERTDAO-Protocol-Whitepaper.pdf`);assert(response.ok());
 const animated=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 const motion=await animated.newPage();motion.on('pageerror',error=>errors.push(error.message));await motion.goto(base);await motion.locator('#doc h1').waitFor();
 const section=motion.locator('[data-section-toggle="Getting started"]');
 await section.click();assert.equal(await section.getAttribute('aria-expanded'),'false');
 assert(await motion.locator('.nav-section').first().evaluate(el=>el.querySelector('.nav-section-pages').inert));
 assert(await motion.locator('.nav-section-pages').first().evaluate(el=>parseFloat(getComputedStyle(el).transitionDuration)>0));
 await section.click();await motion.waitForFunction(()=>document.querySelector('.nav-section-pages').getAnimations().length===0);
 assert.equal(await section.getAttribute('aria-expanded'),'true');
 await motion.getByRole('button',{name:'Toggle documentation navigation'}).click();
 assert(await motion.locator('.docs-layout').evaluate(el=>el.getAnimations().length>0));
 await motion.waitForFunction(()=>document.querySelector('.docs-layout').getAnimations().length===0);
 assert(await motion.locator('#sidebar').evaluate(el=>el.inert));
 await motion.getByRole('button',{name:'Toggle documentation navigation'}).click();
 await motion.waitForFunction(()=>document.querySelector('.docs-layout').getAnimations().length===0);
 await motion.screenshot({path:'.qa/home-motion-desktop.png'});
 await motion.setViewportSize({width:390,height:900});
 await motion.getByRole('button',{name:'Toggle documentation navigation'}).click();
 assert(await motion.locator('#sidebar').evaluate(el=>el.getAnimations().length>0));
 await motion.waitForFunction(()=>document.querySelector('#sidebar').getAnimations().length===0);
 await motion.screenshot({path:'.qa/mobile-navigation.png'});
 await motion.getByRole('button',{name:'Close documentation navigation',exact:true}).first().click();
 assert(await motion.locator('#sidebar').evaluate(el=>el.getAnimations().length>0));
 await motion.waitForFunction(()=>document.querySelector('#sidebar').getAnimations().length===0);
 assert.equal(await motion.locator('#sidebar').evaluate(el=>getComputedStyle(el).visibility),'hidden');
 assert.deepEqual(errors,[]);
 writeFileSync('.qa/report.json',JSON.stringify({checkedAt:new Date().toISOString(),routes:docs.length,widths:[1440,1190,1024,768,390,320],errors,checks:['all routes','themes/persistence','icons/cards/footer','animated accordion/desktop/mobile navigation','reduced motion','collapse/mobile Escape','full-text search/arrow/empty','copy code','heading links','blocked storage','PDF'],publicWrites:false},null,2));
 console.log('PASS themes/search/copy/navigation/responsive/PDF; no page errors');
}finally{await browser.close();}

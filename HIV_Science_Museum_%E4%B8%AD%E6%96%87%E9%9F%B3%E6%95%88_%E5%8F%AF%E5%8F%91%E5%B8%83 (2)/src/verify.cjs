const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const sharp=require('sharp');
const {resolve}=require('node:path');
const {mkdir,readFile}=require('node:fs/promises');
const base=process.env.LOCAL_URL||'http://127.0.0.1:4173';
const root=resolve(__dirname,'..');
const dest=process.env.QA_OUTPUT||resolve(root,'qa');
const steps='nav .step, nav ol button, nav #steps button';
const path=id=>'/exhibits/'+id+'/';

(async()=>{
  const {exhibits,museum}=await import('./exhibits.mjs');
  const ids=['home',...exhibits.map(e=>e.id)];
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-gpu','--disable-partial-raster']});
  await mkdir(dest,{recursive:true});
  try{
    const context=await browser.newContext({viewport:{width:1500,height:1100},reducedMotion:'reduce'});
    const errors=[];
    context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
    const page=await context.newPage();
    const online=[];
    await page.route('**/*',route=>{
      if(new URL(route.request().url()).origin===base) return route.continue();
      online.push(route.request().url());
      return route.abort();
    });
    for(const id of ids){
      const response=await context.request.get(base+(id==='home'?'/':path(id)),{headers:{'User-Agent':'Twitterbot/1.0'}});
      assert.equal(response.status(),200);
      const html=await response.text();
      const read=(type,name)=>html.match(new RegExp('<meta '+type+'="'+name+'" content="([^"]+)"'))?.[1];
      assert.equal(read('name','twitter:card'),'summary_large_image');
      assert.equal(read('property','og:image:width'),'1200');
      assert.equal(read('property','og:image:height'),'630');
      assert.ok(read('property','og:title')&&read('property','og:description'));
      const url=new URL(read('property','og:url'));
      const image=new URL(read('property','og:image'));
      assert.equal(url.protocol,'https:');
      assert.equal(url.pathname,id==='home'?'/':path(id));
      assert.equal(image.origin,url.origin);
      assert.equal(image.pathname,'/assets/social/'+id+'.png');
      assert.equal(read('name','twitter:image'),image.href);
      const imageResponse=await context.request.get(base+image.pathname,{headers:{'User-Agent':'Twitterbot/1.0'}});
      assert.equal(imageResponse.status(),200);
      assert.match(imageResponse.headers()['content-type'],/^image\/png/);
      const data=await sharp(await imageResponse.body()).metadata();
      assert.deepEqual([data.width,data.height],[1200,630]);
      if(id!=='home'){
        const copied=await readFile(resolve(root,'dist','simulators',id,'index.html'));
        const archived=await readFile(resolve(root,'machines',id,'index.html'));
        assert.ok(copied.equals(archived));
      }
    }
    console.log('10 direct routes, metadata sets and PNGs; deployed simulator copies byte-identical');
    await page.goto(base+'/');
    assert.equal(await page.locator('.collection a').count(),9);
    assert.equal(await page.locator('iframe').count(),0);
    await page.screenshot({path:resolve(dest,'home-desktop.png'),fullPage:true});
    for(const exhibit of exhibits){
      await page.locator(`.collection a[data-route="${exhibit.id}"]`).click();
      const stage=page.locator('.exhibit-page:visible iframe');
      const frame=stage.contentFrame();
      await frame.locator('.museum-note').waitFor();
      const buttons=frame.locator(steps);
      assert.equal(await buttons.count(),exhibit.steps.length,exhibit.id);
      assert.deepEqual(await buttons.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label'))),exhibit.steps.map(step=>step[1]),exhibit.id);
      assert.equal(await frame.locator('.museum-idea').count(),1,exhibit.id);
      assert.match(await frame.locator('.museum-idea').innerText(),/The big idea:/);
      const reduced=frame.locator('#reduce[type=checkbox]');
      if(await reduced.count() && !await reduced.isChecked()) await reduced.check();
      for(let i=0;i<exhibit.steps.length;i++){
        const button=buttons.nth(i);
        await button.click({timeout:18000});
        const next=i===exhibit.steps.length-1?0:i+1;
        await buttons.nth(next).and(frame.locator(':enabled')).waitFor({timeout:18000});
        assert.equal(await buttons.and(frame.locator(':enabled')).count(),1,exhibit.id+' step '+i);
        if(i<exhibit.steps.length-1){
          const note=await frame.locator('.museum-note h2').innerText();
          assert.equal(note,exhibit.steps[i][1],exhibit.id+' step '+i);
          assert.equal(await frame.locator('.museum-note p').innerText(),exhibit.steps[i][2]);
        }
        for(const anchor of await frame.locator('a[href^="https://"]').all()){
          assert.equal(await anchor.getAttribute('target'),'_blank');
          assert.equal(await anchor.getAttribute('rel'),'noopener noreferrer');
        }
      }
      await page.locator('.navrow .brand').click();
      await page.locator('#landing:visible').waitFor();
    }
    console.log('All exhibit cards; all '+exhibits.reduce((n,e)=>n+e.steps.length,0)+' step buttons, gates, resets, translated step headings and evidence link attributes');
    assert.deepEqual(online,[]);
    assert.deepEqual(errors,[]);
    const flow=await context.newPage();
    await flow.goto(base+path(exhibits[0].id));
    const active=()=>flow.locator('.exhibit-page:visible iframe').contentFrame();
    assert.equal(await flow.locator('iframe').count(),1);
    await active().locator('.museum-note').waitFor();
    const reduce=active().locator('#reduce');
    if(!await reduce.isChecked()) await reduce.check();
    await flow.locator('h1:visible').focus();
    await flow.keyboard.press('Space');
    assert.equal(await active().locator('.museum-note h2').innerText(),exhibits[0].steps[0][1]);
    await flow.locator('h1:visible').focus();
    await flow.keyboard.press('Enter');
    assert.equal(await active().locator('.museum-note h2').innerText(),exhibits[0].steps[1][1]);
    await flow.locator('#museum-menu summary').click();
    assert.equal(await flow.locator('#museum-menu nav a:visible').count(),9);
    assert.equal(await flow.locator('#museum-menu nav img:visible').count(),9);
    await flow.waitForFunction(()=>[...document.querySelectorAll('#museum-menu nav img')].every(img=>img.complete&&img.naturalWidth>0));
    await flow.screenshot({path:resolve(dest,'navigation.png')});
    await flow.locator('#museum-menu nav a').nth(1).click();
    await flow.waitForURL(base+path(exhibits[1].id));
    await flow.locator('.bottom-nav:visible [data-direction=back]').click();
    await flow.waitForURL(base+path(exhibits[0].id));
    await flow.locator('#museum-menu summary').click();
    await flow.keyboard.press('Escape');
    assert.equal(await active().locator('.museum-note h2').innerText(),exhibits[0].steps[1][1]);
    await flow.locator('h1:visible').focus();
    await flow.keyboard.press('ArrowRight');
    await flow.waitForURL(base+path(exhibits[1].id));
    await flow.keyboard.press('ArrowLeft');
    await flow.waitForURL(base+path(exhibits[0].id));
    assert.equal(await active().locator('.museum-note h2').innerText(),exhibits[0].steps[1][1]);
    assert.equal(await flow.locator('iframe').count(),2);
    await flow.goBack();
    await flow.waitForURL(base+path(exhibits[1].id));
    await flow.goForward();
    await flow.waitForURL(base+path(exhibits[0].id));
    assert.equal(await active().locator('.museum-note h2').innerText(),exhibits[0].steps[1][1]);
    const link=active().locator('.museum-note a').first();
    await link.focus();
    await flow.keyboard.press('ArrowRight');
    assert.equal(flow.url(),base+path(exhibits[0].id));
    await context.route(/^https:\/\//,route=>route.fulfill({contentType:'text/html',body:'<title>External reference</title>'}));
    const opened=context.waitForEvent('page');
    await flow.keyboard.press('Enter');
    const popup=await opened;
    await popup.waitForLoadState();
    assert.equal(popup.url(),await link.getAttribute('href'));
    assert.equal(await popup.evaluate(()=>window.opener),null);
    await popup.close();
    assert.equal(await active().locator('.museum-note h2').innerText(),exhibits[0].steps[1][1]);
    await flow.evaluate(()=>{
      Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>{window.sharedExhibit=payload;}});
    });
    await flow.locator('.exhibit-page:visible .share').focus();
    await flow.keyboard.press('Enter');
    const shareUrl=await flow.evaluate(()=>window.sharedExhibit.url);
    assert.equal(new URL(shareUrl).pathname,path(exhibits[0].id));
    assert.equal(await active().locator('.museum-note h2').innerText(),exhibits[0].steps[1][1]);
    await active().locator('body').evaluate(body=>{
      const input=document.createElement('input');
      input.id='test-input';
      body.append(input);
    });
    await active().locator('#test-input').fill('PEP');
    await flow.keyboard.press('Space');
    await flow.keyboard.press('ArrowLeft');
    await flow.keyboard.press('Enter');
    assert.equal(await active().locator('#test-input').inputValue(),'PEP ');
    assert.equal(await active().locator('.museum-note h2').innerText(),exhibits[0].steps[1][1]);
    await active().locator('#test-input').evaluate(input=>input.remove());
    await flow.screenshot({path:resolve(dest,'machine-desktop.png'),fullPage:true});
    console.log('Space/Enter, arrows, Escape, focused link and input, popup/no opener, menu progress, switch/back/forward progress, independent load');
    await flow.goto(base+path('07_hiv_pep'));
    const pep=active();
    const elapsed=pep.getByRole('slider',{name:'可能暴露于 HIV 后经过的时间'});
    await elapsed.waitFor();
    assert.equal(await elapsed.getAttribute('min'),'0');
    assert.equal(await elapsed.getAttribute('max'),'72');
    for(const hour of [24,71,72,0]){
      await elapsed.evaluate((input,value)=>{
        input.value=value;
        input.dispatchEvent(new Event('input',{bubbles:true}));
      },hour);
      assert.equal(await pep.locator('#reading').innerText(),`可能暴露后 ${hour} 小时`);
      assert.match(await pep.locator('#window').innerText(),hour===72?/72 小时上限 · 立即就医评估/:new RegExp(`还有 ${72-hour} 小时`));
      assert.equal(await pep.locator('#course').innerText(),'疗程日历未启动');
      assert.match(await pep.locator('.museum-note p').innerText(),/取决于暴露类型及传播风险/);
      const angle=await elapsed.evaluate((_,hour)=>window.simulatePEP(0,{elapsedHours:hour}).angle,hour);
      assert.equal(await pep.locator('#drawing g[transform$=" 626 274)"]').getAttribute('transform'),`rotate(${angle} 626 274)`);
    }
    await elapsed.press('ArrowRight');
    assert.equal(await elapsed.inputValue(),'1');
    assert.equal(flow.url(),base+path('07_hiv_pep'));
    await elapsed.press('End');
    assert.equal(await elapsed.inputValue(),'72');
    assert.match(await pep.locator('#pep-elapsed-hint').innerText(),/超过 72 小时通常不建议启动 PEP/);
    const later=await elapsed.evaluate(()=>window.simulatePEP(0,{elapsedHours:73}).timing);
    assert.deepEqual(later,{remaining:0,status:'past'});
    assert.equal(await pep.locator('#cursor').isVisible(),false);
    await flow.screenshot({path:resolve(dest,'pep-slider.png'),fullPage:true});
    await flow.locator('.bottom-nav:visible [data-direction=next]').click();
    await flow.goBack();
    assert.equal(await active().getByRole('slider').inputValue(),'72');
    await active().locator(steps).first().click();
    assert.equal(await active().locator('.museum-note h2').innerText(),'启动暴露时钟');
    console.log('PEP range, real keyboard, displayed model and gauge at 0/24/71/72 h, >72 h model, retained selection and lesson restart');
    for(const width of [390,768]){
      const touchContext=await browser.newContext({viewport:{width,height:900},hasTouch:true});
      const mobile=await touchContext.newPage();
      await mobile.goto(base+'/');
      assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth),width);
      if(width===390)await mobile.screenshot({path:resolve(dest,'home-phone.png'),fullPage:true});
      await mobile.locator('.collection a').nth(3).tap();
      const inside=mobile.locator('.exhibit-page:visible iframe').contentFrame();
      await inside.locator('.museum-note').waitFor();
      assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth),width);
      const frameOverflow=await inside.locator('body').evaluate(body=>body.scrollWidth>innerWidth);
      assert.equal(frameOverflow,false);
      if(width===390)await mobile.screenshot({path:resolve(dest,'machine-phone.png'),fullPage:true});
      await inside.locator(steps).first().tap();
      if(width===390){
        for(const exhibit of exhibits.filter(e=>e.id!==exhibits[3].id)){
          await mobile.locator('#museum-menu summary').tap();
          await mobile.locator(`#museum-menu a[data-route="${exhibit.id}"]`).tap();
          const activeFrame=mobile.locator('.exhibit-page:visible iframe').contentFrame();
          await activeFrame.locator('.museum-note').waitFor();
          assert.equal(await activeFrame.locator('body').evaluate(body=>body.scrollWidth>innerWidth),false,exhibit.id);
        }
      }
      await touchContext.close();
    }
    console.log('390px phone and 768px tablet with no horizontal overflow');
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});

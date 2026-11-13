const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.LOCAL_URL||'http://127.0.0.1:4173';
const steps='nav .step, nav ol button, nav #steps button';
(async()=>{
  const {exhibits}=await import('./exhibits.mjs');
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
  try{
    const context=await browser.newContext({viewport:{width:1500,height:1320},reducedMotion:'no-preference'});
    const results=await Promise.allSettled(exhibits.map(async exhibit=>{
      const page=await context.newPage();
      try {
        await page.goto(base+'/exhibits/'+exhibit.id+'/');
        const frame=page.locator('iframe').contentFrame();
        await frame.locator('.museum-note').waitFor();
        const buttons=frame.locator(steps);
        const svg=frame.locator('figure svg').first();
        const capture=()=>svg.evaluate(node=>node.outerHTML);
        let moving=0;
        for(let i=0;i<exhibit.steps.length;i++){
          const before=await capture();
          await buttons.nth(i).click({timeout:20000});
          await page.waitForTimeout(750);
          if(await capture()!==before) moving++;
          const next=i===exhibit.steps.length-1?0:i+1;
          await buttons.nth(next).and(frame.locator(':enabled')).waitFor({timeout:20000});
          if(next)assert.equal(await frame.locator('.museum-note h2').innerText(),exhibit.steps[i][1]);
        }
        assert.ok(moving>0,'No SVG changes detected in '+exhibit.id);
        return exhibit.id+' '+exhibit.steps.length+' animated switches and reset, SVG changes observed in '+moving+' intermediate checks';
      } finally { await page.close(); }
    }));
    for(const result of results){
      if(result.status==='fulfilled')console.log(result.value);
      else{console.error(result.reason);process.exitCode=1;}
    }
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

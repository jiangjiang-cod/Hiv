const {chromium} = require('playwright');
const sharp = require('sharp');
const assert = require('node:assert/strict');
const {resolve} = require('node:path');
const {pathToFileURL} = require('node:url');
const {writeFile} = require('node:fs/promises');
const root = resolve(__dirname, '..');
const paper = '#f5f0e5';
const esc = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function artworkCrop(buffer) {
  return sharp(buffer).trim({threshold:7}).extend({top:15,right:18,bottom:14,left:18,background:'#00000000'}).resize({width:900,height:650,fit:'inside',withoutEnlargement:true}).webp({quality:90}).toBuffer();
}

function composition(museum, exhibit, sources) {
  const cards = sources.map(src=>`<img src="data:image/webp;base64,${src.toString('base64')}" alt="">`).join('');
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>
  *{box-sizing:border-box} body{margin:0;background:${paper};color:#1f2e3d;font-family:"PingFang SC","Hiragino Sans GB",sans-serif}
  .sheet{width:1200px;height:630px;padding:47px 60px;border:15px solid #e5ddcb;display:grid;grid-template-columns:405px 1fr;gap:35px;align-items:center}
  .edition{font:700 17px Georgia;letter-spacing:.16em;border-bottom:1px solid #93836a;padding-bottom:15px}
  .stamp{display:inline-block;font-size:17px;font-weight:600;background:#e9c17a;border:1.2px solid #1f2e3d;border-radius:18px;padding:6px 14px;margin:24px 0 12px}
  h1{font:800 58px/1.14 "Songti SC","PingFang SC",serif;margin:0 0 18px} p{font-size:25px;line-height:1.5;margin:0} small{display:block;font-size:15px;margin-top:30px}
  .images{min-width:0;border:1.2px solid #1f2e3d;border-radius:140px 140px 15px 15px;background:${paper};box-shadow:8px 8px 0 #ddd4c3;padding:17px;height:453px;display:grid;place-items:center;overflow:hidden}
  .images img{width:100%;height:410px;object-fit:contain}
  .many{grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr));gap:9px;padding:35px 13px 10px;border-radius:44px 44px 10px 10px}
  .many img{height:100%;min-height:0;min-width:0}
  </style><body><div class="sheet"><div><div class="edition">HIV SCIENCE MUSEUM</div>
  <div class="stamp">${exhibit ? `展品 ${exhibit.id.slice(0,2)} · ${exhibit.room}` : '九件互动展品'}</div>
  <h1>${esc(exhibit?.name ?? museum.title)}</h1><p>${esc(exhibit?.question ?? museum.subtitle)}</p>
  ${exhibit?`<small>${esc(exhibit.frame)}</small>`:''}</div><div class="images ${exhibit?'':'many'}">${cards}</div></div></body></html>`;
}

(async()=>{
  const {museum, exhibits} = await import('./exhibits.mjs');
  const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-gpu','--disable-partial-raster','--hide-scrollbars']});
  try {
    const page = await browser.newPage({viewport:{width:1500,height:1320},deviceScaleFactor:1});
    const social = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
    const cards = [];
    for (const exhibit of exhibits) {
      await page.goto(pathToFileURL(resolve(root,'machines',exhibit.id,'index.html')).href+'?render');
      await page.evaluate(time=>window.seek(time),exhibit.time);
      const rig=page.locator('figure svg').first();
      await rig.evaluate(node=>{
        node.style.setProperty('border-color','transparent','important');
        for(let parent=node;parent;parent=parent.parentElement){
          parent.style.setProperty('background','transparent','important');
          parent.style.setProperty('box-shadow','none','important');
        }
      });
      await page.addStyleTag({content:'nav,figure .plate,figure .eyebrow,figure .tag,figure figcaption{visibility:hidden!important}'});
      const raw = await rig.screenshot({omitBackground:true});
      const image = await artworkCrop(raw);
      cards.push(image);
      await writeFile(resolve(root,'assets/exhibits',exhibit.id+'.webp'),image);
      await sharp(image).resize(150,104,{fit:'inside'}).webp({quality:80}).toFile(resolve(root,'assets/thumbs',exhibit.id+'.webp'));
      await social.setContent(composition(museum,exhibit,[image]));
      await social.evaluate(()=>document.fonts.ready);
      await social.screenshot({path:resolve(root,'assets/social',exhibit.id+'.png')});
      console.log(exhibit.id,exhibit.time,await page.locator('#'+exhibit.titleId).textContent());
    }
    await social.setContent(composition(museum,null,cards));
    await social.evaluate(()=>document.fonts.ready);
    await social.screenshot({path:resolve(root,'assets/social','home.png')});
    for(const id of ['home',...exhibits.map(exhibit=>exhibit.id)]){
      const data=await sharp(resolve(root,'assets/social',id+'.png')).metadata();
      assert.deepEqual([data.width,data.height],[1200,630]);
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});

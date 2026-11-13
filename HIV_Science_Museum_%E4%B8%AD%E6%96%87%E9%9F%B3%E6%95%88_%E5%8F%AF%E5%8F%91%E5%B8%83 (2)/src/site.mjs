import {MuseumAudio} from './audio.mjs';
import {exhibits, museum} from './exhibits.mjs';

const main = document.querySelector('main');
const panes = document.querySelector('#panes');
const menu = document.querySelector('#museum-menu');
const sound = new MuseumAudio(document.querySelector('#sound-toggle'));
const origin = new URL(document.querySelector('link[rel=canonical]').href).origin;
const routes = new Map(exhibits.map(exhibit=>[exhibit.id,exhibit]));
const visits = new Map();
const interactive = 'a[href],button,summary,input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],[role="textbox"],[role="slider"],[role="menuitem"],[tabindex]:not([tabindex="-1"])';
let landing = document.querySelector('#landing');
let homeRequest;
let current = document.body.dataset.page;

const route = id => id === 'home' ? '/' : '/exhibits/'+id+'/';
const pathId = pathname => pathname.match(/^\/exhibits\/([^/]+)\/?$/)?.[1] ?? 'home';
const readyStep = doc => doc && Array.from(doc.querySelectorAll('nav .step, nav ol button, nav #steps button')).find(button=>!button.disabled);
const field = (name,value) => document.querySelector(`meta[property="${name}"],meta[name="${name}"]`).content=value;
const appendText = (doc,tag,contents) => Object.assign(doc.createElement(tag),{textContent:contents});

function metadata(exhibit) {
  const title = exhibit ? exhibit.name+'｜'+museum.title : museum.title;
  const description = exhibit?.question ?? museum.subtitle;
  const image = origin+'/assets/social/'+(exhibit?.id ?? 'home')+'.png';
  const url = origin+route(exhibit?.id ?? 'home');
  document.title=title;
  document.querySelector('link[rel=canonical]').href=url;
  for(const [name,value] of Object.entries({description,'og:title':title,'og:description':description,'og:image':image,'og:url':url,
    'og:image:alt':exhibit?.frame ?? museum.subtitle,'twitter:title':title,'twitter:description':description,'twitter:image':image,'twitter:image:alt':exhibit?.frame ?? museum.subtitle})) field(name,value);
}

function onShortcut(event) {
  if(event.defaultPrevented || event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if(current==='home' || menu.open || event.target.closest?.(interactive)) return;
  if(event.key==='ArrowLeft' || event.key==='ArrowRight'){
    const next = exhibits[exhibits.findIndex(exhibit=>exhibit.id===current)+(event.key==='ArrowLeft'?-1:1)];
    if(next){event.preventDefault(); navigate(next.id);}
  } else if(event.key===' ' || event.key==='Enter'){
    const button=readyStep(visits.get(current)?.frame.contentDocument);
    if(button){event.preventDefault();button.click();}
  }
}

const frameCss = `
:root{color-scheme:light} body{margin:0!important;min-height:0!important}
body>main{margin:0!important;width:100%!important;max-width:none!important;padding:clamp(9px,1.3vw,19px)!important}
main>header,.museum-replaced{display:none!important}
aside.museum-english-off>:not(.museum-note){display:none!important}
.museum-note{font:400 14px/1.65 "PingFang SC","Microsoft YaHei",system-ui,sans-serif}
.museum-note .museum-label{font-size:11px;letter-spacing:.15em;font-weight:750;margin:0 0 6px}
.museum-note h2{font-size:18px;line-height:1.35;margin:0 0 7px}
.museum-note p{margin:0 0 9px}
.museum-note a{display:block;overflow-wrap:anywhere;text-underline-offset:3px;margin:3px 0}
.museum-note button{border:0;background:transparent!important;padding:3px 0;box-shadow:none;text-decoration:underline;text-underline-offset:3px;font:inherit;text-align:left;cursor:pointer}
.museum-note button:focus-visible,.museum-note a:focus-visible{outline:2px solid #1f2e3d;outline-offset:2px}
.museum-idea{font:500 14px/1.6 "PingFang SC","Microsoft YaHei",system-ui,sans-serif;border-top:1px solid #bbae95;padding:8px 0 0;margin:12px 0 0}
nav button,nav label,nav .museum-controls{font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif}
`;

function enhance(frame, exhibit) {
  const doc=frame.contentDocument;
  const aside=doc.querySelector('aside');
  const frameMain=doc.querySelector('main');
  if(!aside || !frameMain) return;
  const style=appendText(doc,'style',frameCss);
  doc.head.append(style);
  doc.addEventListener('keydown',onShortcut);
  const patchLink = anchor => {
    if(/^https?:/.test(anchor.getAttribute('href')??'')){
      anchor.target='_blank';
      anchor.rel='noopener noreferrer';
    }
  };
  // Capture also covers evidence nodes inserted in the same task as the user's click.
  doc.addEventListener('click',event=>{
    const anchor=event.target.closest?.('a[href]');
    if(anchor) patchLink(anchor);
  },true);
  const nav=doc.querySelector('nav');
  nav.setAttribute('aria-label','顺序操作按钮');
  const stepButtons=[...nav.querySelectorAll('.step, ol button, #steps button')];
  stepButtons.forEach((button,index)=>{
    const step=exhibit.steps[index];
    if(!step) return;
    const label=step[1];
    const ownText=[...button.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim());
    if(ownText.length) ownText.at(-1).textContent=label;
    else{
      const original=button.querySelector('strong,.step-title,.name') ?? button.lastElementChild;
      if(original&&!/^\d+$/.test(original.textContent.trim())) original.textContent=label;
      else button.append(doc.createTextNode(label));
    }
    button.setAttribute('aria-label',label);
    button.lang='zh-CN';
  });
  const navLabel=nav.querySelector('h2,.eyebrow,.kicker,.tag');
  if(navLabel){navLabel.textContent='操作顺序';navLabel.lang='zh-CN';}
  const motion=nav.querySelector('input#reduce');
  if(motion?.parentElement.matches('label')){
    for(const node of motion.parentElement.childNodes){
      if(node.nodeType===Node.TEXT_NODE&&node.textContent.trim()) node.textContent=' 减少动画';
    }
    motion.parentElement.lang='zh-CN';
  }
  const players=[...nav.querySelectorAll('button#tour,button#play,button#pause')];
  // The audio wasn't bundled in the source archive: synthesize it after user opt-in.
  // Click handling remains inside the iframe so it works with mouse, touch and keyboard.
  doc.addEventListener('click',event=>{
    const button=event.target.closest?.('button');
    if(!button || button.disabled || !sound.enabled) return;
    if(players.includes(button)){
      if(/pause/i.test(button.textContent)||/暂停/.test(button.textContent)) sound.stop();
      else if(/resume/i.test(button.textContent)||/继续/.test(button.textContent)) sound.tour(exhibit.id);
      else sound.tour(exhibit.id);
    }else{
      const index=stepButtons.indexOf(button);
      if(index>=0)sound.step(index,exhibit.id);
    }
  },true);

  function translatePlayback(){
    for(const button of players){
      const text=button.textContent;
      const translation=/resume/i.test(text)?'继续导览':/pause/i.test(text)?'暂停导览':/play/i.test(text)?'播放 36 秒导览':null;
      if(translation){button.textContent=translation;button.lang='zh-CN';}
    }
  }
  const playbackObserver=new MutationObserver(translatePlayback);
  players.forEach(button=>playbackObserver.observe(button,{childList:true,characterData:true,subtree:true}));
  translatePlayback();
  const note=doc.createElement('section');
  note.className='museum-note';
  note.lang='zh-CN';
  const heading=appendText(doc,'h2','开始操作');
  const paragraph=appendText(doc,'p',exhibit.idle);
  const noteLabel=appendText(doc,'div','中文讲解');
  noteLabel.className='museum-label';
  const sources=doc.createElement('div');
  sources.setAttribute('aria-label','医学原始资料');
  const english=appendText(doc,'button','展开英文原文');
  english.type='button';
  english.setAttribute('aria-expanded','false');
  english.addEventListener('click',()=>{
    const collapsed=aside.classList.toggle('museum-english-off');
    english.setAttribute('aria-expanded',String(!collapsed));
    english.textContent=collapsed?'展开英文原文':'收起英文原文';
  });
  note.append(noteLabel,heading,paragraph,sources,english);
  aside.prepend(note);
  aside.classList.add('museum-english-off');
  aside.setAttribute('aria-label','医学讲解');
  const oldIdea = [...frameMain.querySelectorAll('p,div#takeaway')].find(node=>node.textContent.trim().startsWith('The big idea:'));
  if(oldIdea){
    const closing=doc.createElement('p');
    closing.className='museum-idea';closing.lang='zh-CN';
    closing.append(appendText(doc,'b','The big idea: '),doc.createTextNode(exhibit.big));
    oldIdea.after(closing);
    oldIdea.classList.add('museum-replaced');
  }
  const title=doc.getElementById(exhibit.titleId);
  const elapsed=doc.getElementById('pep-elapsed');
  if(elapsed){
    elapsed.lang='zh-CN';
    const {limit}=frame.contentWindow.simulatePEP(0).evidence;
    doc.getElementById('pep-time').lang='zh-CN';
    doc.getElementById('pep-elapsed-label').textContent='可能暴露于 HIV 后经过的时间';
    doc.getElementById('pep-scale-start').textContent='0 小时';
    doc.getElementById('pep-scale-end').textContent=limit+' 小时';
    doc.getElementById('pep-elapsed-hint').textContent=`请尽早就医评估。超过 ${limit} 小时通常不建议启动 PEP，仍应就医安排检测和随访。`;
    elapsed.addEventListener('input',sync);
  }
  let contentKey='';
  function sync() {
    const original=[...doc.querySelectorAll('a[href]')].filter(anchor=>!note.contains(anchor));
    original.forEach(patchLink);
    const links=original.filter(anchor=>aside.contains(anchor)&&!anchor.hidden&&anchor.getAttribute('href')?.startsWith('https://'));
    const step=exhibit.steps.find(([key])=>key===title?.textContent.trim());
    const timing=elapsed&&title?.textContent==='Explore elapsed time'
      ? frame.contentWindow.simulatePEP(0,{elapsedHours:elapsed.valueAsNumber})
      : null;
    const key=JSON.stringify([step?.[0],timing?.timing.status,...links.map(anchor=>anchor.href)]);
    if(key===contentKey) return;
    contentKey=key;
    heading.textContent=timing?'自选暴露时间':step?.[1]??'开始操作';
    if(timing){
      const {ideal,limit}=timing.evidence;
      const guidance=timing.timing.status==='deadline'
        ? `已到 ${limit} 小时上限，请立即就医评估。`
        : '请尽快就医评估。越早评估，越有时间在有指征时启动 PEP。';
      paragraph.textContent=`${guidance} 是否需要 PEP 取决于暴露类型及传播风险，由医务人员评估。如有指征，应尽早开始，最好在 ${ideal} 小时内，最迟不超过 ${limit} 小时。`;
    }else{
      paragraph.textContent=step?.[2]??exhibit.idle;
    }
    sources.replaceChildren(...links.map((anchor,index)=>{
      const agency=anchor.hostname.endsWith('cdc.gov')?'CDC':anchor.hostname.endsWith('nih.gov')?'NIH':anchor.hostname.endsWith('who.int')?'WHO':'HIV.gov';
      const link=appendText(doc,'a',agency+' · 原始资料'+(links.length>1?' '+(index+1):'')+' ↗');
      link.href=anchor.href;
      link.title=anchor.textContent.trim();
      patchLink(link);
      return link;
    }));
  }
  new MutationObserver(records=>{
    if(records.some(record=>!note.contains(record.target))) sync();
  }).observe(aside,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['href','hidden']});
  sync();
  // Observe the embedded content so the page scrolls once on both mobile and desktop.
  const resize=()=>{
    if(frame.getBoundingClientRect().width){
      const height=Math.ceil(frameMain.getBoundingClientRect().bottom+3);
      if(height>0 && frame.style.height!==height+'px') frame.style.height=height+'px';
    }
  };
  const frameObserver=new ResizeObserver(resize);
  frameObserver.observe(frameMain);
  const parentObserver=new ResizeObserver(resize);
  parentObserver.observe(frame);
  resize();
}

function neighboring(exhibit, label, direction) {
  if(!exhibit) return '';
  return `<a href="${route(exhibit.id)}" data-route="${exhibit.id}" data-direction="${direction}">${label} · ${exhibit.name}</a>`;
}

function mount(exhibit) {
  if(visits.has(exhibit.id)) return visits.get(exhibit.id).section;
  const i=exhibits.indexOf(exhibit);
  const section=document.createElement('section');
  section.className='wrap exhibit-page';
  section.innerHTML=`<header class="exhibit-head"><p class="eyebrow">展品 ${exhibit.id.slice(0,2)} · ${exhibit.room}</p>
    <h1 tabindex="-1">${exhibit.name}</h1><p class="intro">${exhibit.question}</p>
    <div class="exhibit-tools"><p class="guide"><span><kbd>←</kbd> <kbd>→</kbd> 切换展品</span><span><kbd>空格</kbd> 或 <kbd>Enter</kbd> 操作下一步</span></p><button class="share" type="button">分享展品 ↗</button><span class="share-status" role="status"></span></div></header>
    <nav class="bottom-nav" aria-label="相邻展品">${neighboring(exhibits[i-1],'← 上一台','back')}${neighboring(exhibits[i+1],'下一台 →','next')}</nav>`;
  const share=section.querySelector('.share');
  const status=section.querySelector('.share-status');
  share.addEventListener('click',async()=>{
    const canonical=new URL(document.querySelector('link[rel=canonical]').href);
    const url=canonical.hostname.endsWith('.invalid')?location.href:canonical.href;
    try{
      if(navigator.share){await navigator.share({title:exhibit.name,text:exhibit.question,url});}
      else{await navigator.clipboard.writeText(url);status.textContent='已复制展品链接';}
    }catch(error){
      if(error.name!=='AbortError') status.textContent=url;
    }
  });
  const frame=document.createElement('iframe');
  frame.title=exhibit.name+' · 互动模拟';
  frame.className='machine-frame';
  frame.addEventListener('load',()=>enhance(frame,exhibit));
  frame.src='/simulators/'+exhibit.id+'/';
  section.insertBefore(frame,section.lastElementChild);
  panes.append(section);
  visits.set(exhibit.id,{section,frame});
  return section;
}

async function show(id,{focus=false,hash=''}={}) {
  current=routes.has(id)?id:'home';
  document.body.dataset.page=current;
  if(current==='home'&&!landing){
    homeRequest??=fetch('/home-fragment.html').then(response=>{
      if(!response.ok) throw Error('展馆首页暂时无法加载');
      return response.text();
    }).then(html=>{
      panes.insertAdjacentHTML('beforebegin',html);
      landing=document.querySelector('#landing');
      landing.hidden=current!=='home';
    });
    await homeRequest;
    if(current!=='home') return;
  }
  if(landing) landing.hidden=current!=='home';
  for(const [id,entry] of visits) entry.section.hidden=id!==current;
  const exhibit=routes.get(current);
  const visible=exhibit?mount(exhibit):landing;
  if(visible) visible.hidden=false;
  metadata(exhibit);
  menu.querySelectorAll('[data-route]').forEach(link=>{
    if(link.dataset.route===current) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  if(focus){
    const destination=hash&&document.getElementById(hash.slice(1));
    if(destination) destination.scrollIntoView();
    else{
      window.scrollTo(0,0);
      const h=visible?.querySelector('h1');
      h?.setAttribute('tabindex','-1');
      h?.focus({preventScroll:true});
    }
  }
}

function navigate(id,href=route(id)) {
  if(id!==current) sound.stop();
  menu.open=false;
  if(new URL(href,location.href).href!==location.href) history.pushState(null,'',href);
  show(id,{focus:true,hash:location.hash}).catch(()=>location.assign(href));
}

document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && menu.open){menu.open=false;menu.querySelector('summary').focus();}
  else onShortcut(event);
});
document.addEventListener('click',event=>{
  if(menu.open&&!menu.contains(event.target)) menu.open=false;
  const link=event.target.closest('a[data-route]');
  if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(link.dataset.route,link.href);
});
window.addEventListener('popstate',()=>show(pathId(location.pathname),{focus:true,hash:location.hash}).catch(()=>location.reload()));
show(current).catch(error=>{main.append(appendText(document,'p',error.message));});

import { cp, mkdir, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { exhibits, museum } from './exhibits.mjs';

const here = fileURLToPath(new URL('../', import.meta.url));
const output = here + 'dist/';
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const configured = process.env.SITE_URL || (vercelHost ? 'https://' + vercelHost : '');
if (!configured && process.env.VERCEL) throw Error('Set SITE_URL to the public HTTPS origin in the Vercel project settings.');
const origin = new URL(configured || 'https://hiv-science-museum.invalid');
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
  throw Error('SITE_URL must be an HTTPS origin, e.g. https://museum.yourdomain.com');
}
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const route = e => '/exhibits/' + e.id + '/';
const art = e => '/assets/exhibits/' + e.id + '.webp';
const mark = `<svg aria-hidden="true" viewBox="0 0 42 42" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path fill="#f1cc88" d="M4 12 19 5l18 6-15 7z"/><path fill="#d8a45e" d="M22 18 37 11v17l-15 8z"/><path fill="#b8c9ad" d="M4 12l18 6v18L4 30z"/><path fill="#e4ede2" d="m7 17 11 4v9l-11-4z"/><path d="m9 23 2 1 2-1 3 3m10-5 7-4m-7 8 7-4m-7 8 7-4"/></svg>`;

function metadata(exhibit) {
  const id = exhibit?.id ?? 'home';
  const title = exhibit ? exhibit.name + '｜' + museum.title : museum.title;
  const url = new URL(exhibit ? route(exhibit) : '/',origin).href;
  const description = exhibit?.question ?? museum.subtitle;
  const image = new URL('/assets/social/'+id+'.png',origin).href;
  const tag = (type,key,value) => `<meta ${type}="${key}" content="${escape(value)}">`;
  return `<title>${escape(title)}</title>
${tag('name','description',description)}<link rel="canonical" href="${escape(url)}">
${tag('property','og:type','website')}${tag('property','og:locale','zh_CN')}
${tag('property','og:title',title)}${tag('property','og:description',description)}${tag('property','og:image',image)}${tag('property','og:url',url)}
${tag('property','og:image:width',1200)}${tag('property','og:image:height',630)}${tag('property','og:image:alt',exhibit?.frame ?? museum.subtitle)}
${tag('name','twitter:card','summary_large_image')}${tag('name','twitter:title',title)}${tag('name','twitter:description',description)}${tag('name','twitter:image',image)}${tag('name','twitter:image:alt',exhibit?.frame ?? museum.subtitle)}
${configured?'':tag('name','robots','noindex')}`;
}

const tiles = exhibits.map(e=>`<li><a href="${route(e)}" data-route="${e.id}"><img src="/assets/thumbs/${e.id}.webp" alt="" width="70" height="49"><span>${escape(e.name)}</span></a></li>`).join('');
const navigation = `<header class="masthead"><div class="wrap navrow"><a class="brand" href="/" data-route="home">${mark}<span>${museum.title}<small>HIV SCIENCE MUSEUM</small></span></a><div class="top-actions"><button id="sound-toggle" type="button" aria-pressed="false">♪ 开启声音</button><details id="museum-menu"><summary>选择展品 <span aria-hidden="true">⌄</span></summary><nav aria-label="九台教学机"><ul>${tiles}</ul></nav></details></div></div></header>`;

const featured = exhibits[3];
const cards = exhibits.map(e=>`<li><a class="exhibit" href="${route(e)}" data-route="${e.id}">
  <span class="art" data-room="${escape(e.room)}"><span class="number">${e.id.slice(0,2)}</span><img src="${art(e)}" alt="${escape(e.frame)}" width="800" height="560" loading="lazy"></span>
  <div class="card-copy"><span class="topic">${escape(e.room)}</span><h3>${escape(e.name)}</h3><p>${escape(e.question)}</p><span class="open">操作机器 <span aria-hidden="true">↗</span></span></div>
</a></li>`).join('');
const home = `<div id="landing" class="wrap"><section class="hero"><div class="hero-copy"><p class="eyebrow">HIV SCIENCE MUSEUM</p>
<h1>HIV <span>科学小馆</span></h1><p class="intro">${museum.subtitle}</p>
<p class="intro-detail">转动阀门、观察细胞、对照检测时钟。亲手操作一遍，看看传播需要哪些条件，预防又在哪里起作用。</p>
<a class="gold-button" href="#exhibits">参观九件展品 <span aria-hidden="true">↓</span></a></div>
<figure class="feature"><a href="${route(featured)}" data-route="${featured.id}" aria-label="打开性传播预防机"><div class="hero-window"><img src="${art(featured)}" alt="性传播预防机的剖面，左侧有流体屏障，右侧是细胞观察窗" width="860" height="585" fetchpriority="high"></div>
<figcaption><span>展品 04</span><b>性传播预防机</b><span aria-hidden="true">↗</span></figcaption></a></figure></section>
<section class="exhibits" id="exhibits" aria-labelledby="exhibit-title"><div class="section-head"><h2 id="exhibit-title">互动展品</h2><p>按自己的顺序参观，每台机器都可以从第一步开始操作。</p></div>
<ul class="collection">${cards}</ul></section></div>`;

function shell(exhibit) {
  const content = exhibit ? `<div id="panes"></div><noscript><div class="wrap"><h1>${escape(exhibit.name)}</h1><p>${escape(exhibit.question)}</p><p>启用 JavaScript 即可操作模拟机。</p></div></noscript>` : home + '<div id="panes"></div>';
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${metadata(exhibit)}
<link rel="stylesheet" href="/assets/museum.css"><script type="module" src="/assets/site.mjs"></script>
</head><body data-page="${exhibit?.id ?? 'home'}"><a href="#content" class="skip">跳到主要内容</a>
${navigation}<main id="content" tabindex="-1">${content}</main>
<footer><div class="wrap footer-row"><div class="brand">${mark}<span>${museum.title}</span></div><p>${museum.disclaimer}</p></div></footer></body></html>`;
}

await mkdir(output+'assets', {recursive:true});
await cp(here+'assets',output+'assets',{recursive:true});
await cp(here+'machines',output+'simulators',{recursive:true});
await Promise.all(['museum.css','site.mjs','exhibits.mjs','audio.mjs'].map(file=>cp(here+'src/'+file,output+'assets/'+file)));
await writeFile(output+'index.html',shell(null));
await writeFile(output+'robots.txt','User-agent: *\n'+(configured?'Allow: /\n':'Disallow: /\n'));
await writeFile(output+'home-fragment.html',home);
for(const exhibit of exhibits){
  const directory = output + route(exhibit).slice(1);
  await mkdir(directory,{recursive:true});
  await writeFile(directory+'index.html',shell(exhibit));
}
console.log(`Built ${exhibits.length+1} pages and ${(await readdir(output+'assets/social')).length} social previews for ${origin.origin}`);

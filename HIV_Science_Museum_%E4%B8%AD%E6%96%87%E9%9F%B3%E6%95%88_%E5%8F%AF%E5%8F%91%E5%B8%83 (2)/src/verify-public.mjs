import assert from 'node:assert/strict';
import {exhibits} from './exhibits.mjs';

if(!process.env.SITE_URL) throw Error('Set SITE_URL to the deployed public HTTPS origin');
const origin=new URL(process.env.SITE_URL);
assert.equal(origin.protocol,'https:');
const headers={'User-Agent':'Twitterbot/1.0'};
const pages=[{id:'home',path:'/'},...exhibits.map(exhibit=>({id:exhibit.id,path:'/exhibits/'+exhibit.id+'/'}))];
const failures=await Promise.allSettled(pages.map(async ({id,path})=>{
  const page=new URL(path,origin);
  const response=await fetch(page,{headers,signal:AbortSignal.timeout(15000)});
  assert.equal(response.status,200,page.href);
  assert.equal(new URL(response.url).origin,origin.origin);
  const html=await response.text();
  const read=(type,name)=>html.match(new RegExp('<meta '+type+'="'+name+'" content="([^"]+)"'))?.[1];
  assert.equal(read('property','og:url'),page.href);
  assert.ok(read('property','og:title')&&read('property','og:description'));
  assert.equal(read('name','twitter:card'),'summary_large_image');
  const expectedImage=new URL('/assets/social/'+id+'.png',origin).href;
  assert.equal(read('property','og:image'),expectedImage);
  assert.equal(read('name','twitter:image'),expectedImage);
  const preview=await fetch(expectedImage,{headers,signal:AbortSignal.timeout(15000)});
  assert.equal(preview.status,200,expectedImage);
  assert.equal(new URL(preview.url).origin,origin.origin);
  assert.match(preview.headers.get('content-type')??'',/^image\/png/);
  const data=Buffer.from(await preview.arrayBuffer());
  assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.deepEqual([data.readUInt32BE(16),data.readUInt32BE(20)],[1200,630]);
  console.log('OK',page.href,expectedImage);
}));
for(const result of failures) if(result.status==='rejected'){console.error(result.reason);process.exitCode=1;}

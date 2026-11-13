// Original synthesized soundscape for the exhibition. No audio samples or remote assets.
// Browsers require a visitor gesture to unlock an AudioContext; no audio autoplays.
export class MuseumAudio {
  constructor(button) {
    this.button=button;
    this.enabled=false;
    this.ctx=null;
    this.master=null;
    this.tourGain=null;
    this.seed=7919;
    this.button.addEventListener('click',()=>this.toggle());
    this.update();
  }
  update(){
    this.button.textContent=this.enabled?'🔊 关闭声音':'♪ 开启声音';
    this.button.setAttribute('aria-pressed',String(this.enabled));
    this.button.title='音乐与机械提示音由网页实时合成，无需下载音频';
  }
  async toggle(){
    if(this.enabled){this.enabled=false;this.stop();this.update();return;}
    const Ctor=window.AudioContext||window.webkitAudioContext;
    if(!Ctor){this.button.textContent='当前浏览器不支持音效';this.button.disabled=true;return;}
    try{
      this.ctx??=new Ctor();
      await this.ctx.resume();
      this.master??=this.ctx.createGain();
      this.master.gain.value=.28;
      this.master.connect(this.ctx.destination);
      this.enabled=true;this.update();this.step(0);
    }catch(error){this.button.title=`无法开启声音：${error.message}`;}
  }
  rand(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
  tone(freq,at,dur,vol=.05,type='sine',target=this.master){
    if(!this.enabled||!target||!this.ctx)return;
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(Math.max(freq,1),at);
    g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(vol,.0002),at+.02);
    g.gain.exponentialRampToValueAtTime(.0001,at+Math.max(.05,dur));
    o.connect(g).connect(target);o.start(at);o.stop(at+Math.max(.06,dur)+.02);
  }
  noise(at,dur,vol=.018,target=this.master){
    if(!this.enabled||!target||!this.ctx)return;
    const ctx=this.ctx,len=Math.floor(ctx.sampleRate*Math.max(dur,.02));
    const buffer=ctx.createBuffer(1,len,ctx.sampleRate),arr=buffer.getChannelData(0);
    for(let i=0;i<len;i++)arr[i]=this.rand()*2-1;
    const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    src.buffer=buffer;filter.type='lowpass';filter.frequency.value=1750;
    gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(vol,at+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,at+dur);
    src.connect(filter).connect(gain).connect(target);src.start(at);src.stop(at+dur+.01);
  }
  step(index,exhibitId){
    if(!this.enabled)return;
    const now=this.ctx.currentTime+.015;
    this.tone(680,now,.075,.064,'triangle');
    this.tone(425,now+.065,.085,.031,'sine');
    // A quiet motor, sample tray, clock, and confirmation; none represents actual infection.
    const id=Number(String(exhibitId||'00').slice(0,2))||7;
    if(index%3===0){this.noise(now+.1,.24,.009);this.tone(92+id*4,now+.12,.28,.016,'sawtooth');}
    else if(index%3===1){this.tone(360,now+.1,.26,.023,'triangle');}
    else {this.tone(523.25,now+.15,.25,.023);this.tone(659.25,now+.2,.3,.016);}
  }
  stop(){
    if(!this.tourGain||!this.ctx)return;
    const t=this.ctx.currentTime;
    this.tourGain.gain.cancelScheduledValues(t);
    this.tourGain.gain.setTargetAtTime(.00001,t,.08);
    this.tourGain=null;
  }
  tour(exhibitId){
    if(!this.enabled||!this.ctx)return;
    this.stop();
    const ctx=this.ctx,t0=ctx.currentTime+.025,bus=ctx.createGain();
    bus.gain.setValueAtTime(.48,t0);
    bus.gain.setValueAtTime(.48,t0+34.5);
    bus.gain.linearRampToValueAtTime(.00001,t0+36);
    bus.connect(this.master);this.tourGain=bus;
    const chords=[[174.61,220,261.63,329.63],[164.81,196,246.94,293.66],[146.83,174.61,220,261.63],[130.81,164.81,196,246.94]];
    const bass=[87.31,82.41,73.42,65.41],beat=60/84,bar=beat*4;
    for(let j=0;j<13;j++){
      const when=t0+j*bar;if(when>=t0+35.75)break;
      const chord=chords[j%4];
      for(const [k,note] of chord.entries())this.tone(note,when+.045*k,Math.min(2.58,36-(when-t0)-.05),.027,'sine',bus);
      this.tone(bass[j%4],when,1.4,.09,'sine',bus);
      this.tone(bass[j%4]*1.5,when+2*beat,.42,.024,'triangle',bus);
      if(j>0)for(let b=0;b<4;b++){
        const at=when+beat*b;if(at>=t0+35.9)break;
        this.noise(at+.08,.13,b%2===1?.015:.006,bus);
      }
    }
    for(let i=0;i<46;i++){
      const at=t0+.2+i*.76;
      if(at<t0+35.5)this.noise(at,.022,.0025,bus);
    }
    this.step(0,exhibitId);
  }
}

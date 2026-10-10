'use strict';

/**
 * 零依赖生成一张「人格卡」示例 PNG（布局/配色示意）放进 docs/README。
 * 真实像素级渲染请用 render.js + puppeteer。
 * 手写极简 PNG 编码器（zlib deflate + CRC），在 RGBA 画布上绘制。
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 540, H = 675;
const buf = Buffer.alloc(W * H * 4);

function setPx(x, y, r, g, b, a = 255) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4, na = a / 255;
  buf[i] = Math.round(buf[i] * (1 - na) + r * na);
  buf[i + 1] = Math.round(buf[i + 1] * (1 - na) + g * na);
  buf[i + 2] = Math.round(buf[i + 2] * (1 - na) + b * na);
  buf[i + 3] = 255;
}
function rect(x, y, w, h, r, g, b, a = 255, radius = 0) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    if (radius > 0) {
      const cx = xx < radius ? radius - xx : (xx > w - radius ? xx - (w - radius) : 0);
      const cy = yy < radius ? radius - yy : (yy > h - radius ? yy - (h - radius) : 0);
      if (cx > 0 && cy > 0 && cx * cx + cy * cy > radius * radius) continue;
    }
    setPx(x + xx, y + yy, r, g, b, a);
  }
}
function bar(x, y, len, h, c, a = 255) { rect(x, y, len, h, c[0], c[1], c[2], a, Math.min(3, h / 2)); }

const RED=[218,41,28], YELLOW=[255,199,44], CREAM=[255,248,231], INK=[26,26,26], GOLD=[138,109,31], WHITE=[255,255,255];

// 背景线性渐变（黄->红）
(function bg() {
  const top=[255,217,90], mid=[255,199,44], red=[218,41,28], bot=[176,30,19];
  const lerp=(a,b,k)=>a+(b-a)*k;
  for (let y=0;y<H;y++){
    const t=y/H; let c;
    if(t<0.28) c=[0,1,2].map(i=>lerp(top[i],mid[i],t/0.28));
    else if(t<0.85) c=[0,1,2].map(i=>lerp(mid[i],red[i],(t-0.28)/0.57));
    else c=[0,1,2].map(i=>lerp(red[i],bot[i],(t-0.85)/0.15));
    for(let x=0;x<W;x++) setPx(x,y,c[0],c[1],c[2]);
  }
})();

// 顶部 kicker + 金色 M
bar(W/2-110,34,220,10,WHITE,230);
(function arch(){
  const cx=W/2, top=52, botH=96, legW=14, span=96;
  rect(cx-span/2-legW/2,top,legW,botH-top,...YELLOW);
  rect(cx+span/2-legW/2,top,legW,botH-top,...YELLOW);
  rect(cx-legW/2,top,legW,botH-top,...YELLOW);
  for(let t=0;t<=1;t+=0.01){
    const aw=span/2;
    const lx=cx-span/2+t*aw, ly=top+(1-Math.sin(t*Math.PI))*26;
    rect(lx-1,ly,legW,4,...YELLOW);
    const rx=cx+t*aw, ry=top+(1-Math.sin(t*Math.PI))*26;
    rect(rx-1,ry,legW,4,...YELLOW);
  }
})();

// hero 卡（深色）
rect(30,118,480,150,INK[0],INK[1],INK[2],255,20);
rect(27,115,486,156,YELLOW[0],YELLOW[1],YELLOW[2],60,22);
rect(30,118,480,150,INK[0],INK[1],INK[2],255,20);
bar(W/2-70,138,140,16,YELLOW);          // code
bar(W/2-120,166,240,30,WHITE);          // title
bar(W/2-95,206,190,12,WHITE,220);       // slogan
rect(W/2-90,230,180,26,RED[0],RED[1],RED[2],255,13); // rarity 胶囊

// desc 卡
rect(30,284,480,86,CREAM[0],CREAM[1],CREAM[2],255,16);
bar(50,302,440,10,[120,120,120]); bar(50,320,440,10,[120,120,120]); bar(50,338,300,10,[120,120,120]);

// traits 胶囊
[70,170,270,360].forEach((x,i)=>rect(x,384,i===3?70:88,28,INK[0],INK[1],INK[2],220,14));

// combo 宽卡
rect(30,426,480,120,CREAM[0],CREAM[1],CREAM[2],255,16);
bar(50,444,180,12,GOLD);
for(let r=0;r<3;r++){ bar(50,470+r*22,220-r*20,14,INK); bar(430,470+r*22,50,12,RED); }

// 两个小卡
rect(30,558,232,86,CREAM[0],CREAM[1],CREAM[2],255,16);
bar(48,574,150,10,GOLD); bar(48,596,180,10,INK); bar(48,614,160,10,INK);
rect(278,558,232,86,CREAM[0],CREAM[1],CREAM[2],255,16);
bar(296,574,120,10,GOLD); bar(296,596,170,10,RED); bar(296,614,150,10,RED);

// footer match 条
rect(60,654,420,16,0,0,0,70,8);

// ---- PNG 编码 ----
function png(width,height,rgba){
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const chunk=(type,data)=>{const len=Buffer.alloc(4);len.writeUInt32BE(data.length,0);
    const body=Buffer.concat([Buffer.from(type,'ascii'),data]);
    const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(body)>>>0,0);
    return Buffer.concat([len,body,crc]);};
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);
  ihdr[8]=8;ihdr[9]=6;
  const raw=Buffer.alloc(height*(width*4+1));
  for(let y=0;y<height;y++){raw[y*(width*4+1)]=0;rgba.copy(raw,y*(width*4+1)+1,y*width*4,(y+1)*width*4);}
  const idat=zlib.deflateSync(raw,{level:9});
  return Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))]);
}
const crcTable=(()=>{const t=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c;}return t;})();
function crc32(b){let c=-1;for(let i=0;i<b.length;i++)c=crcTable[(c^b[i])&0xff]^(c>>>8);return c^-1;}

const out=path.join(__dirname,'..','docs','sample-card.png');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,png(W,H,buf));
console.log('✓ 已生成示例人格卡 PNG：'+out);

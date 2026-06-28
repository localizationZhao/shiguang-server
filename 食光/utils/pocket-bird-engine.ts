// Pocket Bird 完整引擎 — 移植自原版 Pocket Bird
// 包含：渲染(Layer/Frame/Anim/Birb) + 帽子 + 物种 + 羽毛 + 行为状态机

import {
  PALETTE, getBirbPixelData, getHatsPixelData,
  SPRITE_WIDTH, SPRITE_HEIGHT, HAT_WIDTH, LAYER_INDICES,
  getLayerPixels,
} from './pocket-bird-sprites';

// ======================== 通用 Canvas 接口 ========================
interface CanvasCtxLike {
  canvas: { width: number; height: number; requestAnimationFrame?: (cb: () => void) => number; cancelAnimationFrame?: (id: number) => void };
  clearRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  fillStyle: string;
  scale(x: number, y: number): void;
}

// ======================== 基础常量 ========================
export const Directions = { LEFT: -1, RIGHT: 1 } as const;
export type Direction = typeof Directions[keyof typeof Directions];

export const Animations = { STILL:'STILL', BOB:'BOB', FLYING:'FLYING', HEART:'HEART' } as const;
export type AnimationType = typeof Animations[keyof typeof Animations];

const TAG_DEFAULT = 'default';

const HOP_SPEED = 0.07, HOP_DIST = 35;
const HOP_CHANCE = 1/(60*3), HOP_DELAY = 600;
const AFK_FLY = 5000;
const PERCH_MIN = 4000, PERCH_MAX = 25000;
const FLY_SPEED = 0.25;
const FEATHER_FALL = 1;          // 1px/帧 = 60px/s
const FEATHER_OSC_PERIOD = 120;  // 120帧周期 = 2秒
const FEATHER_OSC_AMP = 25;      // 25px振幅

// ======================== 物种配色 ========================
export type SpeciesColors = Record<string, string>;

// 基础默认色（必须的颜色）
const DC: SpeciesColors = {
  [PALETTE.TRANSPARENT]:'transparent', [PALETTE.OUTLINE]:'#000000', [PALETTE.BORDER]:'#ffffff',
  [PALETTE.BEAK]:'#000000', [PALETTE.EYE]:'#000000',
  [PALETTE.HEART]:'#c82e2e', [PALETTE.HEART_BORDER]:'#501a1a', [PALETTE.HEART_SHINE]:'#ff6b6b',
  [PALETTE.FEATHER_SPINE]:'#373737',
};

// 从原版抄的默认颜色覆盖：未指定的面部颜色自动继承face/wing等主色
function applyColorOverrides(colors:SpeciesColors):SpeciesColors{
  const c:SpeciesColors = {...DC};
  // 先应用face衍生色
  c[PALETTE.HOOD] = colors.face;
  c[PALETTE.EYEBROW] = colors.face;
  c[PALETTE.UPPER_EYELID] = colors.eyebrow || colors.face;
  c[PALETTE.UPPER_CORNER_EYE] = colors.eyebrow || colors.face;
  c[PALETTE.BEHIND_EYE] = colors.face;
  c[PALETTE.CORNER_EYE] = colors.face;
  c[PALETTE.TEMPLE] = colors.face;
  c[PALETTE.LOWER_EYELID] = colors.face;
  c[PALETTE.NOSE] = colors.face;
  c[PALETTE.NOSE_TIP] = colors.nose || colors.face;
  c[PALETTE.CHEEK] = colors.face;
  c[PALETTE.SCRUFF] = colors.face;
  c[PALETTE.CHIN] = colors.face;
  c[PALETTE.COLLAR] = colors.face;
  c[PALETTE.COLLAR_SCRUFF] = colors.collar || colors.face;
  c[PALETTE.WING_SPOTS] = colors.wing;
  c[PALETTE.SHOULDER] = colors.wing;
  // 再覆盖实际定义的颜色
  for(var k in colors){c[k]=colors[k];}
  // THEME_HIGHLIGHT: 优先用theme-highlight，否则用hood，否则用face
  c[PALETTE.THEME_HIGHLIGHT] = colors[PALETTE.THEME_HIGHLIGHT] || colors.hood || colors.face;
  return c;
}

// 为每个物种预计算完整配色
export function buildFullColors(raw:{colors:SpeciesColors;[key:string]:any}):SpeciesColors{
  return applyColorOverrides(raw.colors);
}

// 稀有度
const COMMON = 'common', UNCOMMON = 'uncommon';

export const SPECIES: Record<string, { colors:SpeciesColors; name:string; tags:string[]; rarity:string }> = {
  // === 常见鸟类 (14种) ===
  bluebird:{colors:{...DC,[PALETTE.FOOT]:'#af8e75',[PALETTE.FACE]:'#639bff',[PALETTE.BELLY]:'#f8b143',[PALETTE.UNDERBELLY]:'#ec8637',[PALETTE.WING]:'#578ae6',[PALETTE.WING_EDGE]:'#326ed9'},name:'东蓝鸲',tags:[],rarity:COMMON},
  shimaEnaga:{colors:{...DC,[PALETTE.FOOT]:'#af8e75',[PALETTE.FACE]:'#ffffff',[PALETTE.BELLY]:'#ebe9e8',[PALETTE.UNDERBELLY]:'#ebd9d0',[PALETTE.WING]:'#f3d3c1',[PALETTE.WING_EDGE]:'#2d2d2d',[PALETTE.THEME_HIGHLIGHT]:'#d7ac93'},name:'银喉长尾山雀',tags:[],rarity:COMMON},
  tuftedTitmouse:{colors:{...DC,[PALETTE.FOOT]:'#af8e75',[PALETTE.FACE]:'#c7cad7',[PALETTE.BELLY]:'#e4e5eb',[PALETTE.UNDERBELLY]:'#d7cfcb',[PALETTE.WING]:'#b1b5c5',[PALETTE.WING_EDGE]:'#9d9fa9',[PALETTE.THEME_HIGHLIGHT]:'#b9abcf'},name:'簇山雀',tags:['tuft'],rarity:COMMON},
  europeanRobin:{colors:{...DC,[PALETTE.FOOT]:'#af8e75',[PALETTE.FACE]:'#ffaf34',[PALETTE.HOOD]:'#aaa094',[PALETTE.BELLY]:'#ffaf34',[PALETTE.UNDERBELLY]:'#babec2',[PALETTE.WING]:'#aaa094',[PALETTE.WING_EDGE]:'#888580',[PALETTE.THEME_HIGHLIGHT]:'#ffaf34'},name:'欧洲知更鸟',tags:[],rarity:COMMON},
  redCardinal:{colors:{...DC,[PALETTE.BEAK]:'#d93619',[PALETTE.FOOT]:'#af8e75',[PALETTE.FACE]:'#31353d',[PALETTE.HOOD]:'#e83a1b',[PALETTE.BELLY]:'#e83a1b',[PALETTE.UNDERBELLY]:'#dc3719',[PALETTE.WING]:'#d23215',[PALETTE.WING_EDGE]:'#b1321c',[PALETTE.COLLAR]:'#e83a1b',[PALETTE.SCRUFF]:'#d23215'},name:'北美红雀',tags:['tuft'],rarity:COMMON},
  americanGoldfinch:{colors:{...DC,[PALETTE.BEAK]:'#ffaf34',[PALETTE.FOOT]:'#af8e75',[PALETTE.FACE]:'#fff255',[PALETTE.NOSE]:'#383838',[PALETTE.HOOD]:'#383838',[PALETTE.BELLY]:'#fff255',[PALETTE.UNDERBELLY]:'#f5ea63',[PALETTE.WING]:'#e8e079',[PALETTE.WING_EDGE]:'#191919',[PALETTE.THEME_HIGHLIGHT]:'#ffcc00'},name:'美洲金翅雀',tags:[],rarity:COMMON},
  barnSwallow:{colors:{...DC,[PALETTE.FOOT]:'#af8e75',[PALETTE.FACE]:'#db7c4d',[PALETTE.BELLY]:'#f7e1c9',[PALETTE.UNDERBELLY]:'#ebc9a3',[PALETTE.WING]:'#2252a9',[PALETTE.WING_EDGE]:'#1c448b',[PALETTE.HOOD]:'#2252a9'},name:'家燕',tags:[],rarity:COMMON},
  mistletoebird:{colors:{...DC,[PALETTE.FOOT]:'#6c6a7c',[PALETTE.FACE]:'#352e6d',[PALETTE.BELLY]:'#fd6833',[PALETTE.UNDERBELLY]:'#e6e1d8',[PALETTE.WING]:'#342b7c',[PALETTE.WING_EDGE]:'#282065'},name:'澳洲啄花鸟',tags:[],rarity:COMMON},
  scarletRobin:{colors:{...DC,[PALETTE.FOOT]:'#494949',[PALETTE.FACE]:'#3d3d3d',[PALETTE.BELLY]:'#fc5633',[PALETTE.UNDERBELLY]:'#dcdcdc',[PALETTE.WING]:'#2b2b2b',[PALETTE.WING_EDGE]:'#ebebeb',[PALETTE.NOSE]:'#ebebeb',[PALETTE.THEME_HIGHLIGHT]:'#fc5633'},name:'红罗宾',tags:[],rarity:COMMON},
  americanRobin:{colors:{...DC,[PALETTE.BEAK]:'#e89f30',[PALETTE.FOOT]:'#9f8075',[PALETTE.FACE]:'#2d2d2d',[PALETTE.BELLY]:'#eb7a3a',[PALETTE.UNDERBELLY]:'#eb7a3a',[PALETTE.WING]:'#444444',[PALETTE.WING_EDGE]:'#232323',[PALETTE.THEME_HIGHLIGHT]:'#eb7a3a'},name:'美洲知更鸟',tags:[],rarity:COMMON},
  carolinaWren:{colors:{...DC,[PALETTE.FOOT]:'#af8e75',[PALETTE.FACE]:'#edc7a9',[PALETTE.NOSE]:'#f7eee5',[PALETTE.HOOD]:'#c58a5b',[PALETTE.BELLY]:'#e1b796',[PALETTE.UNDERBELLY]:'#c79e7c',[PALETTE.WING]:'#c58a5b',[PALETTE.WING_EDGE]:'#866348'},name:'卡罗莱纳鹪鹩',tags:[],rarity:COMMON},
  blackCappedChickadee:{colors:{...DC,[PALETTE.HOOD]:'#363636',[PALETTE.CHEEK]:'#363636',[PALETTE.EYEBROW]:'#363636',[PALETTE.NOSE]:'#363636',[PALETTE.COLLAR]:'#363636',[PALETTE.BELLY]:'#d6d4cf',[PALETTE.UNDERBELLY]:'#cfc5b4',[PALETTE.FACE]:'#eaeaea',[PALETTE.WING]:'#8f8e9a',[PALETTE.WING_EDGE]:'#706f7d',[PALETTE.SCRUFF]:'#8f8e9a',[PALETTE.FOOT]:'#535259'},name:'黑顶山雀',tags:[],rarity:COMMON},
  blueJay:{colors:{...DC,[PALETTE.FOOT]:'#5a626b',[PALETTE.FACE]:'#ebf2ff',[PALETTE.BELLY]:'#e5ecfa',[PALETTE.UNDERBELLY]:'#c4cbd6',[PALETTE.WING]:'#5890ff',[PALETTE.WING_EDGE]:'#3a77e8',[PALETTE.HOOD]:'#6391e8',[PALETTE.NOSE]:'#6391e8',[PALETTE.COLLAR]:'#2e3136',[PALETTE.SCRUFF]:'#6391e8'},name:'冠蓝鸦',tags:['tuft'],rarity:COMMON},
  darkEyedJunco:{colors:{...DC,[PALETTE.FACE]:'#55565e',[PALETTE.WING]:'#5c5f69',[PALETTE.WING_EDGE]:'#444547',[PALETTE.BELLY]:'#6c7180',[PALETTE.UNDERBELLY]:'#b8bbcc',[PALETTE.FOOT]:'#87776d',[PALETTE.BEAK]:'#ab8a98'},name:'暗眼灯草鹀',tags:[],rarity:COMMON},
  houseFinch:{colors:{...DC,[PALETTE.FACE]:'#cc3a3f',[PALETTE.WING]:'#ae8e78',[PALETTE.WING_EDGE]:'#8f6c54',[PALETTE.BELLY]:'#d97c77',[PALETTE.UNDERBELLY]:'#c5a489',[PALETTE.FOOT]:'#705b4c',[PALETTE.BEAK]:'#cf8479',[PALETTE.HOOD]:'#b02f35',[PALETTE.NOSE]:'#ab2b31',[PALETTE.THEME_HIGHLIGHT]:'#ef444d'},name:'家朱雀',tags:[],rarity:COMMON},
  pigeon:{colors:{...DC,[PALETTE.FOOT]:'#ef6e5b',[PALETTE.FACE]:'#5a6c91',[PALETTE.WING_EDGE]:'#65686e',[PALETTE.NOSE]:'#ebebeb',[PALETTE.BELLY]:'#977699',[PALETTE.UNDERBELLY]:'#b0b3ba',[PALETTE.WING]:'#6c7c98',[PALETTE.THEME_HIGHLIGHT]:'#977699'},name:'原鸽',tags:[],rarity:COMMON},
  // === 罕见鸟类 (10种) ===
  redAvadavat:{colors:{...DC,[PALETTE.BEAK]:'#f71919',[PALETTE.FOOT]:'#af7575',[PALETTE.FACE]:'#cb092b',[PALETTE.BELLY]:'#ae1724',[PALETTE.UNDERBELLY]:'#831b24',[PALETTE.WING]:'#7e3030',[PALETTE.WING_EDGE]:'#490f0f',[PALETTE.WING_SPOTS]:'#e8e4e4'},name:'红梅花雀',tags:[],rarity:UNCOMMON},
  pinkRobin:{colors:{...DC,[PALETTE.FACE]:'#403a46',[PALETTE.WING]:'#38333d',[PALETTE.WING_EDGE]:'#252325',[PALETTE.UNDERBELLY]:'#ff7eb8',[PALETTE.BELLY]:'#ff6eaf',[PALETTE.FOOT]:'#3c393c',[PALETTE.THEME_HIGHLIGHT]:'#ff82ba'},name:'粉红鸲鹟',tags:[],rarity:UNCOMMON},
  spangledCotinga:{colors:{...DC,[PALETTE.FACE]:'#62eafe',[PALETTE.CHIN]:'#a12457',[PALETTE.COLLAR]:'#a12457',[PALETTE.BELLY]:'#62eafe',[PALETTE.UNDERBELLY]:'#5cd8ea',[PALETTE.WING]:'#227c89',[PALETTE.WING_EDGE]:'#13353a',[PALETTE.FOOT]:'#68696b',[PALETTE.COLLAR_SCRUFF]:'#62eafe'},name:'闪羽伞鸟',tags:[],rarity:UNCOMMON},
  elegantEuphonia:{colors:{...DC,[PALETTE.WING]:'#2d31a1',[PALETTE.WING_EDGE]:'#191c6d',[PALETTE.FACE]:'#1f2392',[PALETTE.HOOD]:'#6bc6ed',[PALETTE.NOSE_TIP]:'#fd7e1d',[PALETTE.FOOT]:'#555650',[PALETTE.BELLY]:'#ff952b',[PALETTE.UNDERBELLY]:'#fd7e1d',[PALETTE.TEMPLE]:'#57c8fa',[PALETTE.UPPER_CORNER_EYE]:'#57c8fa',[PALETTE.UPPER_EYELID]:'#57c8fa',[PALETTE.COLLAR_SCRUFF]:'#57c8fa',[PALETTE.SCRUFF]:'#57c8fa',[PALETTE.BEAK]:'#252c31',[PALETTE.COLLAR]:'#191c6d'},name:'亮丽歌雀',tags:[],rarity:UNCOMMON},
  paintedBunting:{colors:{...DC,[PALETTE.FACE]:'#5567f0',[PALETTE.UNDERBELLY]:'#f16534',[PALETTE.BELLY]:'#ef3b3b',[PALETTE.WING]:'#a3e65a',[PALETTE.WING_EDGE]:'#91cc50',[PALETTE.SHOULDER]:'#f6fe40',[PALETTE.FOOT]:'#767980'},name:'丽彩鹀',tags:[],rarity:UNCOMMON},
  redWarbler:{colors:{...DC,[PALETTE.FACE]:'#e80a28',[PALETTE.BELLY]:'#d90921',[PALETTE.UNDERBELLY]:'#c70c18',[PALETTE.WING]:'#ba121d',[PALETTE.WING_EDGE]:'#5b3535',[PALETTE.FOOT]:'#5e4645',[PALETTE.BEHIND_EYE]:'#deedff',[PALETTE.TEMPLE]:'#e8f0fa',[PALETTE.CORNER_EYE]:'#d5e4f5',[PALETTE.LOWER_EYELID]:'#e34a61',[PALETTE.BEAK]:'#873535',[PALETTE.CHEEK]:'#db1734'},name:'红头虫莺',tags:[],rarity:UNCOMMON},
  cubanTody:{colors:{...DC,[PALETTE.BEAK]:'#f16f54',[PALETTE.FACE]:'#5ad63e',[PALETTE.CHIN]:'#e8273b',[PALETTE.COLLAR]:'#f12d3e',[PALETTE.BELLY]:'#f6f5e4',[PALETTE.COLLAR_SCRUFF]:'#a3ebff',[PALETTE.UNDERBELLY]:'#eae9d2',[PALETTE.WING]:'#11c751',[PALETTE.WING_EDGE]:'#156631',[PALETTE.FOOT]:'#ac7055',[PALETTE.SCRUFF]:'#11c751',[PALETTE.THEME_HIGHLIGHT]:'#4adc67'},name:'杂色短尾鴗',tags:[],rarity:UNCOMMON},
  violetBackedStarling:{colors:{...DC,[PALETTE.FACE]:'#9c3af2',[PALETTE.WING]:'#8f37ed',[PALETTE.WING_EDGE]:'#5b20c2',[PALETTE.BELLY]:'#ffffff',[PALETTE.UNDERBELLY]:'#f2f2f2',[PALETTE.FOOT]:'#736a66',[PALETTE.COLLAR]:'#b760e6',[PALETTE.NOSE]:'#7a2ec7',[PALETTE.CHEEK]:'#7a2ec7',[PALETTE.NOSE_TIP]:'#7a2ec7'},name:'紫背椋鸟',tags:[],rarity:UNCOMMON},
};
export const ALL_SPECIES = Object.keys(SPECIES);
export const DEFAULT_SPECIES = 'bluebird';

// ======================== 帽子系统 ========================
export const HAT = {
  NONE:'none', TOP_HAT:'top-hat', FEZ:'fez', WIZARD_HAT:'wizard-hat',
  BASEBALL_CAP:'baseball-cap', FLOWER_HAT:'flower-hat', COWBOY_HAT:'cowboy-hat',
  BEANIE:'beanie', SUN_HAT:'sun-hat', VIKING_HELMET:'viking-helmet',
  STRAW_HAT:'straw-hat', CORDOVAN_HAT:'cordovan-hat',
} as const;

export const HAT_ORDER = [HAT.TOP_HAT,HAT.FEZ,HAT.WIZARD_HAT,HAT.BASEBALL_CAP,HAT.FLOWER_HAT,HAT.COWBOY_HAT,HAT.BEANIE,HAT.SUN_HAT,HAT.VIKING_HELMET,HAT.STRAW_HAT,HAT.CORDOVAN_HAT];

export const HAT_META: Record<string,{name:string}> = {
  [HAT.NONE]:{name:'不戴帽'},[HAT.TOP_HAT]:{name:'高顶礼帽'},[HAT.FEZ]:{name:'红圆帽'},
  [HAT.WIZARD_HAT]:{name:'巫师帽'},[HAT.BASEBALL_CAP]:{name:'棒球帽'},[HAT.FLOWER_HAT]:{name:'花帽'},
  [HAT.COWBOY_HAT]:{name:'牛仔帽'},[HAT.BEANIE]:{name:'毛线帽'},[HAT.SUN_HAT]:{name:'太阳帽'},
  [HAT.VIKING_HELMET]:{name:'维京头盔'},[HAT.STRAW_HAT]:{name:'草帽'},[HAT.CORDOVAN_HAT]:{name:'宽檐帽'},
};

function buildHatLayer(spriteSheet:string[][], hatIndex:number, yOffset:number):string[][]{
  const raw = getLayerPixels(spriteSheet, hatIndex, HAT_WIDTH);
  const out:string[][] = [];
  for(let i=0;i<5+yOffset;i++) out.push(new Array(32).fill(PALETTE.TRANSPARENT));
  for(const row of raw){
    const l=new Array(6).fill(PALETTE.TRANSPARENT);
    const r=new Array(14).fill(PALETTE.TRANSPARENT);
    out.push([...l,...row,...r]);
  }
  for(let i=0;i<15-yOffset;i++) out.push(new Array(32).fill(PALETTE.TRANSPARENT));
  // 添加外轮廓
  for(let y=0;y<out.length;y++) for(let x=0;x<out[y].length;x++){
    if(out[y][x]===PALETTE.TRANSPARENT){
      const ns=[out[y-1]?.[x],out[y+1]?.[x],out[y]?.[x-1],out[y]?.[x+1]];
      if(ns.some(n=>n&&n!==PALETTE.TRANSPARENT&&n!==PALETTE.BORDER)) out[y][x]=PALETTE.BORDER;
    }
  }
  return out;
}

function createHatLayers(spriteSheet:string[][]):{base:Layer[];down:Layer[]}{
  const base:Layer[]=[], down:Layer[]=[];
  HAT_ORDER.forEach((hatId,i)=>{
    base.push(new Layer(buildHatLayer(spriteSheet,i,0),hatId));
    down.push(new Layer(buildHatLayer(spriteSheet,i,1),hatId));
  });
  return {base,down};
}

// ======================== Layer / Frame / Anim ========================
export class Layer {
  pixels:string[][]; tag:string;
  constructor(pixels:string[][], tag:string=TAG_DEFAULT){this.pixels=pixels;this.tag=tag;}
}

export class Frame {
  private pbt:Record<string,string[][]>={};
  constructor(layers:Layer[]){
    const tags=new Set<string>(); layers.forEach(l=>tags.add(l.tag)); tags.add(TAG_DEFAULT);
    for(const tag of tags){
      const mh=layers.reduce((m,l)=>Math.max(m,l.pixels.length),0);
      const fd=layers.find(l=>l.tag===TAG_DEFAULT);
      if(!fd) throw new Error('need default layer');
      this.pbt[tag]=fd.pixels.map(r=>r.slice());
      while(this.pbt[tag].length<mh) this.pbt[tag].unshift(new Array(this.pbt[tag][0].length).fill(PALETTE.TRANSPARENT));
      for(let i=1;i<layers.length;i++){
        const l=layers[i];
        if(l.tag===TAG_DEFAULT||l.tag===tag){
          const tm=mh-l.pixels.length;
          for(let y=0;y<l.pixels.length;y++) for(let x=0;x<l.pixels[y].length;x++)
            if(l.pixels[y][x]!==PALETTE.TRANSPARENT) this.pbt[tag][y+tm][x]=l.pixels[y][x];
        }
      }
    }
  }
  getPixels(tags:string[]=[TAG_DEFAULT]):string[][]{
    for(let i=tags.length-1;i>=0;i--) if(this.pbt[tags[i]]) return this.pbt[tags[i]];
    return this.pbt[TAG_DEFAULT];
  }
  draw(ctx:CanvasCtxLike, dir:Direction, ps:number, lw:number, lh:number, cs:Record<string,string>, tags:string[]):void{
    ctx.clearRect(0,0,lw,lh);
    const p=this.getPixels(tags);
    for(let y=0;y<p.length;y++) for(let x=0;x<p[y].length;x++){
      const c=dir===Directions.LEFT?p[y][x]:p[y][p[y].length-x-1];
      ctx.fillStyle=cs[c]??c;
      ctx.fillRect(x*ps,y*ps,ps,ps);
    }
  }
}

export class Anim {
  frames:Frame[]; durations:number[]; loop:boolean;
  private lfi=-1; private ldir:Direction|null=null; private lts:number|null=null;
  constructor(frames:Frame[],durations:number[],loop:boolean=true){this.frames=frames;this.durations=durations;this.loop=loop;}
  dur():number{return this.durations.reduce((a,b)=>a+b,0);}
  private gfi(t:number):number{let td=0;for(let i=0;i<this.durations.length;i++){td+=this.durations[i];if(t<td)return i;}return this.frames.length-1;}
  private cc(){this.lfi=-1;this.ldir=null;}
  private sr(fi:number,d:Direction):boolean{return fi!==this.lfi||d!==this.ldir;}
  draw(ctx:CanvasCtxLike,dir:Direction,ts:number,ps:number,lw:number,lh:number,cs:Record<string,string>,tags:string[]):boolean{
    if(this.lts!==ts){this.cc();this.lts=ts;}
    let t=Date.now()-ts;const dur=this.dur();
    if(this.loop) t%=dur;
    const fi=this.gfi(t);
    if(this.sr(fi,dir)){this.frames[fi].draw(ctx,dir,ps,lw,lh,cs,tags);this.lfi=fi;this.ldir=dir;}
    return !this.loop&&t>=dur;
  }
}

// ======================== Birb ========================
export class Birb {
  ps:number; sw:number; sh:number;
  layers:Record<string,Layer>={}; frames:Record<string,Frame>={}; anims:Record<string,Anim>={};
  curAnim:AnimationType=Animations.BOB; animStart:number=Date.now(); direction:Direction=Directions.RIGHT;
  visible=true; cw:number; ch:number;

  constructor(ps:number){
    this.ps=ps; this.sw=SPRITE_WIDTH; this.sh=SPRITE_HEIGHT;
    const ss=getBirbPixelData();
    const hatLayers=createHatLayers(getHatsPixelData());

    this.layers={
      base:new Layer(getLayerPixels(ss,LAYER_INDICES.base,this.sw)),
      down:new Layer(getLayerPixels(ss,LAYER_INDICES.down,this.sw)),
      h1:new Layer(getLayerPixels(ss,LAYER_INDICES.heartOne,this.sw)),
      h2:new Layer(getLayerPixels(ss,LAYER_INDICES.heartTwo,this.sw)),
      h3:new Layer(getLayerPixels(ss,LAYER_INDICES.heartThree,this.sw)),
      tuftB:new Layer(getLayerPixels(ss,LAYER_INDICES.tuftBase,this.sw),'tuft'),
      tuftD:new Layer(getLayerPixels(ss,LAYER_INDICES.tuftDown,this.sw),'tuft'),
      wUp:new Layer(getLayerPixels(ss,LAYER_INDICES.wingsUp,this.sw)),
      wDn:new Layer(getLayerPixels(ss,LAYER_INDICES.wingsDown,this.sw)),
      hEye:new Layer(getLayerPixels(ss,LAYER_INDICES.happyEye,this.sw)),
    };

    this.frames={
      base:new Frame([this.layers.base,this.layers.tuftB,...hatLayers.base]),
      hd:new Frame([this.layers.down,this.layers.tuftD,...hatLayers.down]),
      wDn:new Frame([this.layers.base,this.layers.tuftB,this.layers.wDn,...hatLayers.base]),
      wUp:new Frame([this.layers.down,this.layers.tuftD,this.layers.wUp,...hatLayers.down]),
      hr1:new Frame([this.layers.base,this.layers.tuftB,this.layers.hEye,...hatLayers.base,this.layers.h1]),
      hr2:new Frame([this.layers.base,this.layers.tuftB,this.layers.hEye,...hatLayers.base,this.layers.h2]),
      hr3:new Frame([this.layers.base,this.layers.tuftB,this.layers.hEye,...hatLayers.base,this.layers.h3]),
      hr4:new Frame([this.layers.base,this.layers.tuftB,this.layers.hEye,...hatLayers.base,this.layers.h2]),
    };

    this.anims={
      [Animations.STILL]:new Anim([this.frames.base],[1000]),
      [Animations.BOB]:new Anim([this.frames.base,this.frames.hd],[420,420]),
      [Animations.FLYING]:new Anim([this.frames.base,this.frames.wUp,this.frames.hd,this.frames.wDn],[30,80,30,60]),
      [Animations.HEART]:new Anim([this.frames.hr1,this.frames.hr2,this.frames.hr3,this.frames.hr4,this.frames.hr3,this.frames.hr4,this.frames.hr3,this.frames.hr4],[60,80,250,250,250,250,250,250],false),
    };

    this.cw=this.frames.base.getPixels()[0].length*ps;
    this.ch=this.sh*ps;
  }

  draw(ctx:CanvasCtxLike, species:SpeciesColors, tags:string[]):boolean{
    const a=this.anims[this.curAnim]; if(!a) return false;
    return a.draw(ctx,this.direction,this.animStart,this.ps,this.cw,this.ch,species,tags);
  }
  setAnim(a:AnimationType){this.curAnim=a;this.animStart=Date.now();}
  setDir(d:Direction){this.direction=d;}
}

// ======================== 抛物线 ========================
// 原版抛物线：角度基准的中点 + 贝塞尔
function plerp(sx:number,sy:number,ex:number,ey:number,t:number,intensity:number=2.5):{x:number;y:number}{
  const dx=ex-sx, dy=ey-sy, dist=Math.sqrt(dx*dx+dy*dy);
  const ang=Math.atan2(dy,dx);
  const mx=sx+Math.cos(ang)*dist/2, my=sy+Math.sin(ang)*dist/2+dist/4*intensity;
  return {x:(1-t)*(1-t)*sx+2*(1-t)*t*mx+t*t*ex, y:(1-t)*(1-t)*sy+2*(1-t)*t*my+t*t*ey};
}

// ======================== 行为状态机 ========================
export const States = {IDLE:'idle',HOP:'hop',FLYING:'flying',PERCHING:'perching',PETTING:'petting'} as const;
export type State = typeof States[keyof typeof States];

export interface BehaviorAPI {
  update():void; draw(ctx:CanvasCtxLike):boolean;
  pet():void; getX():number; getY():number; getDir():Direction; getState():State;
  setFrozen(f:boolean):void;
  setFlyMode(on:boolean):void;
  setTargets(ts:{x:number;y:number;w:number;h:number}[]):void;
  switchSpecies(key:string):void; switchHat(hat:string):void;
  getCurrentSpecies():string; getCurrentHat():string;
  getUnlocked():string[]; getUnlockedHats():string[];
  unlockSpecies(key:string):void; unlockHat(key:string):void; unlockAll():void; resetAll():void;
  showMenu():boolean; hideMenu():void; isMenuOpen():boolean;
}

export const PET_MSGS = ['啾啾啾~','呀~~','摸摸摸！','咕咕~','我是东蓝鸲！','嘿嘿~','叽！','人，今天吃点儿什么？'];

export function createBehavior(birb:Birb, sw:number, sh:number):BehaviorAPI{
  const M=20;
  let state:State=States.IDLE, ss=Date.now();
  let bx=sw/2, by=40, dir:Direction=Directions.RIGHT;
  let sx=0,sy=0,tx=0,ty=0, frozen=false, pet=0, prePet:State=States.IDLE;
  let curSp=DEFAULT_SPECIES, curHat=HAT.NONE;
  var unlocked:string[]=[DEFAULT_SPECIES], unlockedHats:string[]=[HAT.NONE];
  var elementTargets:{x:number;y:number;w:number;h:number}[]=[];
  var flyMode=true;
  let menuOpen=false;

  // 从storage读解锁数据
  try{
    const us=wx.getStorageSync('birdUnlockedSpecies');
    if(us&&us.length) unlocked=us;
    const uh=wx.getStorageSync('birdUnlockedHats');
    if(uh&&uh.length) unlockedHats=uh;
    const cs=wx.getStorageSync('birdSpecies'); if(cs&&SPECIES[cs]) curSp=cs;
    const ch=wx.getStorageSync('birdHat'); if(ch&&HAT_ORDER.includes(ch)) curHat=ch;
  }catch(e){}

  function saveData(){
    try{
      wx.setStorageSync('birdUnlockedSpecies',unlocked);
      wx.setStorageSync('birdUnlockedHats',unlockedHats);
      wx.setStorageSync('birdSpecies',curSp);
      wx.setStorageSync('birdHat',curHat);
    }catch(e){}
  }

  function upPath(spd:number,intensity:number=2.5):boolean{
    const e=Date.now()-ss, dx=tx-sx, dy=ty-sy, dist=Math.sqrt(dx*dx+dy*dy);
    let s=spd;
    if(dist>Math.max(sw,sh)/2) s*=1.3;
    const amt=Math.min(1,e/(dist/s));
    const p=plerp(sx,sy,tx,ty,amt,intensity);
    bx=p.x; by=p.y;
    if(Math.abs(bx-tx)<1&&Math.abs(by-ty)<1){bx=tx;by=ty;return true;}
    if(tx>bx) dir=Directions.RIGHT; else if(tx<bx) dir=Directions.LEFT;
    birb.setDir(dir);
    return false;
  }

  function rndPos():{x:number;y:number}{
    if(elementTargets.length>0&&Math.random()<0.85){
      var el=elementTargets[Math.floor(Math.random()*elementTargets.length)];
      return {x:el.x+Math.random()*el.w, y:sh-el.y};
    }
    return {x:M+Math.random()*(sw-birb.cw-M*2), y:sh*0.1+Math.random()*sh*0.7};
  }

  function flyPos():void{state=States.FLYING;ss=Date.now();sx=bx;sy=by;const t=rndPos();tx=t.x;ty=t.y;birb.setAnim(Animations.FLYING);}
  function flyBot():void{state=States.FLYING;ss=Date.now();sx=bx;sy=by;tx=M+Math.random()*(sw-birb.cw-M*2);ty=40;birb.setAnim(Animations.FLYING);}
  function hop():void{if(state!==States.IDLE)return;state=States.HOP;ss=Date.now();sx=bx;sy=by;ty=by;
    dir=Math.random()<0.5?Directions.LEFT:Directions.RIGHT;
    const d=HOP_DIST+Math.random()*20;
    tx=dir===Directions.RIGHT?Math.min(bx+d,sw-M):Math.max(bx-d,M);
    birb.setDir(dir);birb.setAnim(Animations.FLYING);
  }

  const api:BehaviorAPI={
    update(){
      if(frozen)return; const n=Date.now();
      switch(state){
        case States.IDLE:{const e=n-ss; if(flyMode&&e>AFK_FLY) flyPos(); else if(e>HOP_DELAY&&Math.random()<HOP_CHANCE) hop(); break;}
        case States.HOP:{if(upPath(HOP_SPEED,2.5)){state=States.IDLE;ss=n;by=40;birb.setAnim(Animations.BOB);} break;}
        case States.FLYING:{if(upPath(FLY_SPEED,2)){if(ty<=45){state=States.IDLE;ss=n;by=40;birb.setAnim(Animations.BOB);}else{state=States.PERCHING;ss=n;pet=n+PERCH_MIN+Math.random()*(PERCH_MAX-PERCH_MIN);birb.setAnim(Animations.BOB);}} break;}
        case States.PERCHING:{if(n>=pet){Math.random()<0.2?flyBot():flyPos();}else if(n-ss>HOP_DELAY&&Math.random()<HOP_CHANCE*0.3){hop();} break;}
        case States.PETTING:break;
      }
    },
    draw(ctx:CanvasCtxLike):boolean{
      if(!birb.visible)return false;
      bx=Math.max(M,Math.min(sw-birb.cw-M,bx)); by=Math.max(0,Math.min(sh-birb.ch,by));
      const sp=SPECIES[curSp];const tags=[...sp.tags,curHat];
      const colors=buildFullColors(sp);
      const done=birb.draw(ctx,colors,tags);
      if(done&&state===States.PETTING){state=prePet;ss=Date.now();birb.setAnim(Animations.BOB);}
      return done;
    },
    pet(){if(state===States.PETTING)return;prePet=state;state=States.PETTING;ss=Date.now();birb.setAnim(Animations.HEART);},
    getX():number{return bx;}, getY():number{return by;}, getDir():Direction{return dir;}, getState():State{return state;},
    setFrozen(f:boolean){frozen=f;if(!f)ss=Date.now();},
    setFlyMode(on:boolean){flyMode=on;if(!on&&state===States.PERCHING){flyBot();}},
    moveTo(nx:number,ny:number){bx=nx;by=ny;state=States.PERCHING;ss=Date.now();pet=Date.now()+PERCH_MIN+Math.random()*(PERCH_MAX-PERCH_MIN);birb.setAnim(Animations.BOB);},
    setTargets(ts:{x:number;y:number;w:number;h:number}[]){elementTargets=ts;},
    switchSpecies(key:string){if(SPECIES[key]){curSp=key;saveData();}},
    switchHat(hat:string){curHat=hat;saveData();},
    getCurrentSpecies():string{return curSp;}, getCurrentHat():string{return curHat;},
    getUnlocked():string[]{return unlocked;}, getUnlockedHats():string[]{return unlockedHats;},
    unlockSpecies(key:string){if(SPECIES[key]&&unlocked.indexOf(key)<0){unlocked.push(key);saveData();}},
    unlockHat(key:string){if(HAT_ORDER.indexOf(key)>=0&&unlockedHats.indexOf(key)<0){unlockedHats.push(key);saveData();}},
    unlockAll(){unlocked=ALL_SPECIES.slice();unlockedHats=HAT_ORDER.slice();saveData();},
    resetAll(){unlocked=[DEFAULT_SPECIES];unlockedHats=[HAT.NONE];curSp=DEFAULT_SPECIES;curHat=HAT.NONE;saveData();},
    showMenu():boolean{menuOpen=true;return true;},
    hideMenu(){menuOpen=false;},
    isMenuOpen():boolean{return menuOpen;},
  };
  return api;
}

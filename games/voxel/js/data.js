'use strict';
// =====================================================================
// DATA: blocks, items, recipes, enchantments, trades, brewing, dimensions
// =====================================================================
const DIRV=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]], OPP=[1,0,3,2,5,4];   // 0:+x 1:-x 2:+y 3:-y 4:+z 5:-z
const HDIRS=[0,1,4,5];

// ---------------------------------------------------------------------
// BLOCK REGISTRY
// ---------------------------------------------------------------------
const AIR=0,GRASS=1,DIRT=2,STONE=3,SAND=4,WATER=5,LOG=6,LEAVES=7,SNOW=8,PLANKS=9,COAL_ORE=10,IRON_ORE=11,BEDROCK=12,GLASS=13,BRICK=14,GRAVEL=15,
      COBBLE=16,GOLD_ORE=17,DIAMOND_ORE=18,LAVA=19,TORCH=20,GOLD_BLOCK=21,DIAMOND_BLOCK=22,CRAFTING_TABLE=23,FURNACE=24,FURNACE_LIT=25,CHEST=26,WOOL=27,BED=28,
      OBSIDIAN=29,NETHERRACK=30,GLOWSTONE=31,SOUL_SAND=32,QUARTZ_ORE=33,END_STONE=34,PORTAL=35,END_PORTAL=36,END_FRAME=37,END_FRAME_EYE=38,END_CRYSTAL=39,SPAWNER=40,ENCHANT_TABLE=41,EMERALD_ORE=42,STONE_BRICK=43,
      FLOW_WATER=44,FLOW_LAVA=45,FARMLAND=46,FARMLAND_WET=47,TALL_GRASS=48,FLOWER_RED=49,FLOWER_YELLOW=50,SAPLING=51,WHEAT0=52,WHEAT1=53,WHEAT2=54,WHEAT3=55,SUGAR_CANE=56,
      WART0=57,WART1=58,WART2=59,NETHER_BRICK=60,BREWING_STAND=61,REDSTONE_ORE=62,WIRE_OFF=63,WIRE_ON=64,RTORCH_ON=65,RTORCH_OFF=66,LEVER_OFF=67,LEVER_ON=68,BUTTON=69,BUTTON_ON=70,
      PLATE=71,PLATE_ON=72,LAMP_OFF=73,LAMP_ON=74,TNT=75,PISTON=76,PISTON_EXT=77,PISTON_HEAD=78,STICKY=79,STICKY_EXT=80,STICKY_HEAD=81,REPEATER_OFF=82,REPEATER_ON=83,REDSTONE_BLOCK=84,
      DOOR_B=85,DOOR_T=86,DOOR_B_O=87,DOOR_T_O=88,
      SLAB_OAK=89,SLAB_COBBLE=90,SLAB_STONE=91,SLAB_BRICK=92,SLAB_SAND=93,STAIRS_OAK=94,STAIRS_COBBLE=95,STAIRS_BRICK=96,STAIRS_SAND=97,STAIRS_RED=98,
      FENCE=99,FENCE_GATE=100,GLASS_PANE=101,LADDER=102,CACTUS=103,SANDSTONE=104,CLAY=105,MOSSY_COBBLE=106,LAPIS_ORE=107,LAPIS_BLOCK=108,PUMPKIN=109,JACK_O_LANTERN=110,
      MELON=111,HAY=112,BOOKSHELF=113,ICE=114,DEAD_BUSH=115,CARROTS0=116,CARROTS1=117,POTATOES0=118,POTATOES1=119,PUMPKIN_STEM=120,MELON_STEM=121,FIRE=122,
      IRON_BLOCK=123,WOOL_C=124,CARPET=139,EMERALD_BLOCK=155,COAL_BLOCK=156,SNOW_BLOCK=157,PACKED_ICE=158,SPRUCE_LOG=159,SPRUCE_LEAVES=160,JUNGLE_LOG=161,JUNGLE_LEAVES=162,VINE=163,LILY=164,
      COPPER_ORE=165,COPPER_BLOCK=166,COPPER_EXPOSED=167,COPPER_WEATHERED=168,COPPER_OXIDIZED=169,LIGHTNING_ROD=170,COPPER_TORCH=171,COPPER_BARS=172;
// colours: index 0 = white (plain), 1-15 used for wool, carpets and dyes (multiplied in the shader)
const COLOR_NAMES=['White','Orange','Magenta','Light blue','Yellow','Lime','Pink','Gray','Light gray','Cyan','Purple','Blue','Brown','Green','Red','Black'];
const TINT_RGB=[[1,1,1],[1.04,0.55,0.13],[0.83,0.33,0.79],[0.25,0.73,0.89],[1.06,0.88,0.25],[0.52,0.8,0.13],[1.0,0.58,0.71],[0.3,0.33,0.35],[0.65,0.65,0.63],[0.09,0.63,0.63],[0.57,0.21,0.76],[0.25,0.29,0.71],[0.55,0.36,0.21],[0.39,0.52,0.09],[0.74,0.2,0.16],[0.13,0.13,0.15],
  [0.62,0.85,0.45],[0.45,0.7,0.35],[0.55,0.75,0.5],[0.72,0.8,0.55]];   // 16-19: plant tints for swamp, jungle, taiga, savanna-ish
// new item ids (declared early so block drops can use them)
const LAPIS=332,DYE=333,CARROT=348,POTATO=349,BAKED_POTATO=350,PUMPKIN_SEEDS=351,MELON_SLICE=352,MELON_SEEDS=353,PUMPKIN_PIE=354,EGG=355,FEATHER=356,CHICKEN=357,CHICKEN_C=358,
      STRING=359,SPIDER_EYE=360,SLIMEBALL=361,LEATHER=362,FISHING_ROD=363,FISH=364,FISH_C=365,COMPASS=366,CLOCK=367,SHIELD=368,HELM_L=369,CHEST_L=370,LEGS_L=371,BOOTS_L=372,
      HELM_G=373,CHEST_G=374,LEGS_G=375,BOOTS_G=376,BOOK=377,PAPER=378,CLAY_BALL=379,BRICK_ITEM=380,SNOWBALL=381,BOAT=382,RAW_COPPER=383,COPPER_INGOT=384,
      PICK_C=385,AXE_C=386,SHOVEL_C=387,SWORD_C=388,HOE_C=389,HELM_C=390,CHEST_C=391,LEGS_C=392,BOOTS_C=393,MACE=394,HEAVY_CORE=395,GUST_ROD=396,WIND_CHARGE=397;
const dyeOf=c=>c===0?312:DYE+c-1;   // 312 = bone meal (white dye)
let layerCount=0; const T={}; const L=n=>{T[n]=layerCount++;};
['GRASS_TOP','GRASS_SIDE','DIRT','STONE','SAND','WATER','LOG_SIDE','LOG_TOP','LEAVES','SNOW','PLANKS','COAL','IRON','BEDROCK','GLASS','BRICK','GRAVEL','SNOW_SIDE',
 'COBBLE','GOLD_ORE','DIAMOND_ORE','LAVA','TORCH','GOLD_BLOCK','DIAMOND_BLOCK','TABLE_TOP','TABLE_SIDE','FURNACE_TOP','FURNACE_SIDE','FURNACE_FRONT','FURNACE_LIT','CHEST_TOP','CHEST_SIDE','CHEST_FRONT','WOOL','BED_TOP','BED_SIDE',
 'OBSIDIAN','NETHERRACK','GLOWSTONE','SOUL_SAND','QUARTZ_ORE','END_STONE','PORTAL','END_PORTAL','END_FRAME_TOP','END_FRAME_SIDE','END_FRAME_EYE','END_CRYSTAL','SPAWNER','ENCHANT_TOP','ENCHANT_SIDE','EMERALD_ORE','STONE_BRICK','XP_ORB',
 'FARMLAND','FARMLAND_WET','TALL_GRASS','FLOWER_RED','FLOWER_YELLOW','SAPLING','WHEAT0','WHEAT1','WHEAT2','WHEAT3','CANE','WART0','WART1','WART2','NETHER_BRICK','BREWING','REDSTONE_ORE',
 'WIRE_OFF','WIRE_ON','RTORCH_ON','RTORCH_OFF','LEVER_OFF','LEVER_ON','BUTTON','PLATE','LAMP_OFF','LAMP_ON','TNT_TOP','TNT_SIDE','TNT_BOTTOM','PISTON_FRONT','PISTON_SIDE','PISTON_BACK','PISTON_OPEN',
 'PISTON_HEAD','STICKY_FRONT','STICKY_HEAD','REPEATER_OFF','REPEATER_ON','REDSTONE_BLOCK','DOOR_BOT','DOOR_TOP',
 'CRACK0','CRACK1','CRACK2','CRACK3','CRACK4','CRACK5','CRACK6','CRACK7','CRACK8','CRACK9',
 'I_STICK','I_COAL','I_IRON','I_GOLD','I_DIAMOND','I_PICK_W','I_PICK_S','I_PICK_I','I_PICK_D','I_SWORD_W','I_SWORD_S','I_SWORD_I','I_SWORD_D','I_AXE_W','I_AXE_S','I_AXE_I','I_AXE_D','I_SHOVEL_W','I_SHOVEL_S','I_SHOVEL_I','I_SHOVEL_D',
 'I_HOE_W','I_HOE_S','I_HOE_I','I_HOE_D',
 'I_HELM_I','I_CHEST_I','I_LEGS_I','I_BOOTS_I','I_HELM_D','I_CHEST_D','I_LEGS_D','I_BOOTS_D','I_PORK','I_PORK_C','I_BEEF','I_BEEF_C','I_MUTTON','I_MUTTON_C','I_APPLE','I_ROTTEN','I_ARROW','I_BOW','I_SHEARS',
 'I_FLINT','I_FLINT_STEEL','I_PEARL','I_ROD','I_POWDER','I_EYE','I_QUARTZ','I_EMERALD',
 'I_SEEDS','I_WHEAT','I_BREAD','I_BONE','I_BONE_MEAL','I_SUGAR','I_WART','I_BOTTLE','I_WATER_BOTTLE','I_AWKWARD','I_POT_HEAL','I_POT_REGEN','I_POT_STRENGTH','I_POT_SPEED','I_POT_FIRE','I_POT_NIGHT',
 'I_REDSTONE','I_BUCKET','I_WATER_BUCKET','I_LAVA_BUCKET','I_DOOR','I_GUNPOWDER','I_REPEATER',
 'LADDER','CACTUS_TOP','CACTUS_SIDE','SANDSTONE_TOP','SANDSTONE_SIDE','CLAY','MOSSY_COBBLE','LAPIS_ORE','LAPIS_BLOCK','PUMPKIN_TOP','PUMPKIN_SIDE','JACK_FACE','MELON_TOP','MELON_SIDE',
 'HAY_TOP','HAY_SIDE','BOOKSHELF','ICE','DEAD_BUSH','CARROT0','CARROT1','POTATO0','POTATO1','STEM','FIRE','IRON_BLOCK','EMERALD_BLOCK','COAL_BLOCK','PACKED_ICE',
 'SPRUCE_LOG','SPRUCE_TOP','SPRUCE_LEAVES','JUNGLE_LOG','JUNGLE_LEAVES','VINE','LILY',
 'I_LAPIS','I_DYE','I_CARROT','I_POTATO','I_BAKED_POTATO','I_PUMPKIN_SEEDS','I_MELON_SLICE','I_MELON_SEEDS','I_PIE','I_EGG','I_FEATHER','I_CHICKEN','I_CHICKEN_C','I_STRING','I_SPIDER_EYE',
 'I_SLIMEBALL','I_LEATHER','I_FISHING_ROD','I_FISH','I_FISH_C','I_COMPASS','I_CLOCK','I_SHIELD','I_HELM_L','I_CHEST_L','I_LEGS_L','I_BOOTS_L','I_HELM_G','I_CHEST_G','I_LEGS_G','I_BOOTS_G',
 'I_BOOK','I_PAPER','I_FENCE','I_GATE','I_PANE','I_CLAY_BALL','I_BRICK','I_SNOWBALL','I_BOAT','I_CAKE',
 'COPPER_ORE','COPPER0','COPPER1','COPPER2','COPPER3','LIGHTNING_ROD','I_RAW_COPPER','I_COPPER_INGOT','I_LIGHTNING_ROD',
 'COPPER_TORCH','COPPER_BARS','I_PICK_C','I_AXE_C','I_SHOVEL_C','I_SWORD_C','I_HOE_C','I_HELM_C','I_CHEST_C','I_LEGS_C','I_BOOTS_C','I_MACE','I_HEAVY_CORE','I_GUST_ROD','I_WIND_CHARGE'].forEach(L);
const NUM_LAYERS=layerCount;

const BLOCKS=[]; const U8=()=>new Uint8Array(256);
const SOLID=U8(),TRANSPARENT=U8(),LIGHT_PASS=U8(),EMIT=U8(),TRANSLUCENT=U8(),PLANT=U8(),DECAL=U8(),LIQ=U8(),DIRTYPE=U8(),WASHABLE=U8(),REPLACE=U8(),GROW=U8(),RS=U8(),TILEBLK=U8(),SUPPORT=U8();
// SHAPE: 1 slab, 2 stairs, 3 fence, 4 pane, 5 fence gate, 6 cactus, 7 carpet · TINT: colour index · FLAM: burns (fire spreads to it)
const SHAPE=U8(),TINT=U8(),FLAM=U8();
// SUPPORT: 1 = needs solid block below, 2 = attached via meta dir, 3 = plant soil rule, 4 = upper door half
function def(id,name,top,side,bottom,o={}){
  const B=BLOCKS[id]={id,name,tex:[side,side,top,bottom,side,side],solid:o.solid!==false,hardness:o.hardness??1,tier:o.tier??0,tool:o.tool||null,emit:o.emit||0,drop:o.drop,xp:o.xp||0,
    ftex:{front:o.front??side,back:o.back??side,side,top,bottom},noItem:!!o.noItem};
  SOLID[id]=B.solid?1:0; TRANSPARENT[id]=(o.transparent||o.plant||o.decal||o.shape)?1:0; SHAPE[id]=o.shape||0; TINT[id]=o.tint||0; FLAM[id]=o.flam||0; LIQ[id]=o.liq||0; EMIT[id]=B.emit; TRANSLUCENT[id]=o.translucent?1:0;
  LIGHT_PASS[id]=(TRANSPARENT[id]||!B.solid)&&LIQ[id]!==2?1:0; PLANT[id]=o.plant?1:0; DECAL[id]=o.decal?1:0; DIRTYPE[id]=o.dir==='h'?1:o.dir==='all'?2:0;
  WASHABLE[id]=(o.plant||o.decal||o.wash)?1:0; REPLACE[id]=o.replace?1:0; GROW[id]=o.grow?1:0; RS[id]=o.rs?1:0; TILEBLK[id]=o.tile?1:0; SUPPORT[id]=o.support||0;
}
const plantO=(o)=>({solid:false,plant:true,hardness:0,support:3,...o});
def(AIR,'Air',0,0,0,{solid:false,transparent:true,replace:true});
def(GRASS,'Grass',T.GRASS_TOP,T.GRASS_SIDE,T.DIRT,{hardness:0.6,tool:'shovel',drop:[DIRT,1,1]});
def(DIRT,'Dirt',T.DIRT,T.DIRT,T.DIRT,{hardness:0.5,tool:'shovel'});
def(STONE,'Stone',T.STONE,T.STONE,T.STONE,{hardness:1.5,tier:1,tool:'pick',drop:[COBBLE,1,1]});
def(SAND,'Sand',T.SAND,T.SAND,T.SAND,{hardness:0.5,tool:'shovel'});
def(WATER,'Water',T.WATER,T.WATER,T.WATER,{solid:false,transparent:true,translucent:true,liq:1,replace:true,hardness:Infinity,noItem:true});
def(LOG,'Log',T.LOG_TOP,T.LOG_SIDE,T.LOG_TOP,{hardness:2,tool:'axe'});
def(LEAVES,'Leaves',T.LEAVES,T.LEAVES,T.LEAVES,{hardness:0.2,drop:[0,0,0]});
def(SNOW,'Snow',T.SNOW,T.SNOW_SIDE,T.DIRT,{hardness:0.6,tool:'shovel',drop:[DIRT,1,1]});
def(PLANKS,'Planks',T.PLANKS,T.PLANKS,T.PLANKS,{hardness:2,tool:'axe'});
def(COAL_ORE,'Coal ore',T.COAL,T.COAL,T.COAL,{hardness:3,tier:1,tool:'pick',drop:[257,1,1],xp:1});
def(IRON_ORE,'Iron ore',T.IRON,T.IRON,T.IRON,{hardness:3,tier:2,tool:'pick'});
def(BEDROCK,'Bedrock',T.BEDROCK,T.BEDROCK,T.BEDROCK,{hardness:Infinity});
def(GLASS,'Glass',T.GLASS,T.GLASS,T.GLASS,{transparent:true,hardness:0.3,drop:[0,0,0]});
def(BRICK,'Bricks',T.BRICK,T.BRICK,T.BRICK,{hardness:2,tier:1,tool:'pick'});
def(GRAVEL,'Gravel',T.GRAVEL,T.GRAVEL,T.GRAVEL,{hardness:0.6,tool:'shovel'});
def(COBBLE,'Cobblestone',T.COBBLE,T.COBBLE,T.COBBLE,{hardness:2,tier:1,tool:'pick'});
def(GOLD_ORE,'Gold ore',T.GOLD_ORE,T.GOLD_ORE,T.GOLD_ORE,{hardness:3,tier:3,tool:'pick'});
def(DIAMOND_ORE,'Diamond ore',T.DIAMOND_ORE,T.DIAMOND_ORE,T.DIAMOND_ORE,{hardness:3,tier:3,tool:'pick',drop:[260,1,1],xp:5});
def(LAVA,'Lava',T.LAVA,T.LAVA,T.LAVA,{solid:false,liq:2,emit:15,replace:true,hardness:Infinity,noItem:true});
def(TORCH,'Torch',T.TORCH,T.TORCH,T.TORCH,{solid:false,plant:true,emit:14,hardness:0,support:1});
def(GOLD_BLOCK,'Gold block',T.GOLD_BLOCK,T.GOLD_BLOCK,T.GOLD_BLOCK,{hardness:3,tier:3,tool:'pick'});
def(DIAMOND_BLOCK,'Diamond block',T.DIAMOND_BLOCK,T.DIAMOND_BLOCK,T.DIAMOND_BLOCK,{hardness:5,tier:3,tool:'pick'});
def(CRAFTING_TABLE,'Crafting table',T.TABLE_TOP,T.TABLE_SIDE,T.PLANKS,{hardness:2.5,tool:'axe'});
def(FURNACE,'Furnace',T.FURNACE_TOP,T.FURNACE_SIDE,T.FURNACE_TOP,{hardness:3.5,tier:1,tool:'pick',front:T.FURNACE_FRONT,dir:'h',tile:true});
def(FURNACE_LIT,'Furnace',T.FURNACE_TOP,T.FURNACE_SIDE,T.FURNACE_TOP,{hardness:3.5,tier:1,tool:'pick',front:T.FURNACE_LIT,emit:13,drop:[FURNACE,1,1],dir:'h',tile:true,noItem:true});
def(CHEST,'Chest',T.CHEST_TOP,T.CHEST_SIDE,T.CHEST_TOP,{hardness:2.5,tool:'axe',front:T.CHEST_FRONT,dir:'h',tile:true});
def(WOOL,'Wool',T.WOOL,T.WOOL,T.WOOL,{hardness:0.8});
def(BED,'Bed',T.BED_TOP,T.BED_SIDE,T.PLANKS,{hardness:0.2,support:1});
def(OBSIDIAN,'Obsidian',T.OBSIDIAN,T.OBSIDIAN,T.OBSIDIAN,{hardness:50,tier:4,tool:'pick'});
def(NETHERRACK,'Netherrack',T.NETHERRACK,T.NETHERRACK,T.NETHERRACK,{hardness:0.4,tier:1,tool:'pick'});
def(GLOWSTONE,'Glowstone',T.GLOWSTONE,T.GLOWSTONE,T.GLOWSTONE,{hardness:0.3,emit:15});
def(SOUL_SAND,'Soul sand',T.SOUL_SAND,T.SOUL_SAND,T.SOUL_SAND,{hardness:0.5,tool:'shovel'});
def(QUARTZ_ORE,'Quartz ore',T.QUARTZ_ORE,T.QUARTZ_ORE,T.QUARTZ_ORE,{hardness:3,tier:1,tool:'pick',drop:[302,1,1],xp:2});
def(END_STONE,'End stone',T.END_STONE,T.END_STONE,T.END_STONE,{hardness:3,tier:1,tool:'pick'});
def(PORTAL,'Nether portal',T.PORTAL,T.PORTAL,T.PORTAL,{solid:false,transparent:true,translucent:true,emit:11,hardness:Infinity,noItem:true});
def(END_PORTAL,'End portal',T.END_PORTAL,T.END_PORTAL,T.END_PORTAL,{solid:false,transparent:true,translucent:true,emit:15,hardness:Infinity,noItem:true});
def(END_FRAME,'End portal frame',T.END_FRAME_TOP,T.END_FRAME_SIDE,T.END_STONE,{hardness:Infinity});
def(END_FRAME_EYE,'End portal frame',T.END_FRAME_EYE,T.END_FRAME_SIDE,T.END_STONE,{hardness:Infinity,emit:4,noItem:true});
def(END_CRYSTAL,'End crystal',T.END_CRYSTAL,T.END_CRYSTAL,T.END_CRYSTAL,{hardness:0,transparent:true,emit:10,drop:[0,0,0]});
def(SPAWNER,'Monster spawner',T.SPAWNER,T.SPAWNER,T.SPAWNER,{hardness:5,tier:1,tool:'pick',transparent:true,drop:[0,0,0],xp:20,tile:true});
def(ENCHANT_TABLE,'Enchanting table',T.ENCHANT_TOP,T.ENCHANT_SIDE,T.OBSIDIAN,{hardness:5,tier:1,tool:'pick',emit:7});
def(EMERALD_ORE,'Emerald ore',T.EMERALD_ORE,T.EMERALD_ORE,T.EMERALD_ORE,{hardness:3,tier:3,tool:'pick',drop:[303,1,1],xp:4});
def(STONE_BRICK,'Stone bricks',T.STONE_BRICK,T.STONE_BRICK,T.STONE_BRICK,{hardness:1.5,tier:1,tool:'pick'});
// --- liquids that flow (meta = level 1..7, bit 8 = falling)
def(FLOW_WATER,'Water',T.WATER,T.WATER,T.WATER,{solid:false,transparent:true,translucent:true,liq:1,replace:true,hardness:Infinity,noItem:true});
def(FLOW_LAVA,'Lava',T.LAVA,T.LAVA,T.LAVA,{solid:false,liq:2,emit:15,replace:true,hardness:Infinity,noItem:true});
// --- farming
def(FARMLAND,'Farmland',T.FARMLAND,T.DIRT,T.DIRT,{hardness:0.6,tool:'shovel',drop:[DIRT,1,1],grow:true,noItem:true});
def(FARMLAND_WET,'Farmland',T.FARMLAND_WET,T.DIRT,T.DIRT,{hardness:0.6,tool:'shovel',drop:[DIRT,1,1],grow:true,noItem:true});
def(TALL_GRASS,'Tall grass',T.TALL_GRASS,T.TALL_GRASS,T.TALL_GRASS,plantO({replace:true,noItem:true,drop:[0,0,0]}));
def(FLOWER_RED,'Red flower',T.FLOWER_RED,T.FLOWER_RED,T.FLOWER_RED,plantO());
def(FLOWER_YELLOW,'Yellow flower',T.FLOWER_YELLOW,T.FLOWER_YELLOW,T.FLOWER_YELLOW,plantO());
def(SAPLING,'Sapling',T.SAPLING,T.SAPLING,T.SAPLING,plantO({grow:true}));
for(let s=0;s<4;s++) def(WHEAT0+s,'Wheat',T['WHEAT'+s],T['WHEAT'+s],T['WHEAT'+s],plantO({grow:s<3,noItem:true,drop:[304,1,1]}));
def(SUGAR_CANE,'Sugar cane',T.CANE,T.CANE,T.CANE,plantO({grow:true,noItem:true,drop:[313,1,1]}));
for(let s=0;s<3;s++) def(WART0+s,'Nether wart',T['WART'+s],T['WART'+s],T['WART'+s],plantO({grow:s<2,noItem:true,drop:s<2?[315,1,1]:[315,2,4]}));
def(NETHER_BRICK,'Nether bricks',T.NETHER_BRICK,T.NETHER_BRICK,T.NETHER_BRICK,{hardness:2,tier:1,tool:'pick'});
def(BREWING_STAND,'Brewing stand',T.BREWING,T.BREWING,T.BREWING,{solid:false,plant:true,hardness:0.5,emit:1,support:1,tile:true});
// --- redstone
def(REDSTONE_ORE,'Redstone ore',T.REDSTONE_ORE,T.REDSTONE_ORE,T.REDSTONE_ORE,{hardness:3,tier:3,tool:'pick',drop:[325,4,5],xp:3});
def(WIRE_OFF,'Redstone wire',T.WIRE_OFF,T.WIRE_OFF,T.WIRE_OFF,{solid:false,decal:true,hardness:0,support:1,rs:true,drop:[325,1,1],noItem:true});
def(WIRE_ON,'Redstone wire',T.WIRE_ON,T.WIRE_ON,T.WIRE_ON,{solid:false,decal:true,hardness:0,support:1,rs:true,drop:[325,1,1],noItem:true});
def(RTORCH_ON,'Redstone torch',T.RTORCH_ON,T.RTORCH_ON,T.RTORCH_ON,{solid:false,plant:true,hardness:0,emit:7,support:1,rs:true});
def(RTORCH_OFF,'Redstone torch',T.RTORCH_OFF,T.RTORCH_OFF,T.RTORCH_OFF,{solid:false,plant:true,hardness:0,support:1,rs:true,drop:[RTORCH_ON,1,1],noItem:true});
def(LEVER_OFF,'Lever',T.LEVER_OFF,T.LEVER_OFF,T.LEVER_OFF,{solid:false,decal:true,hardness:0.3,support:2,rs:true});
def(LEVER_ON,'Lever',T.LEVER_ON,T.LEVER_ON,T.LEVER_ON,{solid:false,decal:true,hardness:0.3,support:2,rs:true,drop:[LEVER_OFF,1,1],noItem:true});
def(BUTTON,'Button',T.BUTTON,T.BUTTON,T.BUTTON,{solid:false,decal:true,hardness:0.3,support:2,rs:true});
def(BUTTON_ON,'Button',T.BUTTON,T.BUTTON,T.BUTTON,{solid:false,decal:true,hardness:0.3,support:2,rs:true,drop:[BUTTON,1,1],noItem:true});
def(PLATE,'Pressure plate',T.PLATE,T.PLATE,T.PLATE,{solid:false,decal:true,hardness:0.3,support:1,rs:true});
def(PLATE_ON,'Pressure plate',T.PLATE,T.PLATE,T.PLATE,{solid:false,decal:true,hardness:0.3,support:1,rs:true,drop:[PLATE,1,1],noItem:true});
def(LAMP_OFF,'Redstone lamp',T.LAMP_OFF,T.LAMP_OFF,T.LAMP_OFF,{hardness:0.3,rs:true});
def(LAMP_ON,'Redstone lamp',T.LAMP_ON,T.LAMP_ON,T.LAMP_ON,{hardness:0.3,emit:15,rs:true,drop:[LAMP_OFF,1,1],noItem:true});
def(TNT,'TNT',T.TNT_TOP,T.TNT_SIDE,T.TNT_BOTTOM,{hardness:0,rs:true});
def(PISTON,'Piston',T.PISTON_SIDE,T.PISTON_SIDE,T.PISTON_SIDE,{hardness:0.5,dir:'all',front:T.PISTON_FRONT,back:T.PISTON_BACK,rs:true});
def(PISTON_EXT,'Piston',T.PISTON_SIDE,T.PISTON_SIDE,T.PISTON_SIDE,{hardness:0.5,dir:'all',front:T.PISTON_OPEN,back:T.PISTON_BACK,rs:true,drop:[PISTON,1,1],noItem:true});
def(PISTON_HEAD,'Piston head',T.PISTON_SIDE,T.PISTON_SIDE,T.PISTON_SIDE,{hardness:0.5,dir:'all',front:T.PISTON_HEAD,back:T.PISTON_OPEN,drop:[PISTON,1,1],noItem:true});
def(STICKY,'Sticky piston',T.PISTON_SIDE,T.PISTON_SIDE,T.PISTON_SIDE,{hardness:0.5,dir:'all',front:T.STICKY_FRONT,back:T.PISTON_BACK,rs:true});
def(STICKY_EXT,'Sticky piston',T.PISTON_SIDE,T.PISTON_SIDE,T.PISTON_SIDE,{hardness:0.5,dir:'all',front:T.PISTON_OPEN,back:T.PISTON_BACK,rs:true,drop:[STICKY,1,1],noItem:true});
def(STICKY_HEAD,'Piston head',T.PISTON_SIDE,T.PISTON_SIDE,T.PISTON_SIDE,{hardness:0.5,dir:'all',front:T.STICKY_HEAD,back:T.PISTON_OPEN,drop:[STICKY,1,1],noItem:true});
def(REPEATER_OFF,'Repeater',T.REPEATER_OFF,T.REPEATER_OFF,T.REPEATER_OFF,{solid:false,decal:true,hardness:0,support:1,rs:true,drop:[331,1,1],noItem:true});
def(REPEATER_ON,'Repeater',T.REPEATER_ON,T.REPEATER_ON,T.REPEATER_ON,{solid:false,decal:true,hardness:0,support:1,rs:true,emit:4,drop:[331,1,1],noItem:true});
def(REDSTONE_BLOCK,'Block of redstone',T.REDSTONE_BLOCK,T.REDSTONE_BLOCK,T.REDSTONE_BLOCK,{hardness:3,tier:1,tool:'pick',rs:true});
def(DOOR_B,'Door',T.DOOR_BOT,T.DOOR_BOT,T.PLANKS,{hardness:2,tool:'axe',support:1,rs:true,drop:[329,1,1],noItem:true});
def(DOOR_T,'Door',T.PLANKS,T.DOOR_TOP,T.DOOR_TOP,{hardness:2,tool:'axe',support:4,rs:true,drop:[329,1,1],noItem:true});
def(DOOR_B_O,'Door',T.DOOR_BOT,T.DOOR_BOT,T.DOOR_BOT,{solid:false,decal:true,hardness:2,tool:'axe',support:1,rs:true,drop:[329,1,1],noItem:true});
def(DOOR_T_O,'Door',T.DOOR_TOP,T.DOOR_TOP,T.DOOR_TOP,{solid:false,decal:true,hardness:2,tool:'axe',support:4,rs:true,drop:[329,1,1],noItem:true});
WASHABLE[DOOR_B_O]=WASHABLE[DOOR_T_O]=0;
// --- building shapes ---
const pk={hardness:2,tool:'axe',flam:1}, rk={hardness:2,tier:1,tool:'pick'}, sdT=()=>[T.SANDSTONE_TOP,T.SANDSTONE_SIDE,T.SANDSTONE_TOP];
def(SLAB_OAK,'Oak slab',T.PLANKS,T.PLANKS,T.PLANKS,{shape:1,...pk}); def(SLAB_COBBLE,'Cobblestone slab',T.COBBLE,T.COBBLE,T.COBBLE,{shape:1,...rk});
def(SLAB_STONE,'Stone slab',T.STONE,T.STONE,T.STONE,{shape:1,...rk}); def(SLAB_BRICK,'Stone brick slab',T.STONE_BRICK,T.STONE_BRICK,T.STONE_BRICK,{shape:1,...rk});
def(SLAB_SAND,'Sandstone slab',...sdT(),{shape:1,...rk,hardness:0.8});
def(STAIRS_OAK,'Oak stairs',T.PLANKS,T.PLANKS,T.PLANKS,{shape:2,...pk}); def(STAIRS_COBBLE,'Cobblestone stairs',T.COBBLE,T.COBBLE,T.COBBLE,{shape:2,...rk});
def(STAIRS_BRICK,'Stone brick stairs',T.STONE_BRICK,T.STONE_BRICK,T.STONE_BRICK,{shape:2,...rk}); def(STAIRS_SAND,'Sandstone stairs',...sdT(),{shape:2,...rk,hardness:0.8});
def(STAIRS_RED,'Brick stairs',T.BRICK,T.BRICK,T.BRICK,{shape:2,...rk});
def(FENCE,'Fence',T.PLANKS,T.PLANKS,T.PLANKS,{shape:3,...pk}); def(FENCE_GATE,'Fence gate',T.PLANKS,T.PLANKS,T.PLANKS,{shape:5,...pk});
def(GLASS_PANE,'Glass pane',T.GLASS,T.GLASS,T.GLASS,{shape:4,hardness:0.3,drop:[0,0,0]});
def(LADDER,'Ladder',T.LADDER,T.LADDER,T.LADDER,{solid:false,decal:true,hardness:0.4,tool:'axe',support:2,flam:1}); WASHABLE[LADDER]=0;
def(CACTUS,'Cactus',T.CACTUS_TOP,T.CACTUS_SIDE,T.CACTUS_TOP,{shape:6,hardness:0.4,support:3,grow:true});
def(SANDSTONE,'Sandstone',...sdT(),{hardness:0.8,tier:1,tool:'pick'});
def(CLAY,'Clay',T.CLAY,T.CLAY,T.CLAY,{hardness:0.6,tool:'shovel',drop:[CLAY_BALL,4,4]});
def(MOSSY_COBBLE,'Mossy cobblestone',T.MOSSY_COBBLE,T.MOSSY_COBBLE,T.MOSSY_COBBLE,{hardness:2,tier:1,tool:'pick'});
def(LAPIS_ORE,'Lapis ore',T.LAPIS_ORE,T.LAPIS_ORE,T.LAPIS_ORE,{hardness:3,tier:2,tool:'pick',drop:[LAPIS,4,8],xp:3});
def(LAPIS_BLOCK,'Lapis block',T.LAPIS_BLOCK,T.LAPIS_BLOCK,T.LAPIS_BLOCK,{hardness:3,tier:1,tool:'pick'});
def(PUMPKIN,'Pumpkin',T.PUMPKIN_TOP,T.PUMPKIN_SIDE,T.PUMPKIN_TOP,{hardness:1,tool:'axe'});
def(JACK_O_LANTERN,'Jack o\'lantern',T.PUMPKIN_TOP,T.PUMPKIN_SIDE,T.PUMPKIN_TOP,{hardness:1,tool:'axe',dir:'h',front:T.JACK_FACE,emit:15});
def(MELON,'Melon',T.MELON_TOP,T.MELON_SIDE,T.MELON_TOP,{hardness:1,tool:'axe',drop:[MELON_SLICE,3,7]});
def(HAY,'Hay bale',T.HAY_TOP,T.HAY_SIDE,T.HAY_TOP,{hardness:0.5,flam:1});
def(BOOKSHELF,'Bookshelf',T.PLANKS,T.BOOKSHELF,T.PLANKS,{hardness:1.5,tool:'axe',drop:[BOOK,3,3],flam:1});
def(ICE,'Ice',T.ICE,T.ICE,T.ICE,{transparent:true,translucent:true,hardness:0.5,tool:'pick',drop:[0,0,0]});
def(DEAD_BUSH,'Dead bush',T.DEAD_BUSH,T.DEAD_BUSH,T.DEAD_BUSH,plantO({drop:[256,0,2],flam:1}));
def(CARROTS0,'Carrots',T.CARROT0,T.CARROT0,T.CARROT0,plantO({grow:true,noItem:true,drop:[CARROT,1,1]})); def(CARROTS1,'Carrots',T.CARROT1,T.CARROT1,T.CARROT1,plantO({noItem:true,drop:[CARROT,2,4]}));
def(POTATOES0,'Potatoes',T.POTATO0,T.POTATO0,T.POTATO0,plantO({grow:true,noItem:true,drop:[POTATO,1,1]})); def(POTATOES1,'Potatoes',T.POTATO1,T.POTATO1,T.POTATO1,plantO({noItem:true,drop:[POTATO,2,4]}));
def(PUMPKIN_STEM,'Pumpkin stem',T.STEM,T.STEM,T.STEM,plantO({grow:true,noItem:true,drop:[PUMPKIN_SEEDS,1,1]})); def(MELON_STEM,'Melon stem',T.STEM,T.STEM,T.STEM,plantO({grow:true,noItem:true,drop:[MELON_SEEDS,1,1]}));
def(FIRE,'Fire',T.FIRE,T.FIRE,T.FIRE,{solid:false,plant:true,hardness:0,emit:15,noItem:true,drop:[0,0,0],replace:true,grow:true});
def(IRON_BLOCK,'Iron block',T.IRON_BLOCK,T.IRON_BLOCK,T.IRON_BLOCK,{hardness:5,tier:2,tool:'pick'}); def(EMERALD_BLOCK,'Emerald block',T.EMERALD_BLOCK,T.EMERALD_BLOCK,T.EMERALD_BLOCK,{hardness:5,tier:3,tool:'pick'});
def(COAL_BLOCK,'Coal block',T.COAL_BLOCK,T.COAL_BLOCK,T.COAL_BLOCK,{hardness:5,tier:1,tool:'pick',flam:1}); def(SNOW_BLOCK,'Snow block',T.SNOW,T.SNOW,T.SNOW,{hardness:0.2,tool:'shovel',drop:[SNOWBALL,4,4]});
def(PACKED_ICE,'Packed ice',T.PACKED_ICE,T.PACKED_ICE,T.PACKED_ICE,{hardness:0.5,tool:'pick',drop:[0,0,0]});
def(SPRUCE_LOG,'Spruce log',T.SPRUCE_TOP,T.SPRUCE_LOG,T.SPRUCE_TOP,{hardness:2,tool:'axe',flam:1}); def(SPRUCE_LEAVES,'Spruce leaves',T.SPRUCE_LEAVES,T.SPRUCE_LEAVES,T.SPRUCE_LEAVES,{hardness:0.2,drop:[0,0,0],flam:1});
def(JUNGLE_LOG,'Jungle log',T.LOG_TOP,T.JUNGLE_LOG,T.LOG_TOP,{hardness:2,tool:'axe',flam:1}); def(JUNGLE_LEAVES,'Jungle leaves',T.JUNGLE_LEAVES,T.JUNGLE_LEAVES,T.JUNGLE_LEAVES,{hardness:0.2,drop:[0,0,0],flam:1});
def(VINE,'Vines',T.VINE,T.VINE,T.VINE,{solid:false,decal:true,hardness:0.2,support:2,flam:1,drop:[0,0,0],replace:true}); WASHABLE[VINE]=0;
def(LILY,'Lily pad',T.LILY,T.LILY,T.LILY,{solid:false,decal:true,hardness:0,drop:[0,0,0]}); WASHABLE[LILY]=0;
for(let c=1;c<16;c++)def(WOOL_C+c-1,COLOR_NAMES[c]+' wool',T.WOOL,T.WOOL,T.WOOL,{hardness:0.8,tint:c,flam:1});
for(let c=0;c<16;c++)def(CARPET+c,COLOR_NAMES[c]+' carpet',T.WOOL,T.WOOL,T.WOOL,{shape:7,tint:c,hardness:0.1,support:1,flam:1});
[WOOL,LOG,PLANKS,LEAVES,BED,TNT,CHEST,CRAFTING_TABLE,DOOR_B,DOOR_T,DOOR_B_O,DOOR_T_O,TALL_GRASS,SAPLING].forEach(b=>FLAM[b]=1);
// copper: ore, four oxidation stages (they slowly turn green; scrape with an axe), lightning rod
def(COPPER_ORE,'Copper ore',T.COPPER_ORE,T.COPPER_ORE,T.COPPER_ORE,{hardness:3,tier:2,tool:'pick',drop:[RAW_COPPER,2,5]});
['Copper block','Exposed copper','Weathered copper','Oxidized copper'].forEach((n,i)=>def(COPPER_BLOCK+i,n,T['COPPER'+i],T['COPPER'+i],T['COPPER'+i],{hardness:3,tier:2,tool:'pick',grow:i<3}));
def(COPPER_TORCH,'Copper torch',T.COPPER_TORCH,T.COPPER_TORCH,T.COPPER_TORCH,{solid:false,plant:true,emit:14,hardness:0,support:1});
def(COPPER_BARS,'Copper bars',T.COPPER_BARS,T.COPPER_BARS,T.COPPER_BARS,{shape:4,hardness:3,tier:1,tool:'pick'});
def(LIGHTNING_ROD,'Lightning rod',T.LIGHTNING_ROD,T.LIGHTNING_ROD,T.LIGHTNING_ROD,{shape:8,hardness:3,tier:2,tool:'pick'});
const SLAB_FULL={[SLAB_OAK]:PLANKS,[SLAB_COBBLE]:COBBLE,[SLAB_STONE]:STONE,[SLAB_BRICK]:STONE_BRICK,[SLAB_SAND]:SANDSTONE};
const woolOf=c=>c===0?WOOL:WOOL_C+c-1, colorOfWool=b=>b===WOOL?0:b>=WOOL_C&&b<WOOL_C+15?b-WOOL_C+1:-1;
const PISTON_BODY=new Set([PISTON,PISTON_EXT,STICKY,STICKY_EXT]), PISTON_HEADS=new Set([PISTON_HEAD,STICKY_HEAD]);
const RS_WIRE=new Set([WIRE_OFF,WIRE_ON]);
const isDoor=b=>b>=DOOR_B&&b<=DOOR_T_O;

// ---------------------------------------------------------------------
// ITEM REGISTRY  (ids < 256 are blocks)
// ---------------------------------------------------------------------
const STICK=256,COAL=257,IRON_INGOT=258,GOLD_INGOT=259,DIAMOND=260,PICK_W=261,PICK_S=262,PICK_I=263,PICK_D=264,SWORD_W=265,SWORD_S=266,SWORD_I=267,SWORD_D=268,
      HELM_I=269,CHEST_I=270,LEGS_I=271,BOOTS_I=272,HELM_D=273,CHEST_D=274,LEGS_D=275,BOOTS_D=276,PORK=277,PORK_C=278,BEEF=279,BEEF_C=280,APPLE=281,
      MUTTON=282,MUTTON_C=283,ARROW=284,BOW=285,SHEARS=286,ROTTEN=287,AXE_W=288,AXE_S=289,AXE_I=290,AXE_D=291,SHOVEL_W=292,SHOVEL_S=293,SHOVEL_I=294,SHOVEL_D=295,
      FLINT=296,FLINT_STEEL=297,ENDER_PEARL=298,BLAZE_ROD=299,BLAZE_POWDER=300,ENDER_EYE=301,QUARTZ=302,EMERALD=303,
      SEEDS=304,WHEAT=305,BREAD=306,HOE_W=307,HOE_S=308,HOE_I=309,HOE_D=310,BONE=311,BONE_MEAL=312,CANE=313,SUGAR=314,WART=315,BOTTLE=316,WATER_BOTTLE=317,AWKWARD=318,
      POT_HEAL=319,POT_REGEN=320,POT_STRENGTH=321,POT_SPEED=322,POT_FIRE=323,POT_NIGHT=324,REDSTONE=325,BUCKET=326,WATER_BUCKET=327,LAVA_BUCKET=328,DOOR=329,GUNPOWDER=330,REPEATER=331;
const ITEMS={};
for(let id=1;id<BLOCKS.length;id++) if(BLOCKS[id]&&!BLOCKS[id].noItem) ITEMS[id]={name:BLOCKS[id].name,icon:BLOCKS[id].tex[2],stack:64,block:true,places:id};
for(let id=1;id<BLOCKS.length;id++) if(BLOCKS[id]&&!ITEMS[id]) ITEMS[id]={name:BLOCKS[id].name,icon:BLOCKS[id].tex[2],stack:64};   // never in inventory, but keeps lookups safe
ITEMS[TORCH].icon=T.TORCH; ITEMS[CHEST].icon=T.CHEST_FRONT; ITEMS[FURNACE].icon=T.FURNACE_FRONT; ITEMS[CRAFTING_TABLE].icon=T.TABLE_SIDE; ITEMS[ENCHANT_TABLE].icon=T.ENCHANT_SIDE;
ITEMS[TNT].icon=T.TNT_SIDE; ITEMS[PISTON].icon=T.PISTON_FRONT; ITEMS[STICKY].icon=T.STICKY_FRONT;
const item=(id,name,icon,o={})=>{ITEMS[id]={name,icon,stack:o.stack??64,...o};};
item(STICK,'Stick',T.I_STICK); item(COAL,'Coal',T.I_COAL); item(IRON_INGOT,'Iron ingot',T.I_IRON); item(GOLD_INGOT,'Gold ingot',T.I_GOLD); item(DIAMOND,'Diamond',T.I_DIAMOND);
const TIERS=[['W','Wooden',1,2,59],['S','Stone',2,4,131],['I','Iron',3,6,250],['D','Diamond',4,8,1561]];
TIERS.forEach(([k,nm,tier,speed,dur],i)=>{
  item(PICK_W+i,nm+' pickaxe',T['I_PICK_'+k],{stack:1,tool:'pick',tier,speed,maxDur:dur,dmg:2});
  item(AXE_W+i,nm+' axe',T['I_AXE_'+k],{stack:1,tool:'axe',tier,speed,maxDur:dur,dmg:3});
  item(SHOVEL_W+i,nm+' shovel',T['I_SHOVEL_'+k],{stack:1,tool:'shovel',tier,speed,maxDur:dur,dmg:1});
  item(SWORD_W+i,nm+' sword',T['I_SWORD_'+k],{stack:1,tool:'sword',tier,speed:1.5,maxDur:dur,dmg:4+i});
  item(HOE_W+i,nm+' hoe',T['I_HOE_'+k],{stack:1,tool:'hoe',tier,speed:1,maxDur:dur,dmg:1});
});
item(HELM_I,'Iron helmet',T.I_HELM_I,{stack:1,armor:{slot:0,pts:2}}); item(CHEST_I,'Iron chestplate',T.I_CHEST_I,{stack:1,armor:{slot:1,pts:6}});
item(LEGS_I,'Iron leggings',T.I_LEGS_I,{stack:1,armor:{slot:2,pts:5}}); item(BOOTS_I,'Iron boots',T.I_BOOTS_I,{stack:1,armor:{slot:3,pts:2}});
item(HELM_D,'Diamond helmet',T.I_HELM_D,{stack:1,armor:{slot:0,pts:3}}); item(CHEST_D,'Diamond chestplate',T.I_CHEST_D,{stack:1,armor:{slot:1,pts:8}});
item(LEGS_D,'Diamond leggings',T.I_LEGS_D,{stack:1,armor:{slot:2,pts:6}}); item(BOOTS_D,'Diamond boots',T.I_BOOTS_D,{stack:1,armor:{slot:3,pts:3}});
item(PORK,'Raw porkchop',T.I_PORK,{food:3}); item(PORK_C,'Cooked porkchop',T.I_PORK_C,{food:8}); item(BEEF,'Raw beef',T.I_BEEF,{food:3}); item(BEEF_C,'Steak',T.I_BEEF_C,{food:8});
item(MUTTON,'Raw mutton',T.I_MUTTON,{food:2}); item(MUTTON_C,'Cooked mutton',T.I_MUTTON_C,{food:6}); item(APPLE,'Apple',T.I_APPLE,{food:4}); item(ROTTEN,'Rotten flesh',T.I_ROTTEN,{food:4});
item(ARROW,'Arrow',T.I_ARROW); item(BOW,'Bow',T.I_BOW,{stack:1,maxDur:384,bow:true}); item(SHEARS,'Shears',T.I_SHEARS,{stack:1,maxDur:238,shears:true});
item(FLINT,'Flint',T.I_FLINT); item(FLINT_STEEL,'Flint and steel',T.I_FLINT_STEEL,{stack:1,maxDur:64,igniter:true}); item(ENDER_PEARL,'Ender pearl',T.I_PEARL,{stack:16});
item(BLAZE_ROD,'Blaze rod',T.I_ROD); item(BLAZE_POWDER,'Blaze powder',T.I_POWDER); item(ENDER_EYE,'Eye of ender',T.I_EYE,{eye:true}); item(QUARTZ,'Nether quartz',T.I_QUARTZ); item(EMERALD,'Emerald',T.I_EMERALD);
item(SEEDS,'Seeds',T.I_SEEDS,{places:WHEAT0}); item(WHEAT,'Wheat',T.I_WHEAT); item(BREAD,'Bread',T.I_BREAD,{food:5}); item(BONE,'Bone',T.I_BONE); item(BONE_MEAL,'Bone meal',T.I_BONE_MEAL,{bonemeal:true});
item(CANE,'Sugar cane',T.CANE,{places:SUGAR_CANE}); item(SUGAR,'Sugar',T.I_SUGAR); item(WART,'Nether wart',T.I_WART,{places:WART0});
item(BOTTLE,'Glass bottle',T.I_BOTTLE,{bottle:true}); item(WATER_BOTTLE,'Water bottle',T.I_WATER_BOTTLE,{stack:1,drink:'water'}); item(AWKWARD,'Awkward potion',T.I_AWKWARD,{stack:1,drink:'water'});
item(POT_HEAL,'Potion of Healing',T.I_POT_HEAL,{stack:1,drink:'heal'}); item(POT_REGEN,'Potion of Regeneration',T.I_POT_REGEN,{stack:1,drink:'regen'});
item(POT_STRENGTH,'Potion of Strength',T.I_POT_STRENGTH,{stack:1,drink:'strength'}); item(POT_SPEED,'Potion of Swiftness',T.I_POT_SPEED,{stack:1,drink:'speed'});
item(POT_FIRE,'Potion of Fire Resistance',T.I_POT_FIRE,{stack:1,drink:'fire'}); item(POT_NIGHT,'Potion of Night Vision',T.I_POT_NIGHT,{stack:1,drink:'night'});
item(REDSTONE,'Redstone dust',T.I_REDSTONE,{places:WIRE_OFF}); item(BUCKET,'Bucket',T.I_BUCKET,{stack:16,bucket:0}); item(WATER_BUCKET,'Water bucket',T.I_WATER_BUCKET,{stack:1,bucket:WATER});
item(LAVA_BUCKET,'Lava bucket',T.I_LAVA_BUCKET,{stack:1,bucket:LAVA}); item(DOOR,'Door',T.I_DOOR,{places:DOOR_B}); item(GUNPOWDER,'Gunpowder',T.I_GUNPOWDER); item(REPEATER,'Repeater',T.I_REPEATER,{places:REPEATER_OFF});
// --- new items ---
for(const [b,ic] of [[FENCE,T.I_FENCE],[FENCE_GATE,T.I_GATE],[GLASS_PANE,T.I_PANE],[CACTUS,T.CACTUS_SIDE],[JACK_O_LANTERN,T.JACK_FACE],[PUMPKIN,T.PUMPKIN_SIDE],[MELON,T.MELON_SIDE],[HAY,T.HAY_SIDE],
  [BOOKSHELF,T.BOOKSHELF],[SANDSTONE,T.SANDSTONE_SIDE],[SPRUCE_LOG,T.SPRUCE_LOG],[JUNGLE_LOG,T.JUNGLE_LOG]])ITEMS[b].icon=ic;
item(LAPIS,'Lapis lazuli',T.I_LAPIS); for(let c=1;c<16;c++)item(DYE+c-1,c===15?'Ink sac':COLOR_NAMES[c]+' dye',T.I_DYE,{tint:c});
item(CARROT,'Carrot',T.I_CARROT,{food:3,places:CARROTS0}); item(POTATO,'Potato',T.I_POTATO,{food:1,places:POTATOES0}); item(BAKED_POTATO,'Baked potato',T.I_BAKED_POTATO,{food:5});
item(PUMPKIN_SEEDS,'Pumpkin seeds',T.I_PUMPKIN_SEEDS,{places:PUMPKIN_STEM}); item(MELON_SLICE,'Melon slice',T.I_MELON_SLICE,{food:2}); item(MELON_SEEDS,'Melon seeds',T.I_MELON_SEEDS,{places:MELON_STEM});
item(PUMPKIN_PIE,'Pumpkin pie',T.I_PIE,{food:8}); item(EGG,'Egg',T.I_EGG,{stack:16,throw:'egg'}); item(FEATHER,'Feather',T.I_FEATHER);
item(CHICKEN,'Raw chicken',T.I_CHICKEN,{food:2}); item(CHICKEN_C,'Cooked chicken',T.I_CHICKEN_C,{food:6}); item(STRING,'String',T.I_STRING); item(SPIDER_EYE,'Spider eye',T.I_SPIDER_EYE,{food:2});
item(SLIMEBALL,'Slimeball',T.I_SLIMEBALL); item(LEATHER,'Leather',T.I_LEATHER); item(FISHING_ROD,'Fishing rod',T.I_FISHING_ROD,{stack:1,maxDur:64,rod:true});
item(FISH,'Raw fish',T.I_FISH,{food:2}); item(FISH_C,'Cooked fish',T.I_FISH_C,{food:5}); item(COMPASS,'Compass',T.I_COMPASS,{stack:1,compass:true}); item(CLOCK,'Clock',T.I_CLOCK,{stack:1,clock:true});
item(SHIELD,'Shield',T.I_SHIELD,{stack:1,maxDur:336,shield:true});
item(HELM_L,'Leather cap',T.I_HELM_L,{stack:1,armor:{slot:0,pts:1}}); item(CHEST_L,'Leather tunic',T.I_CHEST_L,{stack:1,armor:{slot:1,pts:3}}); item(LEGS_L,'Leather pants',T.I_LEGS_L,{stack:1,armor:{slot:2,pts:2}}); item(BOOTS_L,'Leather boots',T.I_BOOTS_L,{stack:1,armor:{slot:3,pts:1}});
item(HELM_G,'Golden helmet',T.I_HELM_G,{stack:1,armor:{slot:0,pts:2}}); item(CHEST_G,'Golden chestplate',T.I_CHEST_G,{stack:1,armor:{slot:1,pts:5}}); item(LEGS_G,'Golden leggings',T.I_LEGS_G,{stack:1,armor:{slot:2,pts:3}}); item(BOOTS_G,'Golden boots',T.I_BOOTS_G,{stack:1,armor:{slot:3,pts:1}});
item(BOOK,'Book',T.I_BOOK); item(PAPER,'Paper',T.I_PAPER); item(CLAY_BALL,'Clay ball',T.I_CLAY_BALL); item(BRICK_ITEM,'Brick',T.I_BRICK); item(SNOWBALL,'Snowball',T.I_SNOWBALL,{stack:16,throw:'snow'});
item(BOAT,'Boat',T.I_BOAT,{stack:1,boat:true}); item(RAW_COPPER,'Raw copper',T.I_RAW_COPPER); ITEMS[COPPER_TORCH].icon=T.COPPER_TORCH;
// copper tools sit between stone and iron (they can mine iron), copper armour between leather and iron
item(PICK_C,'Copper pickaxe',T.I_PICK_C,{stack:1,tool:'pick',tier:2,speed:5,maxDur:190,dmg:2}); item(AXE_C,'Copper axe',T.I_AXE_C,{stack:1,tool:'axe',tier:2,speed:5,maxDur:190,dmg:3});
item(SHOVEL_C,'Copper shovel',T.I_SHOVEL_C,{stack:1,tool:'shovel',tier:2,speed:5,maxDur:190,dmg:1}); item(SWORD_C,'Copper sword',T.I_SWORD_C,{stack:1,tool:'sword',tier:2,speed:1.5,maxDur:190,dmg:5});
item(HOE_C,'Copper hoe',T.I_HOE_C,{stack:1,tool:'hoe',tier:2,speed:1,maxDur:190,dmg:1});
item(HELM_C,'Copper helmet',T.I_HELM_C,{stack:1,armor:{slot:0,pts:2}}); item(CHEST_C,'Copper chestplate',T.I_CHEST_C,{stack:1,armor:{slot:1,pts:4}}); item(LEGS_C,'Copper leggings',T.I_LEGS_C,{stack:1,armor:{slot:2,pts:3}}); item(BOOTS_C,'Copper boots',T.I_BOOTS_C,{stack:1,armor:{slot:3,pts:1}});
// the mace: the further you fall before hitting, the harder it smashes
item(MACE,'Mace',T.I_MACE,{stack:1,tool:'mace',tier:0,speed:1,maxDur:500,dmg:6}); item(HEAVY_CORE,'Heavy core',T.I_HEAVY_CORE,{stack:1}); item(GUST_ROD,'Gust rod',T.I_GUST_ROD);
item(WIND_CHARGE,'Wind charge',T.I_WIND_CHARGE,{stack:64,throw:'wind'}); item(COPPER_INGOT,'Copper ingot',T.I_COPPER_INGOT); ITEMS[LIGHTNING_ROD].icon=T.I_LIGHTNING_ROD;
const EFFECTS={heal:{name:'Healing'},regen:{name:'Regeneration',time:45,col:'#f7a'},strength:{name:'Strength',time:180,col:'#f84'},speed:{name:'Swiftness',time:180,col:'#8cf'},fire:{name:'Fire Resistance',time:180,col:'#fa4'},night:{name:'Night Vision',time:180,col:'#99f'}};

// RECIPES — shaped patterns (any position, mirrored allowed) + shapeless
const SHAPED=[], SHAPELESS=[];
const sh=(pat,key,out,n=1)=>SHAPED.push({pat,key,out:[out,n]});
sh(['#','#'],{'#':PLANKS},STICK,4); sh(['c','|'],{c:COAL,'|':STICK},TORCH,4); sh(['##','##'],{'#':PLANKS},CRAFTING_TABLE);
sh(['###','# #','###'],{'#':COBBLE},FURNACE); sh(['###','# #','###'],{'#':PLANKS},CHEST); sh([' #','# '],{'#':IRON_INGOT},SHEARS);
sh(['www','ppp'],{w:WOOL,p:PLANKS},BED); sh(['###','###','###'],{'#':GOLD_INGOT},GOLD_BLOCK); sh(['###','###','###'],{'#':DIAMOND},DIAMOND_BLOCK);
sh(['cs','sc'],{c:COBBLE,s:SAND},BRICK,2); sh(['##','##'],{'#':STONE},STONE_BRICK,4); sh([' q ','dod','ooo'],{q:QUARTZ,d:DIAMOND,o:OBSIDIAN},ENCHANT_TABLE);
sh(['gg','gg'],{g:GLOWSTONE},GLOWSTONE,4); sh(['www'],{w:WHEAT},BREAD); sh(['# #',' # '],{'#':GLASS},BOTTLE,3); sh(['# #',' # '],{'#':IRON_INGOT},BUCKET);
sh([' r ','ccc'],{r:BLAZE_ROD,c:COBBLE},BREWING_STAND); sh(['r','|'],{r:REDSTONE,'|':STICK},RTORCH_ON); sh(['|','c'],{'|':STICK,c:COBBLE},LEVER_OFF);
sh(['##'],{'#':STONE},PLATE); sh([' r ','rgr',' r '],{r:REDSTONE,g:GLOWSTONE},LAMP_OFF); sh(['sgs','gsg','sgs'],{s:SAND,g:GUNPOWDER},TNT);
sh(['ppp','cic','crc'],{p:PLANKS,c:COBBLE,i:IRON_INGOT,r:REDSTONE},PISTON); sh(['f','p'],{f:ROTTEN,p:PISTON},STICKY);
sh(['trt','sss'],{t:RTORCH_ON,r:REDSTONE,s:STONE},REPEATER); sh(['###','###','###'],{'#':REDSTONE},REDSTONE_BLOCK); sh(['##','##','##'],{'#':PLANKS},DOOR,3);
// building blocks, decoration, colours, food, gear
for(const [m,sl,st] of [[PLANKS,SLAB_OAK,STAIRS_OAK],[COBBLE,SLAB_COBBLE,STAIRS_COBBLE],[STONE,SLAB_STONE,0],[STONE_BRICK,SLAB_BRICK,STAIRS_BRICK],[SANDSTONE,SLAB_SAND,STAIRS_SAND],[BRICK,0,STAIRS_RED]]){
  if(sl)sh(['###'],{'#':m},sl,6); if(st)sh(['#  ','## ','###'],{'#':m},st,4); }
sh(['#|#','#|#'],{'#':PLANKS,'|':STICK},FENCE,3); sh(['|#|','|#|'],{'#':PLANKS,'|':STICK},FENCE_GATE); sh(['###','###'],{'#':GLASS},GLASS_PANE,16); sh(['| |','|||','| |'],{'|':STICK},LADDER,3);
sh(['##','##'],{'#':SAND},SANDSTONE); sh(['##','##'],{'#':BRICK_ITEM},BRICK); sh(['##','##'],{'#':CLAY_BALL},CLAY); sh(['##','##'],{'#':STRING},WOOL); sh(['##','##'],{'#':SNOWBALL},SNOW_BLOCK);
for(const [it,bl] of [[COPPER_INGOT,COPPER_BLOCK],[LAPIS,LAPIS_BLOCK],[IRON_INGOT,IRON_BLOCK],[EMERALD,EMERALD_BLOCK],[COAL,COAL_BLOCK],[WHEAT,HAY],[MELON_SLICE,MELON]]){ sh(['###','###','###'],{'#':it},bl); if(bl!==MELON)SHAPELESS.push({in:[bl],out:[it,9]}); }
sh(['###','bbb','###'],{'#':PLANKS,b:BOOK},BOOKSHELF); sh(['#','#','#'],{'#':COPPER_INGOT},LIGHTNING_ROD); sh(['h','r'],{h:HEAVY_CORE,r:GUST_ROD},MACE); sh(['c','k','|'],{c:COPPER_INGOT,k:COAL,'|':STICK},COPPER_TORCH,4); sh(['###','###'],{'#':COPPER_INGOT},COPPER_BARS,16);
{ const k={'#':COPPER_INGOT,'|':STICK}; sh(['###',' | ',' | '],k,PICK_C); sh(['##','#|',' |'],k,AXE_C); sh(['#','|','|'],k,SHOVEL_C); sh(['#','#','|'],k,SWORD_C); sh(['##',' |',' |'],k,HOE_C);
  const a={'#':COPPER_INGOT}; sh(['###','# #'],a,HELM_C); sh(['# #','###','###'],a,CHEST_C); sh(['###','# #','# #'],a,LEGS_C); sh(['# #','# #'],a,BOOTS_C); }
SHAPELESS.push({in:[GUST_ROD],out:[WIND_CHARGE,4]}); sh(['ccc'],{c:CANE},PAPER,3); sh(['  |',' |s','| s'],{'|':STICK,s:STRING},FISHING_ROD);
sh([' i ','iri',' i '],{i:IRON_INGOT,r:REDSTONE},COMPASS); sh([' g ','grg',' g '],{g:GOLD_INGOT,r:REDSTONE},CLOCK); sh(['pip','ppp',' p '],{p:PLANKS,i:IRON_INGOT},SHIELD); sh(['p p','ppp'],{p:PLANKS},BOAT);
SHAPELESS.push({in:[PUMPKIN,TORCH],out:[JACK_O_LANTERN,1]},{in:[PUMPKIN],out:[PUMPKIN_SEEDS,4]},{in:[MELON_SLICE],out:[MELON_SEEDS,1]},{in:[PUMPKIN,SUGAR,EGG],out:[PUMPKIN_PIE,1]},
  {in:[PAPER,PAPER,PAPER,LEATHER],out:[BOOK,1]},{in:[FLOWER_RED],out:[dyeOf(14),1]},{in:[FLOWER_YELLOW],out:[dyeOf(4),1]},{in:[LAPIS],out:[dyeOf(11),1]});
// dye mixing (white dye = bone meal)
for(const [a,b,c] of [[14,4,1],[14,0,6],[13,0,5],[11,0,3],[11,13,9],[14,11,10],[10,6,2],[15,0,7],[7,0,8],[1,15,12]])SHAPELESS.push({in:[dyeOf(a),dyeOf(b)],out:[dyeOf(c),2]});
for(let c=1;c<16;c++)SHAPELESS.push({in:[WOOL,dyeOf(c)],out:[woolOf(c),1]});
for(let c=0;c<16;c++)sh(['ww'],{w:woolOf(c)},CARPET+c,3);
const MATS=[PLANKS,COBBLE,IRON_INGOT,DIAMOND];
MATS.forEach((m,i)=>{ const k={'#':m,'|':STICK};
  sh(['###',' | ',' | '],k,PICK_W+i); sh(['##','#|',' |'],k,AXE_W+i); sh(['#','|','|'],k,SHOVEL_W+i); sh(['#','#','|'],k,SWORD_W+i); sh(['##',' |',' |'],k,HOE_W+i); });
[[IRON_INGOT,HELM_I],[DIAMOND,HELM_D],[LEATHER,HELM_L],[GOLD_INGOT,HELM_G]].forEach(([m,h])=>{ const k={'#':m}; sh(['###','# #'],k,h); sh(['# #','###','###'],k,h+1); sh(['###','# #','# #'],k,h+2); sh(['# #','# #'],k,h+3); });
SHAPELESS.push({in:[LOG],out:[PLANKS,4]},{in:[GOLD_BLOCK],out:[GOLD_INGOT,9]},{in:[DIAMOND_BLOCK],out:[DIAMOND,9]},{in:[IRON_INGOT,FLINT],out:[FLINT_STEEL,1]},
  {in:[BLAZE_ROD],out:[BLAZE_POWDER,2]},{in:[ENDER_PEARL,BLAZE_POWDER],out:[ENDER_EYE,1]},{in:[BONE],out:[BONE_MEAL,3]},{in:[CANE],out:[SUGAR,1]},
  {in:[STONE],out:[BUTTON,1]},{in:[REDSTONE_BLOCK],out:[REDSTONE,9]},{in:[WHEAT],out:[SEEDS,1]});
const SMELT={[IRON_ORE]:IRON_INGOT,[GOLD_ORE]:GOLD_INGOT,[COBBLE]:STONE,[SAND]:GLASS,[PORK]:PORK_C,[BEEF]:BEEF_C,[MUTTON]:MUTTON_C,[LOG]:COAL,[NETHERRACK]:NETHER_BRICK,[REDSTONE_ORE]:REDSTONE};
const FUEL={[COAL]:80,[LOG]:15,[PLANKS]:15,[STICK]:5,[CRAFTING_TABLE]:15,[CHEST]:15,[WOOL]:5,[BED]:15,[BLAZE_ROD]:120,[LAVA_BUCKET]:200,[SAPLING]:5,[DOOR]:10};
Object.assign(SMELT,{[RAW_COPPER]:COPPER_INGOT,[COPPER_ORE]:COPPER_INGOT,[POTATO]:BAKED_POTATO,[CHICKEN]:CHICKEN_C,[FISH]:FISH_C,[CACTUS]:dyeOf(13),[CLAY_BALL]:BRICK_ITEM,[LAPIS_ORE]:LAPIS,[SANDSTONE]:SANDSTONE});
delete SMELT[SANDSTONE];
Object.assign(FUEL,{[FENCE]:15,[FENCE_GATE]:15,[SLAB_OAK]:8,[STAIRS_OAK]:15,[LADDER]:15,[BOOKSHELF]:15,[COAL_BLOCK]:800,[BOAT]:60,[FISHING_ROD]:15,[SPRUCE_LOG]:15,[JUNGLE_LOG]:15});
const SMELT_TIME=10;
// brewing: ingredient -> {base potion: result}
const BREW={[WART]:{[WATER_BOTTLE]:AWKWARD},[GOLD_INGOT]:{[AWKWARD]:POT_HEAL},[APPLE]:{[AWKWARD]:POT_REGEN},[BLAZE_POWDER]:{[AWKWARD]:POT_STRENGTH},
  [SUGAR]:{[AWKWARD]:POT_SPEED},[QUARTZ]:{[AWKWARD]:POT_FIRE},[GLOWSTONE]:{[AWKWARD]:POT_NIGHT}};
const BREW_TIME=10;
// enchantments: which item kinds, max level
const ENCH={Sharpness:{kinds:['sword'],max:5},Efficiency:{kinds:['pick','axe','shovel'],max:5},Unbreaking:{kinds:['pick','axe','shovel','sword','bow','armor','hoe'],max:3},
  Protection:{kinds:['armor'],max:4},Power:{kinds:['bow'],max:5},Fortune:{kinds:['pick'],max:3},Density:{kinds:['mace'],max:5},'Wind Burst':{kinds:['mace'],max:3}};
ENCH.Unbreaking.kinds.push('mace');
const ROMAN=['','I','II','III','IV','V'];
function itemKind(I){return I.tool||(I.bow?'bow':I.armor?'armor':null);}
function enchName(s){const I=ITEMS[s.id];if(!s.ench)return I.name;return I.name+' ✦ '+Object.entries(s.ench).map(([k,v])=>k+' '+ROMAN[v]).join(', ');}
// villager trades (each villager offers 4 of these)
const TRADES=[{in:[[COBBLE,12]],out:[EMERALD,1]},{in:[[WOOL,8]],out:[EMERALD,1]},{in:[[BEEF,4]],out:[EMERALD,1]},{in:[[COAL,10]],out:[EMERALD,1]},{in:[[WHEAT,16]],out:[EMERALD,1]},
  {in:[[EMERALD,1]],out:[APPLE,4]},{in:[[EMERALD,1]],out:[BREAD,3]},{in:[[EMERALD,3]],out:[IRON_INGOT,2]},{in:[[EMERALD,8]],out:[DIAMOND,1]},{in:[[EMERALD,6]],out:[ENDER_PEARL,1]},
  {in:[[EMERALD,4]],out:[BOW,1]},{in:[[EMERALD,3]],out:[ARROW,12]},{in:[[EMERALD,2]],out:[TORCH,8]},{in:[[EMERALD,5]],out:[BOOTS_I,1]},{in:[[EMERALD,2]],out:[REDSTONE,6]},
  {in:[[EMERALD,4]],out:[POT_HEAL,1]},{in:[[EMERALD,1]],out:[SEEDS,6]}];
// dimension settings
const DIMS={over:{name:'Overworld',amb:0.03},nether:{name:'the Nether',amb:0.3,sun:0,sky:[0.22,0.04,0.04],fog:0.35},end:{name:'the End',amb:0.22,sun:0.25,sky:[0.04,0.03,0.08],fog:0.9}};

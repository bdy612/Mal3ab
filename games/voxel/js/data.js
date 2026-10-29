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
      DOOR_B=85,DOOR_T=86,DOOR_B_O=87,DOOR_T_O=88;
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
 'I_REDSTONE','I_BUCKET','I_WATER_BUCKET','I_LAVA_BUCKET','I_DOOR','I_GUNPOWDER','I_REPEATER'].forEach(L);
const NUM_LAYERS=layerCount;

const BLOCKS=[]; const U8=()=>new Uint8Array(256);
const SOLID=U8(),TRANSPARENT=U8(),LIGHT_PASS=U8(),EMIT=U8(),TRANSLUCENT=U8(),PLANT=U8(),DECAL=U8(),LIQ=U8(),DIRTYPE=U8(),WASHABLE=U8(),REPLACE=U8(),GROW=U8(),RS=U8(),TILEBLK=U8(),SUPPORT=U8();
// SUPPORT: 1 = needs solid block below, 2 = attached via meta dir, 3 = plant soil rule, 4 = upper door half
function def(id,name,top,side,bottom,o={}){
  const B=BLOCKS[id]={id,name,tex:[side,side,top,bottom,side,side],solid:o.solid!==false,hardness:o.hardness??1,tier:o.tier??0,tool:o.tool||null,emit:o.emit||0,drop:o.drop,xp:o.xp||0,
    ftex:{front:o.front??side,back:o.back??side,side,top,bottom},noItem:!!o.noItem};
  SOLID[id]=B.solid?1:0; TRANSPARENT[id]=(o.transparent||o.plant||o.decal)?1:0; LIQ[id]=o.liq||0; EMIT[id]=B.emit; TRANSLUCENT[id]=o.translucent?1:0;
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
const MATS=[PLANKS,COBBLE,IRON_INGOT,DIAMOND];
MATS.forEach((m,i)=>{ const k={'#':m,'|':STICK};
  sh(['###',' | ',' | '],k,PICK_W+i); sh(['##','#|',' |'],k,AXE_W+i); sh(['#','|','|'],k,SHOVEL_W+i); sh(['#','#','|'],k,SWORD_W+i); sh(['##',' |',' |'],k,HOE_W+i); });
[[IRON_INGOT,HELM_I],[DIAMOND,HELM_D]].forEach(([m,h])=>{ const k={'#':m}; sh(['###','# #'],k,h); sh(['# #','###','###'],k,h+1); sh(['###','# #','# #'],k,h+2); sh(['# #','# #'],k,h+3); });
SHAPELESS.push({in:[LOG],out:[PLANKS,4]},{in:[GOLD_BLOCK],out:[GOLD_INGOT,9]},{in:[DIAMOND_BLOCK],out:[DIAMOND,9]},{in:[IRON_INGOT,FLINT],out:[FLINT_STEEL,1]},
  {in:[BLAZE_ROD],out:[BLAZE_POWDER,2]},{in:[ENDER_PEARL,BLAZE_POWDER],out:[ENDER_EYE,1]},{in:[BONE],out:[BONE_MEAL,3]},{in:[CANE],out:[SUGAR,1]},
  {in:[STONE],out:[BUTTON,1]},{in:[REDSTONE_BLOCK],out:[REDSTONE,9]},{in:[WHEAT],out:[SEEDS,1]});
const SMELT={[IRON_ORE]:IRON_INGOT,[GOLD_ORE]:GOLD_INGOT,[COBBLE]:STONE,[SAND]:GLASS,[PORK]:PORK_C,[BEEF]:BEEF_C,[MUTTON]:MUTTON_C,[LOG]:COAL,[NETHERRACK]:NETHER_BRICK,[REDSTONE_ORE]:REDSTONE};
const FUEL={[COAL]:80,[LOG]:15,[PLANKS]:15,[STICK]:5,[CRAFTING_TABLE]:15,[CHEST]:15,[WOOL]:5,[BED]:15,[BLAZE_ROD]:120,[LAVA_BUCKET]:200,[SAPLING]:5,[DOOR]:10};
const SMELT_TIME=10;
// brewing: ingredient -> {base potion: result}
const BREW={[WART]:{[WATER_BOTTLE]:AWKWARD},[GOLD_INGOT]:{[AWKWARD]:POT_HEAL},[APPLE]:{[AWKWARD]:POT_REGEN},[BLAZE_POWDER]:{[AWKWARD]:POT_STRENGTH},
  [SUGAR]:{[AWKWARD]:POT_SPEED},[QUARTZ]:{[AWKWARD]:POT_FIRE},[GLOWSTONE]:{[AWKWARD]:POT_NIGHT}};
const BREW_TIME=10;
// enchantments: which item kinds, max level
const ENCH={Sharpness:{kinds:['sword'],max:5},Efficiency:{kinds:['pick','axe','shovel'],max:5},Unbreaking:{kinds:['pick','axe','shovel','sword','bow','armor','hoe'],max:3},
  Protection:{kinds:['armor'],max:4},Power:{kinds:['bow'],max:5},Fortune:{kinds:['pick'],max:3}};
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

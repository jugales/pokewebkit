import { NgZone } from '@angular/core';
import { BitmapAnimation, BitmapPalette, BitmapPixelData, BitmapPixelDepth, BitmapService } from './bitmap.service';
import { GbaService } from './gba.service';
import { PokeTrainer } from './trainer.service';

export class PokeMap {

    constructor(
      public bankId?: number,
      public mapId?: number,
      public label?: string,
      public header?: MapHeader,
      public layout?: MapLayout,
      public blockset?: MapBlockset,
      public blockData?: MapBlockData,
      public entityData?: MapEntityData,
      public encounterData?: MapEncounterData
    ) { }
}
export class MapHeader {
  
    constructor(
      public address?: number,
      public data: number[] = [],
      public mapDataAddress?: number,
      public eventDataAddress?: number,
      public mapScriptsAddress?: number,
      public connectionsAddress?: number,
      public musicId?: number,
      public mapIndex?: number,
      public labelIndex?: number,
      public visibilityType?: number,
      public weatherType?: number,
      public mapType?: number,
      public shouldShowLabelOnEntry?: number,
      public battlefieldType?: number
    ) { }
  }
export class MapLayout {
  
    constructor(
      public mapWidth?: number,
      public mapHeight?: number,
      public borderTilemapAddress?: number,
      public tileDataAddress?: number,
      public primaryTilesetAddress?: number,
      public secondaryTilesetAddress?: number,
      public borderWidth?: number,
      public borderHeight?: number,
  
      public primaryTileset?: MapTileset,
      public secondaryTileset?: MapTileset
    ) { }
  
    public load(gbaService: GbaService) {
      this.mapWidth = gbaService.getInt();
      this.mapHeight = gbaService.getInt();
      this.borderTilemapAddress = gbaService.getPointer();
      this.tileDataAddress = gbaService.getPointer();
      this.primaryTilesetAddress = gbaService.getPointer();
      this.secondaryTilesetAddress = gbaService.getPointer();
      this.borderWidth = gbaService.getInt();
      this.borderHeight = gbaService.getInt();
    }
  }
export class MapTileset {
  
    private PALETTE_COUNT = 15
  
    constructor(
      public index?: number,
  
      public isCompressed?: boolean,
      public isSecondary?: boolean,
      public bitmapAddress?: number,
      public paletteAddress?: number,
      public blockAddress?: number,
      public blockBackgroundAddress?: number,
      public blockMetaAddress?: number,
  
      public pixels: number[] = [],
      public alternatePixels: number[] = [],
      public palettes: BitmapPalette[] = new Array(15)
    ) { }
  
    public load(gbaService: GbaService, bitmapService: BitmapService) {
      this.isCompressed = gbaService.getByte() == 1;
      this.isSecondary = gbaService.getByte() == 1;
      gbaService.skip(2);
      this.bitmapAddress = gbaService.getPointer();
      this.paletteAddress = gbaService.getPointer();
      this.blockAddress = gbaService.getPointer();
  
      if (gbaService.header.gameCode.startsWith('BPRE')) {
        this.blockBackgroundAddress = gbaService.getPointer();
        this.blockMetaAddress = gbaService.getPointer();
      } else {
        this.blockMetaAddress = gbaService.getPointer();
        this.blockBackgroundAddress = gbaService.getPointer();
      }
  
      gbaService.goTo(this.paletteAddress);
      let start = this.isSecondary ? gbaService.constants().MAIN_TILESET_PALETTE_COUNT : 0;
      let end = this.isSecondary ? this.PALETTE_COUNT : gbaService.constants().MAIN_TILESET_PALETTE_COUNT;
  
      for (let i = start; i < end; i++) {
        let palette: BitmapPalette = new BitmapPalette(this.paletteAddress + (i * 32), 16, undefined, undefined, bitmapService, gbaService,);
        this.palettes[i] = palette;
        this.loadPalettedImage(i, palette, bitmapService, gbaService);
      }
    }
  
    public loadPalettedImage(index: number, palette: BitmapPalette, bitmapService: BitmapService, gbaService: GbaService) {
      let pixels: BitmapPixelData = new BitmapPixelData(this.bitmapAddress, BitmapPixelDepth.BPP_4, undefined, bitmapService, gbaService);
      if(!this.pixels || this.pixels.length == 0)
        this.pixels = pixels.values;
      this.palettes[index] = palette;
    }
  
    public tileCache?: Map<any, any> = new Map<any, any>();
    public blockCache?: Map<any, any> = new Map<any, any>();
  
    public getBlock(blockId: number, gbaService: GbaService, bitmapService: BitmapService) {
      let originalBlockIndex = blockId;
  
      if (this.blockCache.has(originalBlockIndex)) 
        return this.blockCache.get(originalBlockIndex);
  
      if (blockId > gbaService.constants().MAIN_TILESET_BLOCK_COUNT) {
        blockId -= gbaService.constants().MAIN_TILESET_BLOCK_COUNT;
      }
  
      let mapBlock: MapBlock = new MapBlock();
      mapBlock.blockId = originalBlockIndex;
  
  
  
      if (gbaService.header.gameCode.startsWith('BPRE')) {
        mapBlock.behaviorId = gbaService.getByteAt(this.blockMetaAddress + (blockId * 4));
        mapBlock.backgroundId = gbaService.getByteAt(this.blockMetaAddress + (blockId * 4 + 3));
      } else {
        mapBlock.behaviorId = gbaService.getByteAt(this.blockMetaAddress + (blockId * 2));
        mapBlock.backgroundId = gbaService.getByteAt(this.blockMetaAddress + (blockId * 2 + 1));
      }
  
      let blockLayers = 2; // conditionally longer for 3-layer hack?
      let blockDataLength = blockLayers * 8; 
      let blockDataAddress = this.blockAddress + (blockId * blockDataLength);
  
      for (let i = 0; i < blockDataLength / 2; i++) {
        let tile: MapBlockTile = new MapBlockTile();
        let tileBits = gbaService.getShortAt(blockDataAddress + (i * 2));
  
              tile.tileId = tileBits & 0x3FF;
              tile.paletteId = (tileBits & 0xF000) >> 12;
              tile.xFlip = (tileBits & 0x400) > 0;
              tile.yFlip = (tileBits & 0x800) > 0;
  
        tile = this.getTile(tile, gbaService, bitmapService);
        mapBlock.tiles.push(tile);
      }
  
      this.blockCache.set(originalBlockIndex, mapBlock);
      return mapBlock;
    }
  
    public getTile(tile: MapBlockTile, gbaService: GbaService, bitmapService: BitmapService) {
      let normalizedTileId = tile.tileId;
      if (tile.tileId > gbaService.constants().MAIN_TILESET_BLOCK_COUNT)
        normalizedTileId -= gbaService.constants().MAIN_TILESET_BLOCK_COUNT;
  
      let tileKey = tile.tileId + '-' + tile.paletteId + '-' + tile.xFlip.toString() + '-' + tile.yFlip.toString();
      if (this.tileCache.has(tileKey)) 
        return this.tileCache.get(tileKey)
  
      let bitmapLength = 8 * 8 / 2;
  
      let tilePixelsValues: number[] = [];
      if (this.isSecondary && (normalizedTileId == tile.tileId)) {
        for (let i = 0; i < bitmapLength; i++) {
          tilePixelsValues[i] = this.alternatePixels[normalizedTileId * bitmapLength + i]
        }
      } else {
        for (let i = 0; i < bitmapLength; i++) {
          tilePixelsValues[i] = this.pixels[normalizedTileId * bitmapLength + i]
        }
      }
  
      let tilePixels = new BitmapPixelData(undefined, BitmapPixelDepth.BPP_4, tilePixelsValues, bitmapService, gbaService);
      let tileBitmap = bitmapService.createBitmapCanvas(tilePixels, this.palettes[tile.paletteId], 8, 8, true);
  
      let finalBitmap: HTMLCanvasElement = document.createElement('canvas');
      finalBitmap.width = 8;
      finalBitmap.height = 8;
      let finalBitmapContext = finalBitmap.getContext('2d');
        if (tile.xFlip || tile.yFlip) {
          this.mirrorImage(finalBitmapContext, tileBitmap, 0, 0, tile.xFlip, tile.yFlip);
        } else {
          finalBitmap = tileBitmap;
        }
  
      tile.bitmap = new BitmapAnimation([finalBitmap], finalBitmap, 1000 / 8, true, false, 0);
  
      this.tileCache.set(tileKey, tile);
      return tile;
    }
  
    private mirrorImage(ctx, image, x = 0, y = 0, horizontal = false, vertical = false){
      ctx.save();  // save the current canvas state
      ctx.setTransform(
          horizontal ? -1 : 1, 0, // set the direction of x axis
          0, vertical ? -1 : 1,   // set the direction of y axis
          horizontal ? image.width : 0, // set the x origin
          vertical ? image.height : 0   // set the y origin
      );
      ctx.drawImage(image,0,0);
      ctx.restore(); // restore the state as it was when this function was called
  }
}
export class MapBlockset {
  
    public animatedTiles: Map<any, any> = new Map<any, any>();
    public tilesetAnimationMap: any[] = [];

    public isLoaded: boolean = false;
    
    constructor(
      public primaryTileset?: MapTileset,
      public secondaryTileset?: MapTileset,
      public bitmapService?: BitmapService,
      public gbaService?: GbaService
    ) { 
      for (let i = 0; i < gbaService.constants().MAIN_TILESET_PALETTE_COUNT; i++) {
        secondaryTileset.loadPalettedImage(i, primaryTileset.palettes[i], bitmapService, gbaService);
        secondaryTileset.alternatePixels = primaryTileset.pixels;
      }
      for (let i = gbaService.constants().MAIN_TILESET_PALETTE_COUNT; i < 15; i++) {
        primaryTileset.loadPalettedImage(i, secondaryTileset.palettes[i], bitmapService, gbaService);
        primaryTileset.alternatePixels = secondaryTileset.pixels;
      }
      let palettes: any[] = [];
      for (let i = 0; i < 13; i++) {
        if (i < this.gbaService.constants().MAIN_TILESET_PALETTE_COUNT) {
          palettes.push(primaryTileset.palettes[i]);
        } else {
          palettes.push(secondaryTileset.palettes[i]);
        }
      }
  
      primaryTileset.palettes = palettes;
      secondaryTileset.palettes = palettes;
  
      for (let i = 0; i < 58; i ++) {
        let baseAddress = this.gbaService.constants().MAP_TILESET_ANIMATION_HEADER + (i * 24);
        let isPointer: boolean = this.gbaService.getByteAt(baseAddress + 3) == 8;
  
        if (isPointer) {
          this.tilesetAnimationMap.push({ id: i, address: baseAddress });
        }
      }
    }
  
    public getAnimatedTiles(zone: NgZone, worldMap: PokeMap) {
      let result: any[] = [];
      let primaryTilesetId: number = worldMap.layout.primaryTileset.index;
      let secondaryTilesetId: number = worldMap.layout.secondaryTileset.index;
  
      for (let i = 0; i < this.tilesetAnimationMap.length; i++) {
        if (this.tilesetAnimationMap[i].id == primaryTilesetId || this.tilesetAnimationMap[i].id == secondaryTilesetId) {
          this.gbaService.goTo(this.tilesetAnimationMap[i].address);
          let animationDataAddress = this.gbaService.getPointer();
          
          for (let j = 0; j < (i == 0 ? 3 : 1); j++) {
            this.gbaService.goTo(animationDataAddress + (j * 16));
            let stepDataAddress = this.gbaService.getPointer();
            let speed = this.gbaService.getShort();
            let unknown = this.gbaService.getByte();
            let animSlot = this.gbaService.getByte();
            let startTile = this.gbaService.getShort();
            let stepCount = this.gbaService.getByte();
            let unknown2 = this.gbaService.getByte();
            let tileCount = this.gbaService.getShort();
    
            var stepPieces: any[][] = [];
            let stepBitmaps: any[] = [];
            for (let i = 0; i < stepCount; i++) {
              this.gbaService.goTo(stepDataAddress + (i * 4));
              let pixelDataAddress = this.gbaService.getPointer();
              this.gbaService.goTo(pixelDataAddress);
              let bitmapPixelValues = this.gbaService.getBytes(8 * 8 * tileCount / 2);
              let bitmapPixels = new BitmapPixelData(undefined, BitmapPixelDepth.BPP_4, bitmapPixelValues, this.bitmapService, this.gbaService);
              let tilePalette = 4;
              let bitmapImage = this.bitmapService.createBitmapCanvas(bitmapPixels, worldMap.layout.primaryTileset.palettes[tilePalette ? tilePalette : 4], 16, undefined, true);
  
              stepBitmaps.push(bitmapImage.toDataURL());
              stepPieces.push([]);
              
              for(var x = 0; x < 2; ++x) {
                  for(var y = 0; y < bitmapImage.height; ++y) {
                      var canvas = document.createElement('canvas');
                      canvas.width = 8;
                      canvas.height = 8;
                      var context = canvas.getContext('2d');
                      context.drawImage(bitmapImage, x * 8, y * 8, 8, 8, 0, 0, canvas.width, canvas.height);
                      stepPieces[i].push(canvas.toDataURL());
                  }
              }
            }
  
            let animation: BitmapAnimation = new BitmapAnimation(stepBitmaps, stepBitmaps[0], 1000 / 8, true, false);
            result.push( { animation: animation, stepPieces: stepPieces, steps: stepBitmaps, stepDataAddress: stepDataAddress, speed: speed, unknown: unknown, animSlot: animSlot, startTile: startTile, stepCount: stepCount, unknown2: unknown2, tileCount: tileCount } );
          }
        }
      }
  
      return result;
    }
  
    public getAnimatedTile(tilesetIndex: number, tileIndex: number, palettes:BitmapPalette[], paletteId?: number, xFlip?: boolean, yFlip?: boolean, tilesetIndex2?: number) {
      if (tilesetIndex2 == undefined)
        tilesetIndex2 = -1;
      
      let normalizedTileIndex = tileIndex;
      
      let isSecondary: boolean = false;
      if (tileIndex > this.gbaService.constants().MAIN_TILESET_BLOCK_COUNT) {
        normalizedTileIndex -= this.gbaService.constants().MAIN_TILESET_BLOCK_COUNT;
        isSecondary = true;
      }
  
      if (normalizedTileIndex <= 0)
        return undefined;
  
      for (let i = 0; i < this.tilesetAnimationMap.length; i++) {
        if (this.tilesetAnimationMap[i].id == tilesetIndex || this.tilesetAnimationMap[i].id == tilesetIndex2) {
            
          
          this.gbaService.goTo(this.tilesetAnimationMap[i].address);
          let animationDataAddress = this.gbaService.getPointer();
          
          for (let j = 0; j < (i == 0 ? 3 : 1); j++) {
            this.gbaService.goTo(animationDataAddress + (j * 16));
            let stepDataAddress = this.gbaService.getPointer();
            this.gbaService.skip(4);
            let startTile = this.gbaService.getShort();
            let stepCount = this.gbaService.getByte();
            this.gbaService.skip(1);
            let tileCount = this.gbaService.getShort();
  
            let stepBitmaps: any[] = [];
  
            let normalizedStartTileIndex = startTile;
  
            if (isSecondary) {
              normalizedStartTileIndex -= this.gbaService.constants().MAIN_TILESET_BLOCK_COUNT;
            }
  
            // check if tile id is within animation tile bounds, if not, skip to next tile
            if ((tileIndex < startTile || tileIndex > (startTile + tileCount)) && tileIndex) {
              continue;
            }
  
            // build animation frames
            let dataSize = 8 * 8 / 2;
            for (let stepId = 0; stepId < stepCount; stepId++) {
              this.gbaService.goTo(stepDataAddress + (stepId * 4));
              let pixelDataAddress = this.gbaService.getPointer() + (dataSize * (normalizedTileIndex - normalizedStartTileIndex));
              this.gbaService.goTo(pixelDataAddress);
              let pixelDataValues = this.gbaService.getBytes(dataSize);
              let pixelData: BitmapPixelData = new BitmapPixelData(undefined, BitmapPixelDepth.BPP_4, pixelDataValues, this.bitmapService, this.gbaService);
  
              let stepTileBitmapCanvas: HTMLCanvasElement = this.bitmapService.createBitmapCanvas(pixelData, palettes[paletteId ? paletteId : 0], 8, 8, true);
              let finalBitmap: HTMLCanvasElement = document.createElement('canvas');
              let finalBitmapContext = finalBitmap.getContext('2d');
              finalBitmap.width = 8;
              finalBitmap.height = 8;
              if (xFlip || yFlip) {
                this.mirrorImage(finalBitmapContext, stepTileBitmapCanvas, 0, 0, xFlip, yFlip);
              } else {
                finalBitmap = stepTileBitmapCanvas;
              }
  
              stepBitmaps.push(finalBitmap);
            }
  
            let animation: BitmapAnimation = new BitmapAnimation(stepBitmaps, stepBitmaps[0], 1000 / 8, true, false);
            return { animation: animation };
          }
        }
      }
  
      return undefined;
    }
  
    private mirrorImage(ctx, image, x = 0, y = 0, horizontal = false, vertical = false){
      ctx.save();  // save the current canvas state
      ctx.setTransform(
          horizontal ? -1 : 1, 0, // set the direction of x axis
          0, vertical ? -1 : 1,   // set the direction of y axis
          horizontal ? image.width : 0, // set the x origin
          vertical ? image.height : 0   // set the y origin
      );
      ctx.drawImage(image,0,0);
      ctx.restore(); // restore the state as it was when this function was called
  }
  
    public getAnimatedTileIndexes(tilesetIndex?: number, secondaryTilesetIndex?: number) {
      let tileIndexes: number[][] = [];
      
      for (let i = 0; i < this.tilesetAnimationMap.length; i++) {
        if (this.tilesetAnimationMap[i].id == tilesetIndex || this.tilesetAnimationMap[i].id == secondaryTilesetIndex) {
          this.gbaService.goTo(this.tilesetAnimationMap[i].address);
          let animationDataAddress = this.gbaService.getPointer();
  
          for (let j = 0; j < (i == 0 ? 3 : 1); j++) {
            tileIndexes.push([]);
            this.gbaService.goTo(animationDataAddress + (j * 16));
            this.gbaService.skip(8);
            let startTile = this.gbaService.getShort();
            this.gbaService.skip(2);
            let tileCount = this.gbaService.getShort();
  
            for (let x = 0; x < tileCount; x++) 
              tileIndexes[j].push(startTile + x);
          }
        }
      }
  
      return tileIndexes;
    }
  
  
    public tileCache?: Map<any, any> = new Map<any, any>();
    public blockCache?: Map<any, any> = new Map<any, any>();
  
    public getBlock(blockIndex: number, gbaService: GbaService, bitmapService: BitmapService) {
      if (blockIndex < this.gbaService.constants().MAIN_TILESET_BLOCK_COUNT) {
        return this.primaryTileset.getBlock(blockIndex, gbaService, bitmapService);
      } else {
        return this.secondaryTileset.getBlock(blockIndex, gbaService, bitmapService);
      }
    }
  }
  export enum MapBlocksetLayer {
  
      BOTTOM = 0,
      TOP = 1,
      ALL = 2
}
export class MapBlockData {
  
    public bottomBlocks: any[][] = [];
    public topBlocks: any[][] = [];
  
    public blockIds: number[] = [];
    public blockMetas: number[] = [];
  
    constructor(
      public tileDataAddress?: number,
      public mapWidth?: number,
      public mapHeight?: number,
      public gbaService?: GbaService
    ) { 
      let ids: number[] = new Array(mapWidth * mapHeight);
      let metas: number[] = new Array(mapWidth * mapHeight);
  
      let index = 0;
      for (let y = 0; y < mapHeight; y++) {
        let currentRow: string = '';
              for (let x = 0; x < mapWidth; x++) {
                  let raw = gbaService.getShortAt(tileDataAddress + (index * 2));
                  ids[index] = raw & 0x3FF;
                  metas[index] = (raw & 0xFC00) >> 10;
  
          index++;
              }
        currentRow = '';
          }
          this.blockIds = ids;
          this.blockMetas = metas;
    }
}
export class MapEntityData {
  
    constructor(
      public gbaService: GbaService,
      public npcCount?: number,
      public signCount?: number,
      public warpCount?: number,
      public scriptCount?: number,
      public npcAddress?: number,
      public signAddress?: number,
      public warpAddress?: number,
      public scriptAddress?: number,
  
      public npcs: MapNPCData[] = [],
      public signs: MapSignData[] = [],
      public warps: MapWarpData[] = [],
      public scripts: MapScriptData[] = []
    ) { }
  
    public loadEntities() {
      for (let i = 0; i < this.npcCount; i++) {
        this.gbaService.goTo(this.npcAddress + (i * 24));
        let npcData: number[] = this.gbaService.getBytes(24);
  
        this.gbaService.goTo(this.npcAddress + (i * 24));
        let npc: MapNPCData = new MapNPCData();
        npc.uid = i;
        npc.data = npcData;
        npc.address = this.gbaService.position;
  
        npc.npcIndex = this.gbaService.getByte();
        npc.spriteId = this.gbaService.getByte();
        this.gbaService.skip(2);
        npc.xPosition = this.gbaService.getShort();
        npc.yPosition = this.gbaService.getShort();
        this.gbaService.skip(1);
        npc.movementType = this.gbaService.getByte();
        npc.movementParam = this.gbaService.getByte();
        this.gbaService.skip(1);
        npc.isTrainer = this.gbaService.getByte() == 1;
        this.gbaService.skip(1);
        npc.viewRadius = this.gbaService.getShort();
        npc.scriptAddress = this.gbaService.getPointer();
        npc.personId = this.gbaService.getShort();
        this.gbaService.skip(2);
  
        this.npcs.push(npc);
      }
  
      for (let i = 0; i < this.signCount; i++) {
        this.gbaService.goTo(this.signAddress + (i * 12));
        let signData: number[] = this.gbaService.getBytes(12);
  
        this.gbaService.goTo(this.signAddress + (i * 12));
        let sign: MapSignData = new MapSignData();
        sign.uid = i;
        sign.data = signData;
        sign.address = this.gbaService.position;
  
        sign.xPosition = this.gbaService.getShort();
        sign.yPosition = this.gbaService.getShort();
        sign.movementLayer = this.gbaService.getByte();
        sign.signType = this.gbaService.getByte();
        this.gbaService.skip(2); // unknown, possibly filler before pointer
        sign.scriptAddress = this.gbaService.getPointer();
  
        if (sign.signType == 5 || sign.signType == 6 || sign.signType == 7) {
          this.gbaService.backtrack(4);
          sign.hiddenItemId = this.gbaService.getShort();
          sign.globalHiddenIndex = this.gbaService.getByte();
          sign.hiddenItemAmount = this.gbaService.getByte();
        }
  
        this.signs.push(sign);
      }
  
      for (let i = 0; i < this.warpCount; i++) {
        this.gbaService.goTo(this.warpAddress + (i * 8));
        let warpData: number[] = this.gbaService.getBytes(8);
  
        this.gbaService.goTo(this.warpAddress + (i * 8));
        let warp: MapWarpData = new MapWarpData();
        warp.uid = i;
        warp.data = warpData;
        warp.address = this.gbaService.position;
  
        warp.xPosition = this.gbaService.getShort();
        warp.yPosition = this.gbaService.getShort();
        this.gbaService.skip(1);
        warp.destinationWarp = this.gbaService.getByte();
        warp.destinationMap = this.gbaService.getByte();
        warp.destinationBank = this.gbaService.getByte();
        
        this.warps.push(warp);
      }
  
      for (let i = 0; i < this.scriptCount; i++) {
        this.gbaService.goTo(this.scriptAddress + (i * 16));
        let scriptData: number[] = this.gbaService.getBytes(16);
  
        this.gbaService.goTo(this.scriptAddress + (i * 16));
        let script: MapScriptData = new MapScriptData();
        script.uid = i;
        script.data = scriptData;
        script.address = this.gbaService.position;
  
        script.xPosition = this.gbaService.getShort();
        script.yPosition = this.gbaService.getShort();
        this.gbaService.skip(2);
        script.varNumber = this.gbaService.getShort();
        script.varValue = this.gbaService.getShort();
        this.gbaService.skip(2);
        script.scriptAddress = this.gbaService.getPointer();
        
        this.scripts.push(script);
      }
    }
    
}
export class MapNPCData {
  
    public data: number[] = [];
  
    constructor(
      public uid?: number,
      public address?: number,
      public npcIndex?: number,
      public spriteId?: number,
      public xPosition?: number,
      public yPosition?: number,
      public movementType?: number,
      public movementParam?: number,
      public isTrainer?: boolean,
      public viewRadius?: number,
      public scriptAddress?: number,
      public personId?: number,
  
      public overworldSprite?: any,
      public script?: string,
      public trainers: PokeTrainer[] = [],
      public trainerSprites: any[] = []
    ) { }
}
export class MapSignData {
  
    public data: number[] = [];
  
    constructor(
      public uid?: number,
      public address?: number,
      public signIndex?: number,
      public xPosition?: number,
      public yPosition?: number,
      public movementLayer?: number,
      public signType?: number,
      public scriptAddress?: number,
  
      // only valid for hidden items
      public hiddenItemId?: number,
      public globalHiddenIndex?: number,
      public hiddenItemAmount?: number,
      public script?: string
    ) { }
}
export class MapWarpData {
  
    public data: number[] = [];
  
    constructor(
      public uid?: number,
      public address?: number,
      public xPosition?: number,
      public yPosition?: number,
      public destinationWarp?: number,
      public destinationBank?: number,
      public destinationMap?: number,
    ) { }
}
export class MapScriptData {
  
    public data: number[] = [];
  
    constructor(
      public uid?: number,
      public address?: number,
      public xPosition?: number,
      public yPosition?: number,
      public varNumber?: number,
      public varValue?: number,
      public scriptAddress?: number,
      public script?: string
    ) { }
}
export class PokeDoor {
  
    constructor(
      public blockId?: number,
      public doorType?: number,
      public paletteId?: number,
  
      public paletteIdAddress?: number,
      public blockPixelData: number[][] = [],
      public blocks: any[] = []
    ) { }
  
}
export class MapBlock {
  
    constructor(
      public blockId?: number,
      public tiles: MapBlockTile[] = [], // length = 4 * layer count
      public behaviorId?: number,
      public backgroundId?: number,
  
      public isAnimated: boolean = false // set during tool runtime for performance optimization
    ) { }
}
export class MapBlockTile {
  
    constructor(
      public tileId?: number,
      public paletteId?: number,
      public xFlip?: boolean,
      public yFlip?: boolean,
      public isSecondary?: boolean,
  
      public bitmap?: BitmapAnimation // non-animated tiles just have 1 animation frame; BitmapAnimation.start() only animates if frame count > 1
    ) { }
}
export class MapFieldOverlay {
  
    constructor(
      public address?: number,
      public title?: string,
      public index?: number,
      public tilesTag?: number,
      public paletteTag?: number,
      public baseOamAddress?: number,
      public animationTableAddress?: number,
      public imageAddress?: number,
      public oamc?: number,
      public framesTableAddress?: number,
      
      public frameWidth: number = 16,
      public frameHeight: number = 16,
  
      public frameCount: number = 0,
      public animationCount: number = 0,
  
      public bitmap?: BitmapAnimation, // raw
      public frames: HTMLCanvasElement[] = [], // individual frames reused in animations
      public animations: BitmapAnimation[] = [] // an overlay can have more than 1 animation
    ) { }
}
export class MapFieldOverlayDrawable {
  
    constructor(
      public overlay?: MapFieldOverlay,
      public x?: number,
      public y?: number,
      public intervalRef?: any
    ) { }
}
export class WildMonsterData {
  
    constructor(
      public address?: number,
      public monsterData: number[] = [],
      public minLevel?: number,
      public maxLevel?: number,
      public monsterId?: number,
      public spriteCanvas?: any
    ) { }
}
export class MapEncounterData {
  
    public encounterBankId: number = 0;
    public encounterMapId: number = 0;
    public grassAddress: number = 0;
    public surfAddress: number = 0;
    public treeAddress: number = 0;
    public fishingAddress: number = 0;
  
    public encounterTypeGroups: MapEncounterTypeGroup[] = [];
  
    constructor() { }
  
    public load(gbaService: GbaService, address: number) {
      gbaService.goTo(address);
      this.encounterBankId = gbaService.getByte();
      this.encounterMapId = gbaService.getByte();
      gbaService.skip(2);
      this.grassAddress = gbaService.getPointer();
      this.surfAddress = gbaService.getPointer();
      this.treeAddress = gbaService.getPointer();
      this.fishingAddress = gbaService.getPointer();
  
      if (this.grassAddress > 0)
        this.encounterTypeGroups.push(new MapEncounterTypeGroup(gbaService, this.grassAddress, 'GRASS'));
  
      if (this.surfAddress > 0)
        this.encounterTypeGroups.push(new MapEncounterTypeGroup(gbaService, this.surfAddress, 'SURF'));
  
      if (this.treeAddress > 0)
        this.encounterTypeGroups.push(new MapEncounterTypeGroup(gbaService, this.treeAddress, 'TREE'));
  
      if (this.fishingAddress > 0)
        this.encounterTypeGroups.push(new MapEncounterTypeGroup(gbaService, this.fishingAddress, 'FISHING'));
    }
  
    public getTypeList(type: string) {
      for (let i = 0; i < this.encounterTypeGroups.length; i++) {
        if (type == this.encounterTypeGroups[i].type) {
          return this.encounterTypeGroups[i];
        }
      }
      return undefined;
    }
  
    public containsType(type: string) {
      for (let i = 0; i < this.encounterTypeGroups.length; i++) {
        if (type == this.encounterTypeGroups[i].type) {
          return true;
        }
      }
      return false;
    }
}
export class MapEncounterTypeGroup {
  
    public ENCOUNTER_COUNTS = { GRASS: 12, SURF: 5, TREE: 5, FISHING: 10 };
  
    public ratio: number = 0;
    public isDayNightEnabled: boolean = false;
    public monsterDataAddress: number = 0;
  
    public wildMonsters: WildMonsterData[][] = [];
    public dayNightMonsters: number[] = [];
    
    public type = '';
  
    constructor(gbaService: GbaService, address: number, type: string) { 
      this.type = type;
  
      if (address > 0) {
        gbaService.goTo(address);
        this.ratio = gbaService.getByte();
        this.isDayNightEnabled = gbaService.getByte() == 1;
        gbaService.skip(2);
        this.monsterDataAddress = gbaService.getPointer();
        this.wildMonsters = new Array(this.isDayNightEnabled ? 4 : 1);
        this.dayNightMonsters = new Array(4);
        for (let i = 0; i < 4; i++) {
          if (this.isDayNightEnabled) {
            gbaService.goTo(this.monsterDataAddress + (i * 4));
            this.dayNightMonsters[i] = gbaService.getPointer();
          } else {
            this.dayNightMonsters[i] = -1;
          }
        }
        for (let i = 0; i < this.wildMonsters.length; i++) {
          if (!this.isDayNightEnabled) 
            gbaService.goTo(this.monsterDataAddress);
          else 
            gbaService.goTo(this.dayNightMonsters[i]);
          
          for (let j = 0; j < this.ENCOUNTER_COUNTS[type]; j++) {
            let wildMonster: WildMonsterData = new WildMonsterData();
            wildMonster.address = gbaService.position;
            wildMonster.monsterData = gbaService.getBytes(4);
            gbaService.goTo(wildMonster.address);
            wildMonster.minLevel = gbaService.getByte();
            wildMonster.maxLevel = gbaService.getByte();
            wildMonster.monsterId = gbaService.getShort();
    
            if (!this.wildMonsters[i])
              this.wildMonsters[i] = [];
            
            this.wildMonsters[i].push(wildMonster);
          }
        }
      }
    }
}

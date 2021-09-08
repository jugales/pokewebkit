import { Injectable } from '@angular/core';
import { AssemblyService } from './assembly.service';
import { BitmapAnimation, BitmapPalette, BitmapPixelData, BitmapPixelDepth, BitmapService } from './bitmap.service';
import { OverworldService } from './overworld.service';
import { GbaService } from './rom.service';
import { MapBlock, MapBlockData, MapBlockset, MapBlockTile, MapEncounterData, MapEntityData, MapFieldOverlay, MapHeader, MapLayout, MapTileset, PokeDoor, PokeMap } from './world-structures';

@Injectable({
  providedIn: 'root'
})
export class WorldService {

  public mapNames: string[] = [];
  public maps: PokeMap[][] = [];
  public isLoaded: boolean = false;

  public monsterEncounterCache: Map<String, MapEncounterData> = new Map<String, MapEncounterData>();

  public overlays: MapFieldOverlay[] = [];
  public overlayBaseOAMs: any[] = [];

  constructor(private gbaService: GbaService, private bitmapService: BitmapService,
    private assemblyService: AssemblyService, private overworldService: OverworldService) { }

  
  public getDoorset(index: number, palettes: any[]) {
    this.gbaService.goTo(this.gbaService.constants().MAP_DOORS_ADDRESS + (index * 12));
    let doorset: PokeDoor = new PokeDoor();
    doorset.blockId = this.gbaService.getShort();
    doorset.doorType = this.gbaService.getShort();
    let pixelDataAddress = this.gbaService.getPointer();
    doorset.paletteIdAddress = this.gbaService.getPointer();

    this.gbaService.goTo(doorset.paletteIdAddress);
    doorset.paletteId = this.gbaService.getByte();

    for (let i = 0; i < 3; i++) {
      this.gbaService.goTo(pixelDataAddress + (i * this.gbaService.constants().MAP_DOOR_PIXEL_LENGTH));
      doorset.blockPixelData.push(this.gbaService.getBytes(this.gbaService.constants().MAP_DOOR_PIXEL_LENGTH));

      let bitmapPixels: BitmapPixelData = new BitmapPixelData(undefined, BitmapPixelDepth.BPP_4, doorset.blockPixelData[i], this.bitmapService, this.gbaService);
      doorset.blocks.push(this.bitmapService.createBitmap(bitmapPixels, palettes[doorset.paletteId], 16, undefined, true));
    }
    return doorset;
  }

  public getDoorsetByBlockId(blockId: number, allDoorsets: PokeDoor[]) {
    for (let i = 0; i < allDoorsets.length; i++) {
      if (allDoorsets[i].blockId == blockId)
        return allDoorsets[i];
    }
    return undefined;
  }

  public getAllDoorsets(palettes: any[]) {
    let doorsets: PokeDoor[] = [];

    for (let i = 0; i < 32; i++) {
      let doorset: PokeDoor = this.getDoorset(i, palettes);
      doorsets.push(doorset);
    }
    return doorsets;
  }

  public loadOverlayBaseOAMs() {
    let startAddress = this.gbaService.constants().FIELD_OVERLAY_BASE_OAM_ADDRESS;
    if (this.gbaService.header.gameCode.startsWith('BPRE')) {
      this.overlayBaseOAMs.push({ address: startAddress, width: 8, height: 8 });
      this.overlayBaseOAMs.push({ address: startAddress + 8, width: 16, height: 8 });
      this.overlayBaseOAMs.push({ address: startAddress + 16, width: 16, height: 16 });
      this.overlayBaseOAMs.push({ address: startAddress + 32, width: 32, height: 8 });
      this.overlayBaseOAMs.push({ address: startAddress + 40, width: 64, height: 32 });
      this.overlayBaseOAMs.push({ address: startAddress + 48, width: 16, height: 32 });
      this.overlayBaseOAMs.push({ address: startAddress + 56, width: 32, height: 32 });
      this.overlayBaseOAMs.push({ address: startAddress + 64, width: 64, height: 64 });
    } else if (this.gbaService.header.gameCode.startsWith('BPEE')) {
      this.overlayBaseOAMs.push({ address: 0x5094ec, width: 8, height: 8 });
      this.overlayBaseOAMs.push({ address: 0x5094f4, width: 16, height: 8 });
      this.overlayBaseOAMs.push({ address: 0x5094fc, width: 16, height: 16 });
      this.overlayBaseOAMs.push({ address: 0x509504, width: 32, height: 8 });
      this.overlayBaseOAMs.push({ address: 0x50950c, width: 64, height: 32 });
      this.overlayBaseOAMs.push({ address: 0x509514, width: 16, height: 32 });
      this.overlayBaseOAMs.push({ address: 0x50951c, width: 32, height: 32 });
      this.overlayBaseOAMs.push({ address: 0x2ec690, width: 64, height: 64 });
    }

  }

  public getBaseOAM(address: number) {
    for (let i = 0; i < this.overlayBaseOAMs.length; i++) {
      if (this.overlayBaseOAMs[i].address == address) {
        return this.overlayBaseOAMs[i];
      }
    }

    // console.log('No OAM found for: ' + address.toString(16));
    return { address: undefined, width: 16, height: 16 };
  }

  public loadWildMonsterCache() {
    this.gbaService.goTo(this.gbaService.constants().MAP_ENCOUNTER_TABLE);
    let tablePosition: number = this.gbaService.getPointer();

    let i = 0;
    while (i < 255) { // shouldn't hit 255 due to sentinel but just in case
      let encounterData: MapEncounterData = new MapEncounterData();
      encounterData.load(this.gbaService, tablePosition + (i * 20));
      if (encounterData.encounterBankId == 3 && encounterData.encounterMapId == 19)
        console.log(encounterData);
      if (encounterData.encounterBankId == 0xFF && encounterData.encounterMapId == 0xFF) 
        break;

      this.monsterEncounterCache.set(encounterData.encounterBankId + '.' + encounterData.encounterMapId, encounterData);
      i++;
    }

  }

  public isBlockAnimated(blockData: MapBlock) {
    for (let i = 0; i < blockData.tiles.length; i++) {
      if (blockData.tiles[i].bitmap.bitmapFrames.length > 1) {
        return true;
      }
    }
    return false;
  }

  public drawBlock(destContext: any, blockData: MapBlock, blockX: number, blockY: number, isDrawingMap: boolean, layerId?: number) {
    if (blockData.tiles && blockData.tiles.length > 0) { 

      let start = 0;
      let end = 8; // exclusive
      if (layerId !== undefined) {
        if (layerId == 0) {
          end = 4;
        } else if (layerId == 1) {
          start = 4;
        }

        if (this.gbaService.header.gameCode.startsWith('BPEE') && blockData.backgroundId == 0x10) {
          if (layerId == 0) {
            end = 8;
          } else {
            end = 0;
          }
        } else if (this.gbaService.header.gameCode.startsWith('BPRE') && (blockData.backgroundId == 0x20 || blockData.backgroundId == 0x21)) {
          if (layerId == 0) {
            end = 8;
          } else {
            end = 0;
          }
        }
      }

      for (let i = start; i < end; i++) {
        let tile: MapBlockTile = blockData.tiles[i];
        
        if (!isDrawingMap || tile.bitmap.bitmapFrames.length > 1) { // only draw if first render or animated tiles
          let tileX: number = 0;
          let tileY: number = 0;

          // im lazy
          switch (i) {
            case 0:
            case 4:
              tileX = 0;
              tileY = 0;
              break;
            case 1:
            case 5:
              tileX = 8;
              tileY = 0;
              break;
            case 2:
            case 6:
              tileX = 0;
              tileY = 8;
              break;
            case 3:
            case 7:
              tileX = 8;
              tileY = 8;
              break;
          }

          destContext.drawImage(tile.bitmap.currentFrame, blockX + tileX, blockY + tileY);
        }
      }
    }
  }

  public getMap(bank: number, map: number) {
    this.isLoaded = false;
    let worldMap = this.maps[bank][map];
    
    if (!worldMap.encounterData) {
      worldMap.encounterData = this.monsterEncounterCache.get(bank + '.' + map);
    }

    // Map layout
    this.gbaService.goTo(worldMap.header.mapDataAddress);
    let mapLayout: MapLayout = new MapLayout();
    mapLayout.load(this.gbaService);
    worldMap.layout = mapLayout;

    // Tilesets
    this.gbaService.goTo(worldMap.layout.primaryTilesetAddress);
    let primaryTileset: MapTileset = new MapTileset();
    primaryTileset.load(this.gbaService, this.bitmapService);
    primaryTileset.index = Math.floor((worldMap.layout.primaryTilesetAddress - this.gbaService.constants().MAP_TILESET_BASE) / 24); // each tileset is 46 bytes
    worldMap.layout.primaryTileset = primaryTileset;
    this.gbaService.goTo(worldMap.layout.secondaryTilesetAddress);
    let secondaryTileset: MapTileset = new MapTileset();
    secondaryTileset.load(this.gbaService, this.bitmapService);
    secondaryTileset.index = Math.floor((worldMap.layout.secondaryTilesetAddress - this.gbaService.constants().MAP_TILESET_BASE) / 24); // each tileset is 46 bytes
    worldMap.layout.secondaryTileset = secondaryTileset;

    // Full blocks
    this.gbaService.goTo(worldMap.layout.tileDataAddress);
    worldMap.blockData = new MapBlockData(worldMap.layout.tileDataAddress, worldMap.layout.mapWidth, worldMap.layout.mapHeight, this.gbaService);
    worldMap.blockset = new MapBlockset(primaryTileset, secondaryTileset, this.bitmapService, this.gbaService);

    let index = 0;
    for (let yTile = 0; yTile < worldMap.layout.mapHeight; yTile++) {
      worldMap.blockData.bottomBlocks.push([]);
      worldMap.blockData.topBlocks.push([]);
      for (let xTile = 0; xTile < worldMap.layout.mapWidth; xTile++) {
        worldMap.blockData.bottomBlocks[yTile].push(worldMap.blockset.getBlock(worldMap.blockData.blockIds[index], this.gbaService, this.bitmapService));
        worldMap.blockData.topBlocks[yTile].push(worldMap.blockset.getBlock(worldMap.blockData.blockIds[index], this.gbaService, this.bitmapService));
        index++;
      }
    }

    // Entities
    this.gbaService.goTo(worldMap.header.eventDataAddress);
    let entityData: MapEntityData = new MapEntityData(this.gbaService);
    entityData.npcCount = this.gbaService.getByte();
    entityData.warpCount = this.gbaService.getByte();
    entityData.scriptCount = this.gbaService.getByte();
    entityData.signCount = this.gbaService.getByte();
    entityData.npcAddress = this.gbaService.getPointer();
    entityData.warpAddress = this.gbaService.getPointer();
    entityData.scriptAddress = this.gbaService.getPointer();
    entityData.signAddress = this.gbaService.getPointer();
    entityData.loadEntities();
    for (let i = 0; i < entityData.npcCount; i++) {
      let directionFrame: number = 0;
      let shouldFlip: boolean = false;
      switch (entityData.npcs[i].movementType) {
        case 7:
          directionFrame = 1;
          break;
        case 8:
        case 11:
          directionFrame = 0;
          break;
        case 9:
          directionFrame = 2;
          break;
        case 10:
          directionFrame = 2;
          shouldFlip = true;
          break;
      }

      let spriteImage = this.overworldService.getOverworldSprite(entityData.npcs[i].spriteId & 0xFF, directionFrame);
      if (spriteImage) {
        let spriteCanvas: HTMLCanvasElement = document.createElement('canvas');
        spriteCanvas.width = spriteImage.width;
        spriteCanvas.height = spriteImage.height;
        let spriteContext = spriteCanvas.getContext('2d');
   
        if (shouldFlip && spriteImage.width <= 32) {
          spriteContext.save();
          spriteContext.translate(spriteCanvas.width, 0);
          spriteContext.scale(-1, 1);
          spriteContext.drawImage(spriteImage, 0, 0);
          spriteContext.restore();
        } else {
          spriteContext.save();
          spriteContext.drawImage(spriteImage, 0, 0);
          spriteContext.restore();
        }
        entityData.npcs[i].overworldSprite = spriteCanvas;
      }
    }
    worldMap.entityData = entityData;
    this.isLoaded = true;

    return worldMap;
  }

  public async loadBlockCache(map: PokeMap) {
    for (let i = 0; i < 861; i++) {
      map.blockset.getBlock(i, this.gbaService, this.bitmapService);
    }
  }

  public loadWorld() {
    if (this.gbaService.constants()) {

      this.assemblyService.applyTileAnimationAssembly(this.gbaService.findFreeSpaceAddresses(1548, 1)[0]);
      this.loadOverlayBaseOAMs();
      this.loadFieldOverlays();
      this.loadWildMonsterCache();

      let mapNamesAddress = this.gbaService.constants().MAP_NAMES_ADDRESS;
      let mapNamesCount = this.gbaService.constants().MAP_NAMES_COUNT;

      this.gbaService.goTo(mapNamesAddress);
      this.mapNames = this.gbaService.getGameStringAutoList(mapNamesCount);

      let bankAddress = this.gbaService.constants().MAP_BANK_ADDRESS;
      let bankCount = this.gbaService.constants().MAP_BANK_COUNT;
      let bankSizes = this.gbaService.constants().MAP_BANK_SIZES;

      for (let i = 0; i < bankCount; i++) {
        this.gbaService.goTo(bankAddress + (i * 4));
        let headerAddress = this.gbaService.getPointer();
        this.maps.push([]);
        for (let j = 0; j < bankSizes[i]; j++) {
          this.gbaService.goTo(headerAddress + (j * 4));
          let mapAddress = this.gbaService.getPointer();
          this.gbaService.goTo(mapAddress);

          let map: PokeMap = new PokeMap();
          map.bankId = i;
          map.mapId = j;
          let mapHeader: MapHeader = new MapHeader();
          mapHeader.address = this.gbaService.position;
          mapHeader.data = this.gbaService.getBytes(28);
          this.gbaService.goTo(mapHeader.address);
          mapHeader.mapDataAddress = this.gbaService.getPointer();
          mapHeader.eventDataAddress = this.gbaService.getPointer();
          mapHeader.mapScriptsAddress = this.gbaService.getPointer();
          mapHeader.connectionsAddress = this.gbaService.getPointer();
          mapHeader.musicId = this.gbaService.getShort();
          mapHeader.mapIndex = this.gbaService.getShort();
          mapHeader.labelIndex = this.gbaService.getByte();
          mapHeader.visibilityType = this.gbaService.getByte();
          mapHeader.weatherType = this.gbaService.getByte();
          mapHeader.mapType = this.gbaService.getByte();
          this.gbaService.skip(2);
          mapHeader.shouldShowLabelOnEntry = this.gbaService.getByte();
          mapHeader.battlefieldType = this.gbaService.getByte();
          map.header = mapHeader;

          map.label = this.mapNames[mapHeader.labelIndex + this.gbaService.constants().MAP_NAME_OFFSET];

          this.maps[i].push(map);
        }
      }
    }
    this.gbaService.markToolLoaded();
  }

  public loadFieldOverlays() {
    let fieldMetas: any[] = this.gbaService.constants().FIELD_OVERLAY_META;
    let palettes = this.gbaService.constants().FIELD_OVERLAY_PALETTES;
    for (let i = 0; i < fieldMetas.length; i++) {
      let overlayData = fieldMetas[i];
      this.overlays.push(this.loadFieldOverlay(overlayData.label, overlayData.index, palettes, overlayData.paletteOverrideId));
    }
  }

  private loadFieldOverlay(title, id, palettes, paletteOverrideId) {
    let overlay: MapFieldOverlay = new MapFieldOverlay();
    this.gbaService.goTo(this.gbaService.constants().FIELD_OVERLAY_HEADER_ADDRESS + (id * 4))
    let overlayAddress = this.gbaService.getPointer();
    this.gbaService.goTo(overlayAddress);

    overlay.address = overlayAddress;
    overlay.title = title;
    overlay.index = id;
    overlay.tilesTag = this.gbaService.getShort();
    overlay.paletteTag = this.gbaService.getShort();
    overlay.baseOamAddress = this.gbaService.getPointer();
    
    overlay.animationTableAddress = this.gbaService.getPointer();
    overlay.framesTableAddress = this.gbaService.getPointer();
    this.gbaService.skip(4); // dummmy?
    overlay.oamc = this.gbaService.getPointer(); // dummmy?

    this.gbaService.goTo(overlay.framesTableAddress);
    overlay.imageAddress = this.gbaService.getPointer();
    
    let paletteAddress: number = palettes[0].address; // default
    for (let i = 0; i < palettes.length; i++) {
      if (overlay.paletteTag == palettes[i].key) {
        paletteAddress = palettes[i].address;
        break;
      }
    }

    let paletteData: BitmapPalette;

    if (!this.overworldService.overworldPalettes[4])
      this.overworldService.loadOverworldPalettes();

    // paletteOverrideId = reserved overworld palette id assigned (in the game) using C/ASM
    if (!paletteOverrideId) 
      paletteData = new BitmapPalette(paletteAddress, 16, undefined, undefined, this.bitmapService, this.gbaService, overlay.paletteTag);
    else
      paletteData = this.overworldService.overworldPalettes[paletteOverrideId];

    // frames
    overlay = this.loadOverlayFrames(overlay, paletteData);

    // animations
    overlay = this.loadOverlayAnimations(overlay, paletteData);

    return overlay;
  }

  private loadOverlayFrames(overlay: MapFieldOverlay, paletteData: BitmapPalette) {
    overlay.frameWidth = this.getBaseOAM(overlay.baseOamAddress).width;
    overlay.frameHeight = this.getBaseOAM(overlay.baseOamAddress).height;

    overlay.frameCount  = 0;
    overlay.animationCount = 0;
    // 32 animations max used for safety, should break beforehand from sentinel
    for (let i = 0; i < 32; i++) {
      this.gbaService.goTo(overlay.animationTableAddress + (i * 4));
      let potentialPointer: number = this.gbaService.getInt();
      if (this.gbaService.isValidPointer(potentialPointer))
        this.gbaService.goTo(this.gbaService.position - 4);
      else
        break;

      let currentAnimationAddress: number = this.gbaService.getPointer();
      // 32 frames max used for safety, should break beforehand from sentinel
      for (let j = 0; j < 32; j++) {
        this.gbaService.goTo(currentAnimationAddress + (j * 4));
        
        let frameId: number = this.gbaService.getShort();
        if (frameId == 0xFFFF)
          break;

        overlay.frameCount++;
      }
      overlay.animationCount++;
    }

    // sentinel usually hits before frameCount
    for (let j = 0; j < overlay.frameCount; j++) {
      this.gbaService.goTo(overlay.framesTableAddress + (j * 8));
      let potentialPointer: number = this.gbaService.getInt();
      if (this.gbaService.isValidPointer(potentialPointer))
        this.gbaService.goTo(this.gbaService.position - 4);
      else
        break;
        
      let bitmapAddress: number = this.gbaService.getPointer();
      let dataLength: number = this.gbaService.getShort();

      this.gbaService.goTo(bitmapAddress);
      let framePixelValues: number[] = this.gbaService.getBytes(dataLength);
      let framePixels: BitmapPixelData = new BitmapPixelData(undefined, BitmapPixelDepth.BPP_4, framePixelValues, this.bitmapService, this.gbaService);
      let frameCanvas: HTMLCanvasElement = this.bitmapService.createBitmapCanvas(framePixels, paletteData, overlay.frameWidth, overlay.frameHeight, true);
      overlay.frames.push(frameCanvas);
    }

    return overlay;
  }

  private loadOverlayAnimations(overlay: MapFieldOverlay, paletteData: BitmapPalette) {
    overlay.frameCount  = 0;
    overlay.animationCount = 0;
    // 32 animations max used for safety, should break beforehand from sentinel
    for (let i = 0; i < 32; i++) {
      this.gbaService.goTo(overlay.animationTableAddress + (i * 4));
      let potentialPointer: number = this.gbaService.getInt();
      if (this.gbaService.isValidPointer(potentialPointer))
        this.gbaService.goTo(this.gbaService.position - 4);
      else
        break;

      let currentAnimationAddress: number = this.gbaService.getPointer();
      let currentAnimationFrames: any[] = [];
      
      // 32 frames max used for safety, should break beforehand from sentinel
      for (let j = 0; j < 32; j++) {
        this.gbaService.goTo(currentAnimationAddress + (j * 4));
        let frameId: number = this.gbaService.getShort();

        if (frameId == 0xFFFF || frameId > overlay.frames.length)
          break;

        currentAnimationFrames.push(overlay.frames[frameId]);
      }

      let currentAnimation: BitmapAnimation = new BitmapAnimation(currentAnimationFrames, 
        currentAnimationFrames[overlay.index == 4 || currentAnimationFrames[overlay.index] == 5 ? 1 : 0], 
        300, false, false, overlay.index == 4 || currentAnimationFrames[overlay.index] == 5 ? 1 : 0);
      overlay.animations.push(currentAnimation);
    }
    return overlay;
  }
}

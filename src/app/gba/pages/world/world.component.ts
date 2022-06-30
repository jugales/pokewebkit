import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { PendingChange, GbaService } from 'src/app/gba/services/gba.service';
import { WorldService } from 'src/app/gba/services/world/world.service';
import { MapBlock, MapBlockData, MapBlockTile, MapFieldOverlay, MapFieldOverlayDrawable, MapNPCData, MapScriptData, MapSignData, MapWarpData, PokeMap, WildMonsterData } from 'src/app/gba/structures/world-structures';
import { BitmapService } from 'src/app/gba/services/graphics/bitmap.service';
import { MatDialog } from '@angular/material/dialog';
import { ItemService } from 'src/app/gba/services/item/item.service';
import { MonsterService } from 'src/app/gba/services/monster/monster.service';
import { OverworldService } from 'src/app/gba/services/world/overworld.service';
import { ViewportService } from 'src/app/services/viewport.service';
import { PorkyScript, PorkyScriptService } from 'src/app/gba/services/scripting/porky-script.service';
import { PokeTrainer, TrainerService } from 'src/app/gba/services/world/trainer.service';
import { ScriptEditorDialogComponent } from './dialogs/script-editor-dialog/script-editor-dialog.component';
import { BlockEditorDialogComponent } from './dialogs/block-editor-dialog/block-editor-dialog.component';
import { DoorEditorDialogComponent } from './dialogs/door-editor-dialog/door-editor-dialog.component';
import { FieldEditorDialogComponent } from './dialogs/field-editor-dialog/field-editor-dialog.component';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {

  public currentWorldTool = 'tiles';

  public currentBankId: number = 0;
  public currentBank: any;
  public currentMap: PokeMap = new PokeMap();

  public currentMovementId: number = 12; // magic number aligning to "allow all movement" as a default

  public currentPaintBlock: MapBlock;
  public currentPaintBlockId: number = 0;
  public currentPaintBlockCanvas: HTMLCanvasElement;
  public currentPaintBlockContext: CanvasRenderingContext2D;

  public currentHoverBlockBottom: any;
  public currentHoverBlockTop: any;
  public currentHoverBlockId: number = 0;
  public currentMetaId: number = 0;

  public currentEntityType: string = 'NPC';
  public currentEntityId: number = 0;
  public currentNPC: MapNPCData;
  public currentSign: MapSignData;
  public currentWarp: MapWarpData;
  public currentScript: MapScriptData;

  public grassOverlay: MapFieldOverlay;
  public currentOverlays: MapFieldOverlayDrawable[] = [];
  public currentOverlayCache: Map<String, MapFieldOverlayDrawable> = new Map<String, MapFieldOverlayDrawable>();

  public defaultBank: number = 0;
  public defaultMap: number = 0;

  public isShowingOverworlds: boolean = true;
  public isMouseDown: boolean = false;

  public zoom: number = 2;

  public animatedTileIndexes: number[][] = [];

  public isDrawingBlockset: boolean = false;
  public currentBlocksetCanvas: HTMLCanvasElement;
  public currentBlocksetContext: CanvasRenderingContext2D;

  public currentEncounterType: string = 'GRASS';

  public tileIntervalRef: any;

  public worldRenderRef: any;

  public isAnimatingTiles: boolean = false;
  public isBlocksetRendered: boolean = false;
  public isBlockChanged: boolean = false;

  public isMinitoolAvailable: boolean = false;
  public isMinitoolPopupOpen: boolean = false;

  constructor(public gbaService: GbaService, public worldService: WorldService, 
    private changeDetector: ChangeDetectorRef, public bitmapService: BitmapService, 
    private scriptService: PorkyScriptService, private dialog: MatDialog,
    private overworldService: OverworldService, private zone: NgZone,
    public itemService: ItemService, public monsterService: MonsterService,
    public trainerService: TrainerService, public viewportService: ViewportService) { 
    
  }

  ngOnInit(): void {
    if (!this.monsterService.monsters || this.monsterService.monsters.length == 0)
      this.monsterService.loadMonsters();
    if (!this.trainerService.trainers || this.trainerService.trainers.length == 0)
      this.trainerService.loadTrainers();
    if (!this.itemService.items || this.itemService.items.length == 0)
      this.itemService.loadItems();

    this.currentBlocksetCanvas = document.createElement('canvas');
    this.currentBlocksetContext = this.currentBlocksetCanvas.getContext('2d');

    this.currentPaintBlockCanvas = document.createElement('canvas');
    this.currentPaintBlockContext = this.currentPaintBlockCanvas.getContext('2d');
    
    if (this.viewportService.isMedium)
      this.isMinitoolPopupOpen = true;

    if (this.gbaService.isLoaded()) 
      this.loadWorld();
  
    this.gbaService.romLoaded.subscribe(() => {
      this.loadWorld();
    });

    this.dialog.afterOpened.subscribe(() => {
      this.isMinitoolAvailable = false;
      this.isMinitoolPopupOpen = false;
    });
    this.dialog.afterAllClosed.subscribe(() => {
      this.onToolUpdated();
    })
  }

  public toggleMinitoolPopup() {
    this.isMinitoolPopupOpen = !this.isMinitoolPopupOpen;
  }

  public changeZoom() {
    if (this.zoom < 3)
      this.zoom++;
    else
      this.zoom = 1;
  }

  private async loadWorld() {
    this.defaultBank = <number>this.gbaService.constants().DEFAULT_MAP.split('.')[0];
    this.defaultMap = <number>this.gbaService.constants().DEFAULT_MAP.split('.')[1];

    if (this.worldService.maps.length == 0)
      this.worldService.loadWorld();
    this.worldService.isLoaded = true;

    this.setCurrentBank(this.worldService.maps[this.defaultBank]);

    if (!this.currentMap.header)
      this.setCurrent(this.worldService.maps[this.defaultBank][this.defaultMap], this.defaultBank, this.defaultMap);

    this.gbaService.markLoaded();
  }

  public setCurrent(map: PokeMap, bankId?: number, mapId?: number) {
      let startTime = Date.now();

      if (!bankId)
        bankId = map.bankId;
      if (!mapId)
        mapId = map.mapId;

      // saves RAM and improves performance
      if (this.currentMap && this.currentMap.blockset) {
        this.stopTileAnimations();

        this.currentMap.blockset.primaryTileset.tileCache.clear();
        this.currentMap.blockset.secondaryTileset.tileCache.clear();

        if (this.worldRenderRef) 
          cancelAnimationFrame(this.worldRenderRef);
      }

      this.currentMap = this.worldService.getMap(bankId, mapId);
      this.currentMap.blockset.isLoaded = true;

      if (this.currentMap.encounterData && this.currentMap.encounterData.encounterTypeGroups && this.currentMap.encounterData.encounterTypeGroups.length > 0) {
        for (let i = 0; i < this.currentMap.encounterData.encounterTypeGroups.length; i++) {
          this.currentEncounterType = this.currentMap.encounterData.encounterTypeGroups[i].type;
          break;
        }

        this.updateEncounterSprites();
      }

      setTimeout(() => {
        let startCacheTime = Date.now();
        this.worldService.loadBlockCache(this.currentMap);
        this.changeDetector.detectChanges();
        let endTime = Date.now();
        console.log('Loaded tile cache in ' + ((endTime - startCacheTime) / 1000).toFixed(1) + ' seconds');

        this.worldService.getDoorset(0, this.currentMap.layout.primaryTileset.palettes);

        this.animatedTileIndexes = this.currentMap.blockset.getAnimatedTileIndexes(this.currentMap.blockset.primaryTileset.index, this.currentMap.blockset.secondaryTileset.index);
        for (let i = 0; i < this.animatedTileIndexes.length; i++) {
          for (let t = 0; t < this.animatedTileIndexes[i].length; t++) {
            for (const [key, value] of this.currentMap.blockset.primaryTileset.tileCache.entries()) {
              let tile: MapBlockTile = value;
              
              if (tile.tileId > 0 && tile.tileId == this.animatedTileIndexes[i][t] && tile.bitmap.bitmapFrames.length == 1) {
                let animatedTile = this.currentMap.blockset.getAnimatedTile(this.currentMap.blockset.primaryTileset.index, tile.tileId, this.currentMap.blockset.primaryTileset.palettes, tile.paletteId, tile.xFlip, tile.yFlip);
                if (animatedTile) {
                  tile.bitmap.bitmapFrames = [];
                  
                  for (let f = 0; f < animatedTile.animation.bitmapFrames.length; f++) {
                    tile.bitmap.bitmapFrames.push(animatedTile.animation.bitmapFrames[f]);
                  }
                }
              }
            }
            for (const [key, value] of this.currentMap.blockset.secondaryTileset.tileCache.entries()) {
              let tile: MapBlockTile = value;
              
              if (tile.tileId > 0 && tile.tileId == this.animatedTileIndexes[i][t] && tile.bitmap.bitmapFrames.length == 1) {
                let animatedTile = this.currentMap.blockset.getAnimatedTile(this.currentMap.blockset.secondaryTileset.index, tile.tileId, this.currentMap.blockset.primaryTileset.palettes, tile.paletteId, tile.xFlip, tile.yFlip, this.currentMap.blockset.primaryTileset.index);
                if (animatedTile) {
                  tile.bitmap.bitmapFrames = [];
                  for (let f = 0; f < animatedTile.animation.bitmapFrames.length; f++) {
                    tile.bitmap.bitmapFrames.push(animatedTile.animation.bitmapFrames[f]);
                  }
                }
              }
            }
          }
        }

        this.grassOverlay = this.worldService.overlays[4];
        this.setCurrentEntity(0, 'NPC');
   
        this.currentBlocksetContext.clearRect(0, 0, this.currentBlocksetCanvas.width, this.currentBlocksetCanvas.height);
        this.currentBlocksetCanvas.width = 128;
        this.currentBlocksetCanvas.height = 1760;

        this.currentPaintBlockContext.clearRect(0, 0, this.currentBlocksetCanvas.width, this.currentBlocksetCanvas.height);        
        this.currentPaintBlockCanvas.width = 16;
        this.currentPaintBlockCanvas.height = 16;

        this.isBlockChanged = true;
        this.drawWorld();
      });
      this.onToolUpdated();
      
      let endTime = Date.now();
      console.log('Loaded map in ' + ((endTime - startTime) / 1000).toFixed(1) + ' seconds');
  }

  private async drawWorld() {
    this.worldRenderRef = requestAnimationFrame(this.drawWorld.bind(this));
    this.zone.runOutsideAngular(() => {
      this.drawParties();
      this.drawPaintBlock();
    }); 
  }

  public setTileAnimationState(newValue?: boolean) {
    if (newValue !== undefined)
      this.isAnimatingTiles = newValue;

    if (!this.isAnimatingTiles) {
      this.stopTileAnimations();
    }
  }

  public updateEncounterSprites() {
    for (let i = 0; i < this.currentMap.encounterData.encounterTypeGroups.length; i++) {
      for (let j = 0; j < this.currentMap.encounterData.encounterTypeGroups[i].wildMonsters.length; j++) {
        for (let x = 0; x < this.currentMap.encounterData.encounterTypeGroups[i].wildMonsters[j].length; x++) {
          let encounter = this.currentMap.encounterData.encounterTypeGroups[i].wildMonsters[j][x];
          encounter.spriteCanvas = this.monsterService.loadBattleSprite(encounter.monsterId, true, false);
        }
      }
    }
  }

  public drawParties() {
    let loopTime: number = performance.now(); // helps sync monster animations
    if (this.currentWorldTool == 'entities' && this.currentEntityType == 'NPC' && this.currentNPC && this.currentNPC.trainerSprites && this.currentNPC.trainerSprites.length > 0) {
      for (let i = 0; i < this.currentNPC.trainers.length; i++) {
        let trainer: PokeTrainer = this.currentNPC.trainers[i];
        for (let j = 0; j < trainer.partyCount; j++) {
          if (!this.monsterService.monsterIcons[trainer.party[j].species].isAnimating)
            this.monsterService.monsterIcons[trainer.party[j].species].start();
          this.monsterService.monsterIcons[trainer.party[j].species].doAnimation(loopTime);
        }
      }
    }
  }

  public goToTrainer(trainerId: number) {
    this.gbaService.toolSwitched.emit({tool: 'trainerTool' });
    this.trainerService.trainerIndexChanged.emit(trainerId);
  }

  public stopTileAnimations() {
    for (const [key, value] of this.currentMap.blockset.primaryTileset.tileCache.entries()) {
      let tile: MapBlockTile = value;
      tile.bitmap.stop();
    }
    for (const [key, value] of this.currentMap.blockset.secondaryTileset.tileCache.entries()) {
      let tile: MapBlockTile = value;
      tile.bitmap.stop();
    }
  }

  public mouseOverBlock(col: number, row: number) {
    let blockMapId = row * this.currentMap.layout.mapWidth + col;
    this.currentHoverBlockId = this.currentMap.blockData.blockIds[blockMapId];

    // simple drag detection; mouse clicked (down) and also hovered
    if (this.isMouseDown) {
      this.blockClicked(col, row);
    }
  }

  public setCurrentBank(bank: any, loadInitialMap?: boolean) {
    if (bank != this.currentBank)
      this.currentBank = bank;

    if (loadInitialMap)
      this.setCurrent(this.worldService.getMap(this.worldService.maps.indexOf(this.currentBank), 0));
  }

  public blockEnter(blockData: MapBlockData, j, i) {
    let index = j * this.currentMap.layout.mapWidth + i;
    this.currentHoverBlockId = blockData.blockIds[index];
    this.currentMetaId = blockData.blockMetas[index];
  }

  public paintBlockSelected(i) {
    this.currentPaintBlockId = i;
    this.currentPaintBlock = this.currentMap.blockset.getBlock(i, this.gbaService, this.bitmapService);

    if (!this.viewportService.isMedium)
      this.isMinitoolPopupOpen = false;

    this.drawPaintBlock();
  }

  public drawPaintBlock() {
    this.worldService.drawBlock(this.currentPaintBlockContext, this.currentPaintBlock, 0, 0, false);
  }

  public blockClicked(x: number, y: number) {
    this.isMouseDown = true; 

    let blockMapId = y * this.currentMap.layout.mapWidth + x;
    if (this.currentWorldTool == 'tiles' || this.currentWorldTool == 'movement') {
      // Change value depending on editor
      if (this.currentWorldTool == 'tiles')
        this.currentMap.blockData.blockIds[blockMapId] = this.currentPaintBlockId;
      else if (this.currentWorldTool == 'movement')
        this.currentMap.blockData.blockMetas[blockMapId] = this.currentMovementId;

      this.isBlockChanged = true;

      // Build the pending change for file save
      // Movement and block id are held in a weird 16-bit structure together (block id 10 bits, movement id 6 bits)
      let pendingChange: PendingChange = new PendingChange();
      pendingChange.changeReason = this.currentMap.label + ' ' + ' Block Changed at X:' + x + ', Y:' + y;
      pendingChange.key = this.currentMap.layout.tileDataAddress + '-' + x + '-' + y + '-' + blockMapId;
      pendingChange.address = this.currentMap.layout.tileDataAddress + (blockMapId * 2);
      let blockIdBits: string = this.gbaService.toBitString(this.currentMap.blockData.blockIds[blockMapId], 10);
      let blockMetaBits: string = this.gbaService.toBitString(this.currentMap.blockData.blockMetas[blockMapId], 6);
      let bitValue: string = blockMetaBits + blockIdBits;
      let blockValue: number = Number.parseInt(bitValue, 2);
      pendingChange.bytesToWrite = this.gbaService.bytesFromShort(blockValue);
      this.gbaService.goTo(pendingChange.address);
      pendingChange.bytesBefore = this.gbaService.getBytes(pendingChange.bytesToWrite.length);
      this.gbaService.queueChange(pendingChange); // map allows automatic overwriting of existing pending changes (to prevent duplicate write errors)
    }

    if (this.currentWorldTool == 'encounters') {
      if (this.isGrassEncounterBlock(this.currentMap.blockData.blockIds[blockMapId])) {
        this.currentEncounterType = 'GRASS';
      } else if (this.isSurfEncounterBlock(this.currentMap.blockData.blockIds[blockMapId])) {
        if (this.currentEncounterType == 'FISHING' || this.currentEncounterType == 'GRASS')
          this.currentEncounterType = 'SURF';
        else if (this.currentEncounterType == 'SURF')
          this.currentEncounterType = 'FISHING';
      }
    }

    this.changeDetector.detectChanges();
  }
  
  public editBlocks() {
    this.dialog.open(BlockEditorDialogComponent, { data: { currentMap: this.currentMap, blockset: this.currentBlocksetCanvas } });
  }

  public editDoors() {
    this.dialog.open(DoorEditorDialogComponent, { data: { currentMap: this.currentMap } });
  }

  public editOverlays() {
    this.dialog.open(FieldEditorDialogComponent, { data: { currentMap: this.currentMap } });
  }

  public floorValue(value) {
    return Math.floor(value);
  }

  public onToolUpdated() {
    if (this.currentWorldTool === 'tiles' || this.currentWorldTool === 'movement' || this.currentWorldTool === 'entities' || this.currentWorldTool === 'encounters')
      this.isMinitoolAvailable = true;
    else
      this.isMinitoolAvailable = false;
  }

  public setCurrentEntity(id: any, type?: string) {
    console.log(id);

    this.currentEntityType = type;

    switch (type) {
      case 'NPC':
        this.currentNPC = this.currentMap.entityData.npcs[id];
        if (this.currentNPC && this.currentNPC.scriptAddress > 0) {
          let structuredScript: PorkyScript = this.scriptService.decompile(this.currentNPC.scriptAddress);
          this.currentNPC.script = this.scriptService.toXSE(structuredScript);

          // get trainers for this NPC based on decompiled script, 5000 character check for broken scripts (e.g. daycare lady)
          if (this.currentNPC.isTrainer || (this.currentNPC.script.length < 5000 && this.currentNPC.script.includes('trainerbattle'))) {
            let trainerBattleRefs: string[] = this.currentNPC.script.split('trainerbattle');
            if (trainerBattleRefs.length > 1) {
              for (let i = 1; i < trainerBattleRefs.length; i++) {
                let trainerId: number = parseInt(trainerBattleRefs[i].trim().split(' ')[1], 16);
                let trainer: PokeTrainer = this.trainerService.trainers[trainerId - 1];
                console.log(trainer);
                if (!this.currentNPC.trainers.includes(trainer)) {
                  this.currentNPC.trainers.push(trainer);
                  this.currentNPC.trainerSprites.push(this.trainerService.loadSprite(trainer.spriteId));
                }
              }
            }
          }
        }
        break;
      case 'SIGN':
        this.currentSign = this.currentMap.entityData.signs[id];
        if (this.currentSign && this.currentSign.scriptAddress > 0) {
          let structuredScript: PorkyScript = this.scriptService.decompile(this.currentSign.scriptAddress);
          this.currentSign.script = this.scriptService.toXSE(structuredScript);
        }
        break;
      case 'WARP':
        this.currentWarp = this.currentMap.entityData.warps[id];
        break;
      case 'SCRIPT':
        this.currentScript = this.currentMap.entityData.scripts[id];
        if (this.currentScript && this.currentScript.scriptAddress > 0) {;
          let structuredScript: PorkyScript = this.scriptService.decompile(this.currentScript.scriptAddress);
          this.currentScript.script = this.scriptService.toXSE(structuredScript);
        }
        break;
    }
  }
  
  public isEncounterBlock(blockId: number) {
    return this.isGrassEncounterBlock(blockId) || this.isSurfEncounterBlock(blockId);
  }

  public isGrassEncounterBlock(blockId: number) {
    let block: MapBlock = this.currentMap.blockset.getBlock(blockId, this.gbaService, this.bitmapService);
    if (block.behaviorId == 2 || block.behaviorId == 209)  
      return true; // grass encounter possible

    return false;
  }

  public isSurfEncounterBlock(blockId: number) {
    let block: MapBlock = this.currentMap.blockset.getBlock(blockId, this.gbaService, this.bitmapService);

    if (block.behaviorId == 16 || block.behaviorId == 17 || block.behaviorId == 21) 
      return true; // water encounter possible

    return false;
  }

  public getInputHexValue(event: any) {
    let hexString: string = event.target.value;
    let hexTest = /[0-9A-Fa-f]{6}/g;
    let result: number = 0;

    // If valid hex number
    if (hexTest.test(hexString)) {
      result = Number.parseInt(hexString, 16);
    }

    return result;
  }

  public getMovement(id: number) {
    for (let i = 0; i < this.movements.length; i++) {
      if (this.movements[i].id == id)
        return this.movements[i];
    }
    return { id: id, title: '???', color: '#ccccccb3' };
  }

  public movements: any[] = [
    { id: 0x0, title: 'All Movement', color: '#0000ffb3', layer: 'Transition', type: 'allowed' },
    { id: 0x1, title: 'Obstacle', color: '#ff0000b3', layer: 'All Layers', type: 'restricted' },
    { id: 0x4, title: 'Surf Only', color: '#ff00ffb3', layer: 'Surfing', type: 'allowed' },
    { id: 0x5, title: 'Obstacle', color: '#ffff00b3', layer: 'Layer 0', type: 'restricted' },
    { id: 0x8, title: 'All Movement', color: '#808000b3', layer: 'Layer 1', type: 'allowed' },
    { id: 0x9, title: 'Obstacle', color: '#008000b3', layer: 'Layer 1', type: 'restricted' },
    { id: 0xC, title: 'All Movement', color: '#800080b3', layer: 'Layer 2 (default)', type: 'allowed' },
    { id: 0xD, title: 'Obstacle', color: '#ff0080b3', layer: 'Layer 2 (default)', type: 'restricted' },
    { id: 0x10, title: 'All Movement', color: '#4aa22db3', layer: 'Layer 3', type: 'allowed' },
    { id: 0x11, title: 'Obstacle', color: '#1ae64db3', layer: 'Layer 3', type: 'restricted' },
    { id: 0x14, title: 'All Movement', color: '#005300b3', layer: 'Layer 4', type: 'allowed' },
    { id: 0x15, title: 'Obstacle', color: '#7da6bdb3', layer: 'Layer 4', type: 'restricted' },
    { id: 0x18, title: 'All Movement', color: '#156a62b3', layer: 'Layer 5', type: 'allowed' },
    { id: 0x19, title: 'Obstacle', color: '#ab2951b3', layer: 'Layer 5', type: 'restricted' },
    { id: 0x1C, title: 'All Movement', color: '#7035bfb3', layer: 'Layer 6', type: 'allowed' },
    { id: 0x1D, title: 'Obstacle', color: '#6175d6b3', layer: 'Layer 6', type: 'restricted' },
    { id: 0x20, title: 'All Movement', color: '#ffff00b3', layer: 'Layer 7', type: 'allowed' },
    { id: 0x21, title: 'Obstacle', color: '#658040b3', layer: 'Layer 7', type: 'restricted' },
    { id: 0x24, title: 'All Movement', color: '#4e70f8b3', layer: 'Layer 8', type: 'allowed' },
    { id: 0x25, title: 'Obstacle', color: '#3159a4b3', layer: 'Layer 8', type: 'restricted' },
    { id: 0x28, title: 'All Movement', color: '#b4de21b3', layer: 'Layer 9', type: 'allowed' },
    { id: 0x29, title: 'Obstacle', color: '#f54b50b3', layer: 'Layer 9', type: 'restricted' },
    { id: 0x2C, title: 'All Movement', color: '#1eac68b3', layer: 'Layer 10', type: 'allowed' },
    { id: 0x2D, title: 'Obstacle', color: '#be7641b3', layer: 'Layer 10', type: 'restricted' },
    { id: 0x30, title: 'All Movement', color: '#14eba5b3', layer: 'Layer 11', type: 'allowed' },
    { id: 0x31, title: 'Obstacle', color: '#804040b3', layer: 'Layer 11', type: 'restricted' },
    { id: 0x34, title: 'All Movement', color: '#c8ab37b3', layer: 'Layer 12', type: 'allowed' },
    { id: 0x35, title: 'Obstacle', color: '#3ec165b3', layer: 'Layer 12', type: 'restricted' },
    { id: 0x38, title: 'All Movement', color: '#00ffffb3', layer: 'Layer 13', type: 'allowed' },
    { id: 0x39, title: 'Obstacle', color: '#bc0ac0b3', layer: 'Layer 13', type: 'restricted' },
    { id: 0x3C, title: 'Depends on Surrounding Blocks', color: '#5355acb3', layer: 'Layer Varies', type: 'wildcard' }
  ];

  public movementTypes: string[] = ['No Movement', 'Look around', 'Walk around', 'Walk up and down', 'Walk up and down', 'Walk left and right', 'Walk left and right', 'Look up', 'Look down', 'Look left', 'Look right', 'Look down', 'Hidden', 'Look up and down', 'Look left and right', 'Look up and left', 'Look up and right', 'Look down and left', 'Look down and right', 'Look up, down and left', 'Look up, down and right', 'Look up, left and right', 'Look down, left and right', 'Look around counterclockwise', 'Look around clockwise', 'Run up and down', 'Run up and down', 'Run left and right', 'Run left and right', 'Run up, right, left and down', 'Run right, left, down and up', 'Run down, up, right and left', 'Run left, down, up and right', 'Run up, left, right and down', 'Run left, right, down and up', 'Run down, up, left and right', 'Run right, down, up and left', 'Run left, up, down and right', 'Run up, down, right and left', 'Run right, left, up and down', 'Run down, right, left and up', 'Run right, up, down and left', 'Run up, down, left and right', 'Run left, right, up and down', 'Run down, left, right and up', 'Run around counterclockwise', 'Run around counterclockwise', 'Run around counterclockwise', 'Run around counterclockwise', 'Run around counterclockwise', 'Run around clockwise', 'Run around clockwise', 'Run around clockwise', 'Copy Player', 'Mirror Player', 'Mirror Player', 'Mirror Player', 'Tree wall disguise', 'Rock wall disguise', 'Mirror player (standing)', 'Copy player (standing)', 'Mirror player (standing)', 'Mirror player (standing)', 'Hidden', 'Walk on the spot (Down)', 'Walk on the spot (Up)', 'Walk on the spot (Left)', 'Walk on the spot (Right)', 'Jog on the spot (Down)', 'Jog on the spot (Up)', 'Jog on the spot (Left)', 'Jog on the spot (Right)', 'Run on the spot (Down)', 'Run on the spot (Up)', 'Run on the spot (Left)', 'Run on the spot (Right)', 'Hidden', 'Walk on the spot (Down)', 'Walk on the spot (Up)', 'Walk on the spot (Left)', 'Walk on the spot (Right)'];
}
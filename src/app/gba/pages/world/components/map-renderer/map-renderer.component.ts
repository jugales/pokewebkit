import { Component, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { GbaService } from 'src/app/gba/services/gba.service';
import { BitmapService } from 'src/app/gba/services/graphics/bitmap.service';
import { WorldService } from 'src/app/gba/services/world/world.service';
import { MapBlock, MapBlockTile, MapNPCData, MapScriptData, MapSignData, MapWarpData, PokeMap } from 'src/app/gba/structures/world-structures';

const TILE_SIZE: number = 16;

@Component({
  selector: 'app-map-renderer',
  templateUrl: './map-renderer.component.html',
  styleUrls: ['./map-renderer.component.css']
})
export class MapRendererComponent implements OnInit, OnChanges {

  @Input() public currentWorldTool: string = 'tiles';
  @Input() public currentMap: PokeMap;
  @Input() public zoom: number = 2;
  @Input() public isAnimatingTiles: boolean = false;
  @Input() public isShowingOverworlds: boolean = false;

  @Input() public currentEntityType: string = 'NPC';
  @Input() public currentEntityId: number = 0;
  @Input() public currentNPC: MapNPCData;
  @Input() public currentSign: MapSignData;
  @Input() public currentWarp: MapWarpData;
  @Input() public currentScript: MapScriptData;
  @Output() public entitySelected: EventEmitter<any> = new EventEmitter<any>();

  public isDrawingMap: boolean = false;
  public isBlockChanged: boolean = false;

  public currentMapCanvas: HTMLCanvasElement;
  public currentMapContext: CanvasRenderingContext2D;

  public isMouseDown: boolean = false;
  public currentHoverBlockId: number = 0;
  @Output() public blockHovered: EventEmitter<number> = new EventEmitter<number>();
  @Output() public blockClicked: EventEmitter<any> = new EventEmitter<any>();

  public worldRenderRef: any;

  constructor(private zone: NgZone, private gbaService: GbaService, private bitmapService: BitmapService,
    private worldService: WorldService) { 
    this.currentMapCanvas = document.createElement('canvas');
    this.currentMapContext = this.currentMapCanvas.getContext('2d');
  }

  ngOnInit(): void {

    if (this.currentMap)
      this.onMapChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.currentMap)
      this.onMapChange();
  }

  public onMapChange(): void {
    this.currentMapContext.clearRect(0, 0, this.currentMapCanvas.width, this.currentMapCanvas.height);
    this.currentMapCanvas.width = this.currentMap.layout.mapWidth * 16;
    this.currentMapCanvas.height = this.currentMap.layout.mapHeight * 16;

    if (this.worldRenderRef) 
      cancelAnimationFrame(this.worldRenderRef);

    this.drawMap();
  }

  public setCurrentEntity(id: number, type: string) {
    this.entitySelected.emit({ id: id, type: type });
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

  public drawMap(): void {
    this.worldRenderRef = requestAnimationFrame(this.drawMap.bind(this));
    this.zone.runOutsideAngular(() => { 
      this.isDrawingMap = false;
      this.drawTiles();

      if (this.isAnimatingTiles)
        this.drawTileAnimations();
    }); 
  }

  public drawTiles(): void {
    // bottom tile layer
    for (let row = 0; row < this.currentMap.layout.mapHeight; row++) {
      for (let col = 0; col < this.currentMap.layout.mapWidth; col++) {
        let blockId: number = this.currentMap.blockData.blockIds[row * this.currentMap.layout.mapWidth + col];
        let blockData: MapBlock = this.currentMap.blockset.getBlock(blockId, this.gbaService, this.bitmapService);
        let blockX: number = col * TILE_SIZE;
        let blockY: number = row * TILE_SIZE;

        this.currentMapContext.clearRect(blockX, blockY, 16, 16);
        this.worldService.drawBlock(this.currentMapContext, blockData, blockX, blockY, this.isDrawingMap, 0);
      }
    }

    // object/player layer
    if (this.isShowingOverworlds) {
      for (let npcId = 0; npcId < this.currentMap.entityData.npcs.length; npcId++) {
        let npc: MapNPCData = this.currentMap.entityData.npcs[npcId];
        if (npc && npc.overworldSprite) {
          let npcX: number = npc.xPosition * TILE_SIZE - (npc.overworldSprite.width >  16 ? (npc.overworldSprite.width / 4) : 0);
          let npcY: number = npc.yPosition * TILE_SIZE - (npc.overworldSprite.height - TILE_SIZE);
    
          if (npc.overworldSprite && npc.xPosition < this.currentMap.layout.mapWidth && npc.yPosition < this.currentMap.layout.mapHeight) {
            this.currentMapContext.drawImage(npc.overworldSprite, npcX, npcY);
          }
        }
      }
    }

    // top tile layer
    for (let row = 0; row < this.currentMap.layout.mapHeight; row++) {
      for (let col = 0; col < this.currentMap.layout.mapWidth; col++) {
        let blockId: number = this.currentMap.blockData.blockIds[row * this.currentMap.layout.mapWidth + col];
        let blockData: MapBlock = this.currentMap.blockset.getBlock(blockId, this.gbaService, this.bitmapService);
        let blockX: number = col * TILE_SIZE;
        let blockY: number = row * TILE_SIZE;

        this.worldService.drawBlock(this.currentMapContext, blockData, blockX, blockY, this.isDrawingMap, 1);
      }
    }

    this.isBlockChanged = false;
    this.isDrawingMap = true;
  }

  public drawTileAnimations(): void {
    let loopTime: number = performance.now(); // helps sync tile animations

    // Draw tile animations together to avoid desync issues
    for (const [key, value] of this.currentMap.blockset.primaryTileset.tileCache.entries()) {
      let tile: MapBlockTile = value;
      if (tile.bitmap.bitmapFrames.length > 1) {
        if (!tile.bitmap.isAnimating)
          tile.bitmap.start(this.zone);
        tile.bitmap.doAnimation(loopTime);
      }
    }
    for (const [key, value] of this.currentMap.blockset.secondaryTileset.tileCache.entries()) {
      let tile: MapBlockTile = value;
      if (tile.bitmap.bitmapFrames.length > 1) {
        if (!tile.bitmap.isAnimating)
          tile.bitmap.start(this.zone);
        tile.bitmap.doAnimation(loopTime);
      }
    }
  }

  public mouseOverBlock(col: number, row: number) {
    let blockMapId = row * this.currentMap.layout.mapWidth + col;
    this.currentHoverBlockId = this.currentMap.blockData.blockIds[blockMapId];

    this.blockHovered.emit(this.currentHoverBlockId);

    // simple drag detection; mouse clicked (down) and also hovered
    if (this.isMouseDown) {
      this.clickBlock(col, row);
    }
  }

  public clickBlock(col: number, row: number) {
    this.isMouseDown = true;
    this.blockClicked.emit({ col: col, row: row });
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

}

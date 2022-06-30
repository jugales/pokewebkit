import { Component, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { GbaService } from 'src/app/gba/services/gba.service';
import { BitmapService } from 'src/app/gba/services/graphics/bitmap.service';
import { WorldService } from 'src/app/gba/services/world/world.service';
import { MapBlock, PokeMap } from 'src/app/gba/structures/world-structures';
import { ViewportService } from 'src/app/services/viewport.service';

const TILE_SIZE: number = 16;

@Component({
  selector: 'app-blockset-minitool',
  templateUrl: './blockset-minitool.component.html',
  styleUrls: ['./blockset-minitool.component.css']
})
export class BlocksetMinitoolComponent implements OnInit, OnChanges {

  @Input() public isOpen: boolean = false;
  @Input() public currentMap: PokeMap;
  @Input() public zoom: number = 2;

  public isDrawingBlockset: boolean = false;
  public currentBlocksetCanvas: HTMLCanvasElement;
  public currentBlocksetContext: CanvasRenderingContext2D;

  public currentPaintBlock: any;
  public currentPaintBlockCanvas: HTMLCanvasElement;
  public currentPaintBlockContext: CanvasRenderingContext2D;

  public maxBlockCount: number = 861;
  @Input() public currentPaintBlockId: number = 0;
  @Output() public blockSelected: EventEmitter<any> = new EventEmitter<any>();

  public worldRenderRef: any;

  constructor(public worldService: WorldService, public viewportService: ViewportService,
    private gbaService: GbaService, private bitmapService: BitmapService,
    private zone: NgZone) { 
      this.currentBlocksetCanvas = document.createElement('canvas');
      this.currentBlocksetContext = this.currentBlocksetCanvas.getContext('2d');
      
      this.currentPaintBlockCanvas = document.createElement('canvas');
      this.currentPaintBlockContext = this.currentPaintBlockCanvas.getContext('2d');
    }

  ngOnInit(): void {
    if (this.currentMap && this.currentMap.blockset)
      this.onChangeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.currentMap) {
      this.onChangeMap();
    }
  }

  public floorValue(value) {
    return Math.floor(value);
  }

  public paintBlockSelected(blockId: any) {
    this.currentPaintBlockId = blockId;
    this.currentPaintBlock = this.currentMap.blockset.getBlock(blockId, this.gbaService, this.bitmapService);
    
    this.blockSelected.emit(blockId);
  }

  public onChangeMap() {
    this.currentBlocksetContext.clearRect(0, 0, this.currentBlocksetCanvas.width, this.currentBlocksetCanvas.height);  
    this.currentBlocksetCanvas.width = 128;
    this.currentBlocksetCanvas.height = 1760;

    this.currentPaintBlockContext.clearRect(0, 0, this.currentPaintBlockCanvas.width, this.currentPaintBlockCanvas.height);        
    this.currentPaintBlockCanvas.width = 16;
    this.currentPaintBlockCanvas.height = 16;

    this.paintBlockSelected(1); // 0 on basically every blockset is empty
    this.renderBlockset();
  }

  private async renderBlockset() {
    this.worldRenderRef = requestAnimationFrame(this.renderBlockset.bind(this));
    this.zone.runOutsideAngular(() => {
      this.drawBlockset();
      this.drawPaintBlock();
    }); 
  }

  public drawBlockset() {
    
    for (let i = 0; i < this.maxBlockCount; i++) {
      let block: MapBlock = this.currentMap.blockset.getBlock(i, this.gbaService, this.bitmapService);
      let blockX = i * TILE_SIZE % this.currentBlocksetCanvas.width;
      let blockY = Math.floor((i * TILE_SIZE / this.currentBlocksetCanvas.width)) * TILE_SIZE;

      if ((this.worldService.isBlockAnimated(block) || !this.isDrawingBlockset) && this.isOpen) {
        this.worldService.drawBlock(this.currentBlocksetContext, block, blockX, blockY, this.isDrawingBlockset);
      }
    }
  }

  public drawPaintBlock() {
    this.worldService.drawBlock(this.currentPaintBlockContext, this.currentPaintBlock, 0, 0, false);
  }

}

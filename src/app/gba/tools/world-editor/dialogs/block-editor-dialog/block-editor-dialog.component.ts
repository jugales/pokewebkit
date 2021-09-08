import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BitmapAnimation, BitmapService } from 'src/app/gba/services/bitmap.service';
import { RomService } from 'src/app/gba/services/rom.service';
import { WorldService } from 'src/app/gba/services/world.service';
import { MapBlock, PokeDoor, PokeMap } from 'src/app/gba/services/world-structures';


@Component({
  selector: 'app-block-editor-dialog',
  templateUrl: './block-editor-dialog.component.html',
  styleUrls: ['./block-editor-dialog.component.css']
})
export class BlockEditorDialogComponent implements OnInit {

  public currentMap: PokeMap;
  public currentTilesetPalette: number = 0;

  public selectedBlockId: any;
  public selectedBlock: MapBlock;
  public selectedBlockBottom: any;
  public selectedBlockTop: any;

  public behaviorNames: string[] = [];
  public backgroundNames: string[] = [];

  public blockset: HTMLCanvasElement;
  public blockLayers: HTMLCanvasElement;
  public blockLayersContext: CanvasRenderingContext2D;

  public zoom: number = 2.0;

  public currentAnimation: BitmapAnimation;
  public allDoorsets: PokeDoor[] = [];

  private renderInterval: any;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, 
    public romService: RomService, public worldService: WorldService, public bitmapService: BitmapService,
    private zone: NgZone) { 
    this.blockLayers =  document.createElement('canvas');
    this.blockLayersContext = this.blockLayers.getContext('2d');
    this.blockLayers.width = 32;
    this.blockLayers.height = 16;
    

    this.buildBehaviorNames();
    this.buildBackgroundNames();
    
    this.currentMap = data.currentMap;
    this.blockset = data.blockset;
    this.allDoorsets = this.worldService.getAllDoorsets(this.currentMap.layout.primaryTileset.palettes);
    this.selectBlock(1);
  }

  ngOnInit(): void {
  }


  public selectBlock(index: number) {
    this.selectedBlockId = index;
    this.selectedBlock = this.currentMap.blockset.getBlock(this.selectedBlockId, this.romService, this.bitmapService);

    if (this.renderInterval)
      clearInterval(this.renderInterval);

    let doorset: PokeDoor = this.worldService.getDoorsetByBlockId(this.selectedBlockId, this.allDoorsets);
    if (doorset) {
      this.currentAnimation = new BitmapAnimation(doorset.blocks, doorset.blocks[0], 225, true, false);
      this.currentAnimation.start(this.zone);
      
    } else {
      this.currentAnimation = undefined;
    }

    this.renderInterval = setInterval(() => {
      if (this.currentAnimation)
        this.currentAnimation.doAnimation();
    },250);
  }

  public close() {
    this.dialog.closeAll();
  }

  public floorValue(value) {
    return Math.floor(value);
  }

  private buildBehaviorNames() {
    for (let i = 0; i < 256; i++) {
      let name: string = '???';
      switch (i) {
        case 0x00: name = 'Normal'; break; 
        case 0x02: name = 'Grass animation'; break; 
        case 0x03: name = 'High grass animation'; break; 
        case 0x06: name = 'Sand foot prints (with sandheaps)'; break; 
        case 0x07: name = 'Animation micro grass'; break; 
        case 0x0A: name = 'Only walking possible'; break; 
        case 0x0D: name = 'Warp into pyramid. Floor 51'; break; 
        case 0x10: name = 'Reflection on water with waves trailing'; break; 
        case 0x13: name = 'Waterfall/with falling down'; break; 
        case 0x15: name = 'Jump with mach bike, splashing water'; break; 
        case 0x16: name = 'Reflection on water, splashing water, waves'; break; 
        case 0x17: name = 'Lasting water on feet'; break; 
        case 0x1A: name = 'Reflection (Background byte=20)'; break; 
        case 0x1B: name = 'Water on feet'; break; 
        case 0x1C: name = 'Water on feet + arrow down'; break; 
        case 0x20: name = 'Slide like on ice'; break; 
        case 0x21: name = 'Foot prints'; break; 
        case 0x22: name = 'Diving animation bubbles'; break; 
        case 0x25: name = 'Sand foot prints'; break; 
        case 0x28: name = 'Hero halfway underwater'; break; 
        case 0x2A: name = 'Diving animation bubbles'; break; 
        case 0x30: name = 'Person blocked on right'; break; 
        case 0x31: name = 'Person blocked on left'; break; 
        case 0x32: name = 'Person blocked upwards'; break; 
        case 0x33: name = 'Person blocked downwards'; break; 
        case 0x34: name = 'Person blocked up/down/right'; break; 
        case 0x35: name = 'Person blocked up/down/left'; break; 
        case 0x36: name = 'Person blocked down/right'; break; 
        case 0x37: name = 'Person blocked down/left'; break; 
        case 0x38: name = 'Person jumps right over block'; break; 
        case 0x39: name = 'Person jumps left over block'; break; 
        case 0x3A: name = 'Person jumps up over block'; break; 
        case 0x3B: name = 'Person jumps down over block'; break; 
        case 0x40: name = 'Hero walks right'; break; 
        case 0x41: name = 'Hero walks left'; break; 
        case 0x42: name = 'Hero walKs up'; break; 
        case 0x43: name = 'Hero walks down'; break; 
        case 0x44: name = 'Hero slides right'; break; 
        case 0x45: name = 'Hero slides left'; break; 
        case 0x46: name = 'Hero slides up'; break; 
        case 0x47: name = 'Hero slides down'; break; 
        case 0x48: name = 'Hero slides up/down/left/right'; break; 
        case 0x50: name = 'Hero runs right'; break; 
        case 0x51: name = 'Hero runs left'; break; 
        case 0x52: name = 'Hero runs up'; break; 
        case 0x53: name = 'Hero runs down'; break; 
        case 0x61: name = 'Use warp'; break; 
        case 0x62: name = 'Arrow right => warp left of block'; break; 
        case 0x63: name = 'Arrow left => warp right of block'; break; 
        case 0x64: name = 'Arrow up => warp above block'; break; 
        case 0x65: name = 'Arrow down => warp under block'; break; 
        case 0x66: name = 'Warp into last-visited building'; break; 
        case 0x67: name = 'Regular Warp'; break; 
        case 0x68: name = 'Drown in sand (warp)'; break; 
        case 0x69: name = 'Door Animation (if Block ID is in table)'; break; 
        case 0x6A: name = 'Pok�Center escalator up/use warp'; break; 
        case 0x6B: name = 'Pok�Center escalator down/use warp'; break; 
        case 0x6C: name = 'Warp to emerge from water => Hero is surfing'; break; 
        case 0x6D: name = 'Arrow down => warp under block'; break; 
        case 0x6E: name = 'Warp/person exits upwards'; break; 
        case 0x74: name = 'Water on feet'; break; 
        case 0x75: name = 'Water on feet'; break; 
        case 0x76: name = 'Water on feet'; break; 
        case 0x77: name = 'Water on feet'; break; 
        case 0x83: name = 'PC'; break; 
        case 0x84: name = 'Sign (FRLG)'; break; 
        case 0x83: name = 'Television'; break; 
        case 0xBB: name = 'Hero jumps twice'; break; 
        case 0xBC: name = 'Hero turns around and goes back into direction he came from'; break; 
        case 0xBE: name = 'Person blocked left/right,'; break; 
        case 0xC0: name = 'Person blocked up/down'; break; 
        case 0xC1: name = 'Person blocked left/right'; break; 
        case 0xD0: name = 'Slippery clay animation'; break; 
        case 0xD1: name = 'Only passable with acro bike'; break; 
        case 0xD3: name = 'Solid block'; break; 
        case 0xD4: name = 'Solid block'; break; 
        case 0xD5: name = 'Solid block'; break; 
        case 0xD6: name = 'Solid block'; break; 
        default:
          name = '???'
      }
      this.behaviorNames.push(i + ' - ' + name);
    }
  }

  private buildBackgroundNames() {
    for (let i = 0; i < 256; i++) {
      let name: string = '???';
      switch (i) {
        case 0x00: name = 'Normal'; break;
        case 0x10: if (this.romService.header.gameCode == 'BPEE') name = 'Overworlds Cover Block'; break; 
        case 0x20: if (this.romService.header.gameCode.startsWith('BPRE')) name = 'Overworlds Cover Block'; break; 
        default:
          name = '???'
      }
      this.backgroundNames.push(i + ' - ' + name);
    }
  }
}

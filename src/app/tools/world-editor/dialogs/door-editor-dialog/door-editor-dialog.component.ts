import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BitmapAnimation, BitmapService } from 'src/app/services/bitmap.service';
import { RomService } from 'src/app/services/rom.service';
import { ViewportService } from 'src/app/services/viewport.service';
import { WorldService } from 'src/app/services/world.service';
import { MapBlock, PokeDoor, PokeMap } from 'src/app/services/world-structures';

@Component({
  selector: 'app-door-editor-dialog',
  templateUrl: './door-editor-dialog.component.html',
  styleUrls: ['./door-editor-dialog.component.css']
})
export class DoorEditorDialogComponent implements OnInit {

  public currentMap: PokeMap;
  public doorsets: PokeDoor[] = []; // all
  public mapDoorsets: PokeDoor[] = []; // map-specific (correct palettes)

  public currentDoorset: PokeDoor;
  public currentAnimation: BitmapAnimation;

  private intervalRef: any;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, 
    public romService: RomService, public worldService: WorldService, public bitmapService: BitmapService,
    private zone: NgZone, public viewportService: ViewportService) { 
    this.currentMap = data.currentMap;

  }

  ngOnInit(): void {
    this.doorsets = this.worldService.getAllDoorsets(this.currentMap.layout.primaryTileset.palettes);
    for (let i = 0; i < 861; i++) {
      let block: MapBlock = this.currentMap.blockset.getBlock(i, this.romService, this.bitmapService);

      if (block.behaviorId == 0x69) {
        for (let j = 0; j < this.doorsets.length; j++) {
          if (this.doorsets[j].blockId == i) {
            this.mapDoorsets.push(this.doorsets[j]);
            break;
          }
        }
      }
    }

    if (this.mapDoorsets.length > 0)
      this.setCurrent(this.mapDoorsets[0]);
  }

  public setCurrent(doorset: PokeDoor) {
    this.currentDoorset = doorset;
    this.currentAnimation = new BitmapAnimation(this.currentDoorset.blocks, this.currentDoorset.blocks[0], 225, true, false);
    this.stopAnimation();
    this.playAnimation();
  }

  public close() {
    this.dialog.closeAll();
  }

  public getPaddedId(id: number) {
    let result = id.toString();
    while (result.length < 3) {
      result = "0" + result;
    }
    return result;
  }

  public playAnimation() {
    this.currentAnimation.start(this.zone);
    this.intervalRef = setInterval(() => {
      this.currentAnimation.doAnimation();
    }, 250);
  }

  public stopAnimation() {
    this.currentAnimation.stop();
    if (this.intervalRef)
      clearInterval(this.intervalRef);
  }
}

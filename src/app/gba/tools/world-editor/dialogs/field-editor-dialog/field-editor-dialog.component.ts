import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BitmapAnimation, BitmapService } from 'src/app/gba/services/bitmap.service';
import { GbaService } from 'src/app/gba/services/gba.service';
import { WorldService } from 'src/app/gba/services/world.service';
import { MapFieldOverlay, PokeMap } from 'src/app/gba/services/world-structures';

@Component({
  selector: 'app-field-editor-dialog',
  templateUrl: './field-editor-dialog.component.html',
  styleUrls: ['./field-editor-dialog.component.css']
})
export class FieldEditorDialogComponent implements OnInit {

  public currentMap: PokeMap;
  public currentOverlay: MapFieldOverlay;

  public currentAnimationIndex: number = 0;
  public currentAnimation: BitmapAnimation;
  private intervalRef: any;

  public isShowingGrid: boolean = false;
  public zoom: number = 2.0;

  public isLooping: boolean = false;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private zone: NgZone,
    public gbaService: GbaService, public worldService: WorldService, public bitmapService: BitmapService) { 
    
    this.currentMap = data.currentMap;
  }

  ngOnInit(): void {
    this.setCurrent(this.worldService.overlays[0]);
  }

  public setCurrent(overlay: MapFieldOverlay) {
    this.currentAnimationIndex = 0;
    this.currentOverlay = overlay;
    this.setCurrentAnimation();
  }

  public setCurrentAnimation() {
    this.stopAnimation();
    this.currentAnimation = this.currentOverlay.animations[this.currentAnimationIndex];
    this.playAnimation();
  }

  public close() {
    this.dialog.closeAll();
  }

  public floorValue(value) {
    return Math.floor(value);
  }

  public getPaddedId(id: number) {
    let result = id.toString();
    while (result.length < 3) {
      result = "0" + result;
    }
    return result;
  }

  public playAnimation() {
    if (this.currentAnimation) {
      this.currentAnimation.isLooping = this.isLooping;
      this.currentAnimation.start(this.zone);
      if (this.intervalRef)
        clearInterval(this.intervalRef);
      this.intervalRef = setInterval(() => {
        this.currentAnimation.doAnimation();
      }, 200);
    }

  }

  public stopAnimation() {
    if (this.currentAnimation) {
      this.currentAnimation.stop();
      if (this.intervalRef)
        clearInterval(this.intervalRef);
    }
  }

  public toggleLooping() {
    this.isLooping = !this.isLooping;

    if (this.currentAnimation.isAnimating) {
      this.stopAnimation();
      this.playAnimation();
    }
  }
}

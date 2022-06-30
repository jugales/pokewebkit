import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BattlefieldService, PokeBattlefield } from 'src/app/gba/services/battlefield/battlefield.service';
import { PokeMap } from 'src/app/gba/structures/world-structures';
import { BlockEditorDialogComponent } from '../../dialogs/block-editor-dialog/block-editor-dialog.component';
import { DoorEditorDialogComponent } from '../../dialogs/door-editor-dialog/door-editor-dialog.component';

const MAX_ZOOM_LEVEL = 3;

@Component({
  selector: 'app-map-card',
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.css']
})
export class MapCardComponent implements OnInit, OnChanges {

  @Input() public map: PokeMap;

  @Input() public isShowingAnimations: boolean = false;
  @Output() public animationsUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() public isShowingOverworlds: boolean = false;
  @Output() public overworldsUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() public zoom: number = 2;
  @Output() public zoomUpdated: EventEmitter<number> = new EventEmitter<number>();

  public battlefield: PokeBattlefield;

  constructor(private battlefieldService: BattlefieldService, private dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.map)
      this.onChangeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.map) {
      this.onChangeMap();
    }
  }

  public updateAnimationsEnabled(newValue?: boolean) {
    if (newValue !== undefined)
      this.isShowingAnimations = newValue;
    this.animationsUpdated.emit(this.isShowingAnimations);
  }

  public updateOverworldsEnabled(newValue?: boolean) {
    if (newValue !== undefined)
      this.isShowingOverworlds = newValue;
    this.overworldsUpdated.emit(this.isShowingOverworlds);
  }

  public updateZoom(newValue?: number) {
    if (newValue !== undefined)
      this.zoom = newValue;
    this.zoomUpdated.emit(this.zoom);
  }

  public getNextZoomLevel(): number {
    if (this.zoom + 1 > MAX_ZOOM_LEVEL)
      return 1;
    else
      return this.zoom + 1;
  }

  public editBlocks() {
    this.dialog.open(BlockEditorDialogComponent, { data: { currentMap: this.map } });
  }

  public editDoors() {
    this.dialog.open(DoorEditorDialogComponent, { data: { currentMap: this.map } });
  }

  public onChangeMap() {
    this.battlefield = this.battlefieldService.loadBattlefield(this.map.header.battlefieldType);
  }

}

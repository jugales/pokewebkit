import { Component } from '@angular/core';
import { BattlefieldService, PokeBattlefield } from 'src/app/gba/services/battlefield.service';
import { PendingChange, RomService } from 'src/app/gba/services/rom.service';

@Component({
  selector: 'app-battlefield-editor',
  templateUrl: './battlefield-editor.component.html',
  styleUrls: ['./battlefield-editor.component.css']
})
export class BattlefieldEditorComponent {

  public zoom: number = 2;
  public isShowingEntryOverlay: boolean = true;

  public currentBattlefield: PokeBattlefield;

  constructor(private romService: RomService, public battlefieldService: BattlefieldService) { 
    if (this.romService.isLoaded()) 
    this.loadBattlefields();

    this.romService.romLoaded.subscribe(() => {
      this.loadBattlefields();
    });
  }

  private async loadBattlefields() {
    if (!this.currentBattlefield)
      this.setCurrent(0);
  }

  public setCurrent(index: number, battlefield?: PokeBattlefield) {
    if (battlefield) 
      this.currentBattlefield = battlefield
    else
      this.currentBattlefield = this.battlefieldService.loadBattlefield(index);
  }

  public battlefieldChanged() {
    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentBattlefield.address + '-changed';
    pendingChange.changeReason = this.currentBattlefield.name + ' Battlefield Data Changed';
    pendingChange.address = this.currentBattlefield.address;
    pendingChange.bytesBefore = this.currentBattlefield.data;

    let writeBuffer = new ArrayBuffer(20);
    let writeView = new DataView(writeBuffer);
    writeView.setUint32(0, this.romService.toPointer(this.currentBattlefield.backgroundAddress), true);
    writeView.setUint32(4, this.romService.toPointer(this.currentBattlefield.backgroundTileAddress), true);
    writeView.setUint32(8, this.romService.toPointer(this.currentBattlefield.entryImageAddress), true);
    writeView.setUint32(12, this.romService.toPointer(this.currentBattlefield.entryImageTileAddress), true);
    writeView.setUint32(16, this.romService.toPointer(this.currentBattlefield.paletteAddress), true);

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.romService.queueChange(pendingChange);
  }

  public getPaddedId(id: number) {
    let result = id.toString();
    while (result.length < 3) {
      result = "0" + result;
    }
    return result;
  }

  public getInputHexValue(event: any) {
    let hexString: string = event.target.value;
    let hexTest = /[0-9A-Fa-f]{6}/g;
    let result: number = 0;

    if (hexTest.test(hexString)) 
      result = Number.parseInt(hexString, 16);

    return result;
  }

  public changeZoom() {
    if (this.zoom < 3)
      this.zoom++;
    else
      this.zoom = 1;
  }
}

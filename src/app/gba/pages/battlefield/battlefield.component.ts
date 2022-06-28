import { Component } from '@angular/core';
import { BattlefieldService, PokeBattlefield } from 'src/app/gba/services/battlefield/battlefield.service';
import { PendingChange, GbaService } from 'src/app/gba/services/gba.service';

@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: ['./battlefield.component.css']
})
export class BattlefieldComponent {

  public zoom: number = 2;
  public isShowingEntryOverlay: boolean = true;

  public currentBattlefield: PokeBattlefield;

  constructor(private gbaService: GbaService, public battlefieldService: BattlefieldService) { 
    if (this.gbaService.isLoaded()) 
    this.loadBattlefields();

    this.gbaService.romLoaded.subscribe(() => {
      this.loadBattlefields();
    });
  }

  private async loadBattlefields() {
    if (!this.currentBattlefield)
      this.setCurrent(0);
  }

  public setCurrent(index: number, battlefield?: PokeBattlefield) {
    console.log(index);
    console.log(battlefield)
    if (battlefield) 
      this.currentBattlefield = battlefield
    else
      this.currentBattlefield = this.battlefieldService.loadBattlefield(index);
  }

  public updateBattlefield(battlefield?: PokeBattlefield) {
    this.setCurrent(battlefield.index, battlefield);
    this.battlefieldChanged();
  }


  public battlefieldChanged() {
    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentBattlefield.address + '-changed';
    pendingChange.changeReason = this.currentBattlefield.name + ' Battlefield Data Changed';
    pendingChange.address = this.currentBattlefield.address;
    pendingChange.bytesBefore = this.currentBattlefield.data;

    let writeBuffer = new ArrayBuffer(20);
    let writeView = new DataView(writeBuffer);
    writeView.setUint32(0, this.gbaService.toPointer(this.currentBattlefield.backgroundAddress), true);
    writeView.setUint32(4, this.gbaService.toPointer(this.currentBattlefield.backgroundTileAddress), true);
    writeView.setUint32(8, this.gbaService.toPointer(this.currentBattlefield.entryImageAddress), true);
    writeView.setUint32(12, this.gbaService.toPointer(this.currentBattlefield.entryImageTileAddress), true);
    writeView.setUint32(16, this.gbaService.toPointer(this.currentBattlefield.paletteAddress), true);

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.gbaService.queueChange(pendingChange);
  }

  public getPaddedId(id: number) {
    let result = id.toString();
    while (result.length < 3) {
      result = "0" + result;
    }
    return result;
  }

  public changeZoom() {
    if (this.zoom < 3)
      this.zoom++;
    else
      this.zoom = 1;
  }
}

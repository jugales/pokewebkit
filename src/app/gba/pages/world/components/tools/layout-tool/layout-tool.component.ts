import { Component, Input, OnInit } from '@angular/core';
import { GbaService, PendingChange } from 'src/app/gba/services/gba.service';
import { PokeMap } from 'src/app/gba/structures/world-structures';

@Component({
  selector: 'app-layout-tool',
  templateUrl: './layout-tool.component.html',
  styleUrls: ['./layout-tool.component.css']
})
export class LayoutToolComponent implements OnInit {

  @Input() public currentMap: PokeMap;

  constructor(private gbaService: GbaService) { }

  ngOnInit(): void {
  }

  public metadataChanged() {
    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentMap.header.address + '-changed';
    pendingChange.changeReason = this.currentMap.label + ' Header Changed';
    pendingChange.address = this.currentMap.header.address;
    pendingChange.bytesBefore = this.currentMap.header.data;

    let writeBuffer = new ArrayBuffer(28);
    let writeView = new DataView(writeBuffer);

    // write bytes in little endian
    writeView.setUint32(0, this.gbaService.toPointer(this.currentMap.header.mapDataAddress), true);
    writeView.setUint32(4, this.gbaService.toPointer(this.currentMap.header.eventDataAddress), true);
    writeView.setUint32(8, this.gbaService.toPointer(this.currentMap.header.mapScriptsAddress), true);
    writeView.setUint32(12, this.gbaService.toPointer(this.currentMap.header.connectionsAddress), true);
    writeView.setUint16(16, this.currentMap.header.musicId, true);
    writeView.setUint16(18, this.currentMap.header.mapIndex, true);
    writeView.setUint8(20, this.currentMap.header.labelIndex);
    writeView.setUint8(21, this.currentMap.header.visibilityType);
    writeView.setUint8(22, this.currentMap.header.weatherType);
    writeView.setUint8(23, this.currentMap.header.mapType);
    writeView.setUint8(24, pendingChange.bytesBefore[24]); // unknown
    writeView.setUint8(25, pendingChange.bytesBefore[25]); // unknown
    writeView.setUint8(26, this.currentMap.header.shouldShowLabelOnEntry);
    writeView.setUint8(27, this.currentMap.header.battlefieldType);

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.gbaService.queueChange(pendingChange);
  }

}

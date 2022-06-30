import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { GbaService, PendingChange } from 'src/app/gba/services/gba.service';
import { MonsterService } from 'src/app/gba/services/monster/monster.service';
import { PokeMap, WildMonsterData } from 'src/app/gba/structures/world-structures';

@Component({
  selector: 'app-encounter-minitool',
  templateUrl: './encounter-minitool.component.html',
  styleUrls: ['./encounter-minitool.component.css']
})
export class EncounterMinitoolComponent implements OnInit, OnChanges {

  @Input() public currentMap: PokeMap;
  @Input() public currentEncounterType: string = 'GRASS';

  constructor(private gbaService: GbaService, public monsterService: MonsterService) { }

  ngOnInit(): void {
    if (this.currentMap)
      this.onMapChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.currentMap)
      this.onMapChange();
  }

  public encounterChanged(monster: WildMonsterData) {
    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = monster.address + '-changed';
    pendingChange.changeReason = this.currentMap.label + ' Encounter Data Changed';
    pendingChange.address = monster.address;
    pendingChange.bytesBefore = monster.monsterData;

    let writeBuffer = new ArrayBuffer(4);
    let writeView = new DataView(writeBuffer);

    // write bytes in little endian
    writeView.setUint8(0, monster.minLevel);
    writeView.setUint8(1, monster.maxLevel);
    writeView.setUint16(2, monster.monsterId, true);

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.gbaService.queueChange(pendingChange);
  }

  public onMapChange(): void {
    this.updateEncounterSprites();
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

}

import { Byte } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { ItemService } from 'src/app/gba/services/item/item.service';
import { Monster, MonsterService } from 'src/app/gba/services/monster/monster.service';
import { PendingChange, GbaService } from 'src/app/gba/services/gba.service';

@Component({
  selector: 'app-monster',
  templateUrl: './monster.component.html',
  styleUrls: ['./monster.component.css']
})
export class MonsterComponent implements OnInit {

  public currentMonster: Monster = new Monster();
  public frontShinySprite: any;

  constructor(public monsterService: MonsterService, public itemService: ItemService, 
    public gbaService: GbaService) { 
    if (this.gbaService.isLoaded()) 
      this.loadMonsters();
    
    this.gbaService.romLoaded.subscribe(() => {
      this.loadMonsters();
    });
  }

  private async loadMonsters() {
    // due to lazy load of services, item data may not be loaded yet. Load it if not
    if (!this.itemService.items || this.itemService.items.length == 0)
      this.itemService.loadItems();
    this.monsterService.loadMonsters();
    this.monsterService.isLoaded = true;

    if (!this.currentMonster.name)
      this.setCurrent(this.monsterService.monsters[0]);
  }

  ngOnInit(): void {
    
  }

  public setCurrent(monster: Monster) {
    this.frontShinySprite = this.monsterService.loadBattleSprite(monster.uid, true, true);
    this.currentMonster = monster;
  }

  public updateMonster(monster: Monster): void {
    this.setCurrent(monster);
    this.baseStatsChanged();
  }

  public baseStatsChanged() {
    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentMonster.baseStats.address + '-changed';
    pendingChange.changeReason = this.currentMonster.name + ' Base Stats Data Changed';
    pendingChange.address = this.currentMonster.baseStats.address;
    pendingChange.bytesBefore = this.currentMonster.baseStats.data;

    let writeBuffer = new ArrayBuffer(28);
    let writeView = new DataView(writeBuffer);

    // write bytes in little endian
    writeView.setUint8(0, this.currentMonster.baseStats.baseHP);
    writeView.setUint8(1, this.currentMonster.baseStats.baseAttack);
    writeView.setUint8(2, this.currentMonster.baseStats.baseDefense);
    writeView.setUint8(3, this.currentMonster.baseStats.baseSpeed);
    writeView.setUint8(4, this.currentMonster.baseStats.baseSpAttack);
    writeView.setUint8(5, this.currentMonster.baseStats.baseSpDefense);
    writeView.setUint8(6, this.currentMonster.baseStats.type1);
    writeView.setUint8(7, this.currentMonster.baseStats.type2);
    writeView.setUint8(8, this.currentMonster.baseStats.catchRate);
    writeView.setUint8(9, this.currentMonster.baseStats.baseExpYield);
    writeView.setInt16(10, this.getCurrentMonsterEV(), true);
    writeView.setInt16(12, this.currentMonster.baseStats.item1, true);
    writeView.setInt16(14, this.currentMonster.baseStats.item2, true);
    writeView.setUint8(16, this.currentMonster.baseStats.gender);
    writeView.setUint8(17, this.currentMonster.baseStats.eggCycles);
    writeView.setUint8(18, this.currentMonster.baseStats.baseFriendship);
    writeView.setUint8(19, this.currentMonster.baseStats.levelUpType);
    writeView.setUint8(20, this.currentMonster.baseStats.eggGroup1);
    writeView.setUint8(21, this.currentMonster.baseStats.eggGroup2);
    writeView.setUint8(22, this.currentMonster.baseStats.ability1);
    writeView.setUint8(23, this.currentMonster.baseStats.ability2);
    writeView.setUint8(24, this.currentMonster.baseStats.safariZoneRate);
    writeView.setUint8(25, this.currentMonster.baseStats.colorAndFlip);

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

  private getCurrentMonsterEV() {
    let evBinaryString = '0000';
    evBinaryString += this.gbaService.toBitString(this.currentMonster.baseStats.spDefenseYield, 2);
    evBinaryString += this.gbaService.toBitString(this.currentMonster.baseStats.spAttackYield, 2);
    evBinaryString += this.gbaService.toBitString(this.currentMonster.baseStats.speedYield, 2);
    evBinaryString += this.gbaService.toBitString(this.currentMonster.baseStats.defenseYield, 2);
    evBinaryString += this.gbaService.toBitString(this.currentMonster.baseStats.attackYield, 2);
    evBinaryString += this.gbaService.toBitString(this.currentMonster.baseStats.hpYield, 2);
    
    let result = Number.parseInt(evBinaryString, 2);
    return result;
  }
}

import { Component, OnInit } from '@angular/core';
import { CharacterSetService } from 'src/app/gba/services/character-set.service';
import { ItemService } from 'src/app/gba/services/item.service';
import { MonsterService } from 'src/app/gba/services/monster.service';
import { PendingChange, RomService } from 'src/app/gba/services/rom.service';
import { PokeTrainer, TrainerService } from 'src/app/gba/services/trainer.service';

@Component({
  selector: 'app-trainer-editor',
  templateUrl: './trainer-editor.component.html',
  styleUrls: ['./trainer-editor.component.css']
})
export class TrainerEditorComponent implements OnInit {

  public trainerSpriteCount: number = 93;

  public currentTrainer: PokeTrainer;
  public currentPartySprites: any[] = new Array(6);
  public currentPartyOriginalAddress: number = 0;
  public sprite;

  public selectedPartyMonsterId: number = 0;
  public selectedPartyMonster: any;

  constructor(public romService: RomService, public trainerService: TrainerService,
    public itemService: ItemService, public monsterService: MonsterService,
    private characterSetService: CharacterSetService) { }

  ngOnInit(): void {
    if (this.romService.isLoaded()) {
      this.loadTrainers();
    }

    this.romService.romLoaded.subscribe(() => {
      this.loadTrainers();
    });

    this.trainerService.trainerIndexChanged.subscribe((newTrainerIndex: number) => {
      this.setCurrent(this.trainerService.trainers[newTrainerIndex]);
    });
  }

  private async loadTrainers() {
    this.trainerSpriteCount = this.romService.constants().TRAINER_SPRITE_COUNT;

    // due to lazy load of services, data may not be loaded yet. Load it if not
    if (!this.itemService.items || this.itemService.items.length == 0)
      this.itemService.loadItems();
    if (!this.monsterService.monsters || this.monsterService.monsters.length == 0)
      this.monsterService.loadMonsters();

    this.trainerService.loadTrainers();
    this.trainerService.isLoaded = true;

    if (!this.currentTrainer)
      this.setCurrent(this.trainerService.trainers[this.trainerService.cachedTrainerIndex]);
  }

  public setCurrent(trainer?: PokeTrainer) {
    if (trainer)
      this.currentTrainer = trainer;
    this.updateTrainerSprite();
    this.updatePartySprites();
    this.currentPartyOriginalAddress = this.currentTrainer.partyAddress;
    if (this.currentTrainer.party && this.currentTrainer.party.length > 0)
      this.setCurrentPartyMonster(0);
  }

  public updateTrainerSprite() {
    this.sprite = this.trainerService.loadSprite(this.currentTrainer.spriteId);
  }

  public updatePartySprites() {
    this.currentPartySprites = [];
    for (let i = 0; i < this.currentTrainer.partyCount; i++) 
      this.currentPartySprites[i] = this.monsterService.loadBattleSprite(this.currentTrainer.party[i].species, true, false);
  }

  public setCurrentPartyMonster(monsterId: any) {
    this.selectedPartyMonsterId = monsterId;
    this.selectedPartyMonster = this.currentTrainer.party[monsterId];
  }

  public trainerChanged() {
    this.updateTrainerSprite();

    // update party count
    this.currentTrainer.partyCount = this.getCurrentPartySize();

    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentTrainer.address + '-changed';
    pendingChange.changeReason = this.currentTrainer.name + ' Trainer Data Changed';
    pendingChange.address = this.currentTrainer.address;
    pendingChange.bytesBefore = this.currentTrainer.data;

    let writeBuffer = new ArrayBuffer(40);
    let writeView = new DataView(writeBuffer);

    writeView.setUint8(0, (this.currentTrainer.hasCustomMoves ? 1 : 0) + (this.currentTrainer.hasHeldItems ? 2 : 0));
    writeView.setUint8(1, this.currentTrainer.trainerClass);
    writeView.setUint8(2, (this.currentTrainer.genderId << 7) + this.currentTrainer.musicId);
    writeView.setUint8(3, this.currentTrainer.spriteId);
    let trainerNameValues: number[] = this.characterSetService.toBytes(this.currentTrainer.name);
    for (let i = 0; i < trainerNameValues.length; i++)
      writeView.setUint8(4 + i, trainerNameValues[i]);
    writeView.setUint8(4 + trainerNameValues.length, 0xFF);
    for (let i = 0; i < 4; i++) 
      writeView.setUint16(16 + (i * 2), this.currentTrainer.items[i], true);
    writeView.setUint8(24, this.currentTrainer.isDoubleBattle ? 1 : 0);
    writeView.setUint8(25, pendingChange.bytesBefore[25]); // unknown
    writeView.setUint8(26, pendingChange.bytesBefore[26]); // unknown
    writeView.setUint8(27, pendingChange.bytesBefore[27]); // unknown
    writeView.setUint32(28, this.currentTrainer.ai, true);
    writeView.setUint8(32, this.currentTrainer.partyCount);
    writeView.setUint8(33, pendingChange.bytesBefore[33]); // unknown
    writeView.setUint8(34, pendingChange.bytesBefore[34]); // unknown
    writeView.setUint8(35, pendingChange.bytesBefore[35]); // unknown
    writeView.setUint32(36, this.romService.toPointer(this.currentTrainer.partyAddress), true);

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.romService.queueChange(pendingChange);
  }

  public currentPartyMonsterChanged() {
    this.updatePartySprites();

    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentTrainer.uid + '-trainer-changed';
    pendingChange.changeReason = this.currentTrainer.name + ' (ID: ' + this.currentTrainer.uid +  ') Trainer Party Data Changed';
    pendingChange.address = this.currentPartyOriginalAddress;
    pendingChange.bytesBefore = this.currentTrainer.partyData;

    let dataSize = this.currentTrainer.hasCustomMoves ? 16 : 8;
    let partySize = this.getCurrentPartySize();
    let writeBuffer = new ArrayBuffer(dataSize * partySize);
    let writeView = new DataView(writeBuffer);

    for (let i = 0; i < partySize; i++) {
      let position = i * dataSize;

      writeView.setUint16(position, this.currentTrainer.party[i].evs, true);
      writeView.setUint16(position + 2, this.currentTrainer.party[i].level, true);
      writeView.setUint16(position + 4, this.currentTrainer.party[i].species, true);
      if (this.currentTrainer.hasHeldItems)
        writeView.setUint16(position + 6, this.currentTrainer.party[i].heldItem, true);
      else
        writeView.setUint16(position + 6, 0, true);
      
      if (this.currentTrainer.hasCustomMoves) {
        for (let j = 0; j < this.currentTrainer.party[i].customMoves.length; j++) {
          writeView.setUint16(position + 8 + (j * 2), this.currentTrainer.party[i].customMoves[j], true);
        }
      }
    }

    let shouldRepoint: boolean = writeBuffer.byteLength > pendingChange.bytesBefore.length;
    if (shouldRepoint) {
      pendingChange.repointAddress = this.romService.findFreeSpaceAddresses(writeView.byteLength, 1)[0];
      pendingChange.repointAt = [this.currentTrainer.address + 36];

      this.currentTrainer.partyAddress = pendingChange.repointAddress;
    }

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.romService.queueChange(pendingChange);

    this.trainerChanged();
  }

  private getCurrentPartySize() {
    let partyCount = 0;
    for (let i = 0; i < this.currentTrainer.party.length; i++) {
      if (this.currentTrainer.party[i].species > 0 && this.currentTrainer.party[i].level > 0)
        partyCount++;
    }
    return partyCount;
  }

  public getPaddedId(id: number) {
    let result = id.toString();
    while (result.length < 3) {
      result = "0" + result;
    }
    return result;
  }

}

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CharacterSetService } from 'src/app/gba/services/character-set.service';
import { GbaService, PendingChange } from 'src/app/gba/services/gba.service';
import { ItemService, PokeItem } from 'src/app/gba/services/item/item.service';
import { MonsterService } from 'src/app/gba/services/monster/monster.service';
import { PokeTrainer } from 'src/app/gba/services/world/trainer.service';

@Component({
  selector: 'app-trainer-party-tool',
  templateUrl: './party-tool.component.html',
  styleUrls: ['./party-tool.component.css']
})
export class PartyToolComponent implements OnInit, OnChanges {

  @Input()
  public trainer: PokeTrainer;

  @Output()
  public trainerUpdated: EventEmitter<PokeTrainer> = new EventEmitter<PokeTrainer>();

  public currentPartySprites: any[] = new Array(6);
  public currentPartyOriginalAddress: number = 0;
  public selectedPartyMonsterId: number = 0;
  public selectedPartyMonster: any;

  constructor(private gbaService: GbaService, public monsterService: MonsterService, 
    public itemService: ItemService) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.trainer) {
      this.trainer.partyCount = this.getCurrentPartySize();
      this.updatePartySprites();
      this.currentPartyOriginalAddress = this.trainer.partyAddress;
      if (this.trainer.party && this.trainer.party.length > 0)
        this.setCurrentPartyMonster(0);
    }
  }

  public trainerChanged(): void {
    this.trainerUpdated.emit(this.trainer);
  }

  public updatePartySprites() {
    this.currentPartySprites = [];
    for (let i = 0; i < this.trainer.partyCount; i++) 
      this.currentPartySprites[i] = this.monsterService.loadBattleSprite(this.trainer.party[i].species, true, false);
  }

  public setCurrentPartyMonster(monsterId: any) {
    this.selectedPartyMonsterId = monsterId;
    this.selectedPartyMonster = this.trainer.party[monsterId];
  }

  public currentPartyMonsterChanged() {
    this.updatePartySprites();

    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.trainer.uid + '-trainer-changed';
    pendingChange.changeReason = this.trainer.name + ' (ID: ' + this.trainer.uid +  ') Trainer Party Data Changed';
    pendingChange.address = this.currentPartyOriginalAddress;
    pendingChange.bytesBefore = this.trainer.partyData;

    let dataSize = this.trainer.hasCustomMoves ? 16 : 8;
    let partySize = this.getCurrentPartySize();
    let writeBuffer = new ArrayBuffer(dataSize * partySize);
    let writeView = new DataView(writeBuffer);

    for (let i = 0; i < partySize; i++) {
      let position = i * dataSize;

      writeView.setUint16(position, this.trainer.party[i].evs, true);
      writeView.setUint16(position + 2, this.trainer.party[i].level, true);
      writeView.setUint16(position + 4, this.trainer.party[i].species, true);
      if (this.trainer.hasHeldItems)
        writeView.setUint16(position + 6, this.trainer.party[i].heldItem, true);
      else
        writeView.setUint16(position + 6, 0, true);
      
      if (this.trainer.hasCustomMoves) {
        for (let j = 0; j < this.trainer.party[i].customMoves.length; j++) {
          writeView.setUint16(position + 8 + (j * 2), this.trainer.party[i].customMoves[j], true);
        }
      }
    }

    let shouldRepoint: boolean = writeBuffer.byteLength > pendingChange.bytesBefore.length;
    if (shouldRepoint) {
      pendingChange.repointAddress = this.gbaService.findFreeSpaceAddresses(writeView.byteLength, 1)[0];
      pendingChange.repointAt = [this.trainer.address + 36];

      this.trainer.partyAddress = pendingChange.repointAddress;
    }

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.gbaService.queueChange(pendingChange);

    this.trainerChanged();
  }

  private getCurrentPartySize() {
    let partyCount = 0;
    for (let i = 0; i < this.trainer.party.length; i++) {
      if (this.trainer.party[i].species > 0 && this.trainer.party[i].level > 0)
        partyCount++;
    }
    return partyCount;
  }

}

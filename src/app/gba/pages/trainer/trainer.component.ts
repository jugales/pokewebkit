import { Component, OnInit } from '@angular/core';
import { CharacterSetService } from '../../services/character-set.service';
import { GbaService, PendingChange } from '../../services/gba.service';
import { ItemService } from '../../services/item/item.service';
import { MonsterService } from '../../services/monster/monster.service';
import { PokeTrainer, TrainerService } from '../../services/world/trainer.service';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.css']
})
export class TrainerComponent implements OnInit {

  public trainerSpriteCount: number = 93;

  public currentTrainer: PokeTrainer;
  public sprite;

  constructor(public gbaService: GbaService, public trainerService: TrainerService,
    public itemService: ItemService, public monsterService: MonsterService,
    private characterSetService: CharacterSetService) { }

  ngOnInit(): void {
    if (this.gbaService.isLoaded()) {
      this.loadTrainers();
    }

    this.gbaService.romLoaded.subscribe(() => {
      this.loadTrainers();
    });

    this.trainerService.trainerIndexChanged.subscribe((newTrainerIndex: number) => {
      this.setCurrent(this.trainerService.trainers[newTrainerIndex]);
    });
  }

  private async loadTrainers() {
    this.trainerSpriteCount = this.gbaService.constants().TRAINER_SPRITE_COUNT;

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
  }

  public updateTrainerSprite() {
    this.sprite = this.trainerService.loadSprite(this.currentTrainer.spriteId, true);
  }

  public updateTrainer(trainer: PokeTrainer) {
    this.currentTrainer = trainer;
    this.trainerChanged(); 
  }

  public trainerChanged() {
    this.updateTrainerSprite();

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
    writeView.setUint32(36, this.gbaService.toPointer(this.currentTrainer.partyAddress), true);

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


}

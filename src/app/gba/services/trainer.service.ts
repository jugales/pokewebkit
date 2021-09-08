import { Injectable, EventEmitter } from '@angular/core';
import { BitmapPalette, BitmapPixelData, BitmapPixelDepth, BitmapService } from './bitmap.service';
import { RomService } from './rom.service';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {

  public trainers: PokeTrainer[] = [];
  public classNames: string[] = [];
  public isLoaded: boolean = false;

  public cachedTrainerIndex: number = 0;
  public trainerIndexChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(private romService: RomService, private bitmapService: BitmapService) { 
    this.trainerIndexChanged.subscribe((newTrainerIndex: number) => {
      this.cachedTrainerIndex = newTrainerIndex;
    })
  }

  public loadTrainers() {
    this.loadTrainerClassNames();
    this.romService.goTo(this.romService.constants().TRAINER_DATA_ADDRESS);

    for (let i = 0; i < this.romService.constants().TRAINER_COUNT; i++) {
      this.loadTrainer(i);
    }
    this.isLoaded = true;
    this.romService.markToolLoaded();
  }

  private loadTrainerClassNames() {
    this.romService.goTo(this.romService.constants().TRAINER_CLASS_NAMES);
    let trainerClassTableAddress = this.romService.getPointer();
    this.romService.goTo(trainerClassTableAddress);
    this.classNames = this.romService.getGameStringAutoList(this.romService.constants().TRAINER_CLASS_COUNT);
  }

  private loadTrainer(uid: number) {
    let trainer: PokeTrainer = new PokeTrainer();
    trainer.uid = uid;
    trainer.address = this.romService.position;
    
    this.romService.goTo(trainer.address);
    trainer.data = this.romService.getBytes(40);
    this.romService.goTo(trainer.address);

    trainer.flags = this.romService.getByte();
    trainer.hasCustomMoves = (trainer.flags & 1) == 1;
    trainer.hasHeldItems = (trainer.flags & 2) == 2;
    trainer.trainerClass = this.romService.getByte();
    trainer.genderMusic = this.romService.getByte();
    trainer.genderId = ((trainer.genderMusic & 128) >> 7);
    trainer.musicId = (trainer.genderMusic & 127);
    trainer.spriteId = this.romService.getByte();
    trainer.name = this.romService.getGameString(12);
    trainer.items = [];
    for (let i = 0; i < 4; i++) 
      trainer.items.push(this.romService.getShort());
    
    trainer.isDoubleBattle = this.romService.getByte() == 1;
    this.romService.skip(3);
    trainer.ai = this.romService.getInt();
    trainer.partyCount = this.romService.getByte();
    this.romService.skip(3);
    trainer.partyAddress = this.romService.getPointer();
    let revertPosition = this.romService.position;

    let partySlotSize = trainer.hasCustomMoves ? 16 : 8;
    this.romService.goTo(trainer.partyAddress);
    trainer.partyData = this.romService.getBytes(partySlotSize * trainer.partyCount);
    
    this.romService.goTo(trainer.partyAddress);
    for (let i = 0; i < 6; i++) {
      let partyMonster: PokeTrainerMonster = new PokeTrainerMonster();
      if (i < trainer.partyCount) {
        partyMonster.uid = i;
        partyMonster.evs = this.romService.getShort();
        partyMonster.level = this.romService.getShort();
        partyMonster.species = this.romService.getShort();

        if (trainer.hasHeldItems) 
          partyMonster.heldItem = this.romService.getShort();
        else 
          this.romService.skip(2);
        
          
        if (trainer.hasCustomMoves) {
          partyMonster.customMoves = [];
          for (let i = 0; i < 4; i++) 
            partyMonster.customMoves.push(this.romService.getShort());
        }
      } else {
        partyMonster.uid = i;
        partyMonster.evs = 0;
        partyMonster.level = 0;
        partyMonster.species = 0;
      }

      trainer.party.push(partyMonster);
    }
    this.romService.goTo(revertPosition);

    this.trainers.push(trainer);
  }

  public loadSprite(trainerId: number) {
    let pixelStart = 0;
    let paletteStart = 0;

    this.romService.goTo(this.romService.constants().TRAINER_BITMAPS_ADDRESS + (trainerId * 8));
    pixelStart = this.romService.getPointer();

    this.romService.goTo(this.romService.constants().TRAINER_PALETTES_ADDRESS + (trainerId * 8));
    paletteStart = this.romService.getPointer();

    let pixelObj: BitmapPixelData = new BitmapPixelData(pixelStart, BitmapPixelDepth.BPP_4, undefined, this.bitmapService, this.romService);
    let paletteObj: BitmapPalette = new BitmapPalette(paletteStart, 16, undefined, undefined, this.bitmapService, this.romService);

    return this.bitmapService.createBitmap(pixelObj, paletteObj, 64, 64);
  }
}
export class PokeTrainer {

  constructor(
    public address?: number,
    public data: number[] = [],
    public uid?: number,
    public flags?: number,
    public trainerClass?: number,
    public genderMusic?: number,
    public spriteId?: number,
    public name?: string,
    public items?: number[],
    public isDoubleBattle: boolean = false,
    public ai?: number,
    public partyCount?: number,
    public partyAddress?: number,
    public partyData: number[] = [],

    public party: PokeTrainerMonster[] = [],
    public hasCustomMoves: boolean = false,
    public hasHeldItems: boolean = false,
    public genderId: number = 0,
    public musicId: number = 0
  ) { }
}
export class PokeTrainerMonster {

  constructor(
    public uid?: number,
    public evs?: number,
    public level?: number,
    public species?: number,
    public heldItem?: number,

    public customMoves: number[] = [0, 0, 0, 0]
  ) { }
}

import { Injectable, EventEmitter } from '@angular/core';
import { BitmapPalette, BitmapPixelData, BitmapPixelDepth, BitmapService } from './bitmap.service';
import { GbaService } from './gba.service';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {

  public trainers: PokeTrainer[] = [];
  public classNames: string[] = [];
  public isLoaded: boolean = false;

  public cachedTrainerIndex: number = 0;
  public trainerIndexChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(private gbaService: GbaService, private bitmapService: BitmapService) { 
    this.trainerIndexChanged.subscribe((newTrainerIndex: number) => {
      this.cachedTrainerIndex = newTrainerIndex;
    })
  }

  public loadTrainers() {
    this.loadTrainerClassNames();
    this.gbaService.goTo(this.gbaService.constants().TRAINER_DATA_ADDRESS);

    for (let i = 0; i < this.gbaService.constants().TRAINER_COUNT; i++) {
      this.loadTrainer(i);
    }
    this.isLoaded = true;
    this.gbaService.markToolLoaded();
  }

  private loadTrainerClassNames() {
    this.gbaService.goTo(this.gbaService.constants().TRAINER_CLASS_NAMES);
    let trainerClassTableAddress = this.gbaService.getPointer();
    this.gbaService.goTo(trainerClassTableAddress);
    this.classNames = this.gbaService.getGameStringAutoList(this.gbaService.constants().TRAINER_CLASS_COUNT);
  }

  private loadTrainer(uid: number) {
    let trainer: PokeTrainer = new PokeTrainer();
    trainer.uid = uid;
    trainer.address = this.gbaService.position;
    
    this.gbaService.goTo(trainer.address);
    trainer.data = this.gbaService.getBytes(40);
    this.gbaService.goTo(trainer.address);

    trainer.flags = this.gbaService.getByte();
    trainer.hasCustomMoves = (trainer.flags & 1) == 1;
    trainer.hasHeldItems = (trainer.flags & 2) == 2;
    trainer.trainerClass = this.gbaService.getByte();
    trainer.genderMusic = this.gbaService.getByte();
    trainer.genderId = ((trainer.genderMusic & 128) >> 7);
    trainer.musicId = (trainer.genderMusic & 127);
    trainer.spriteId = this.gbaService.getByte();
    trainer.name = this.gbaService.getGameString(12);
    trainer.items = [];
    for (let i = 0; i < 4; i++) 
      trainer.items.push(this.gbaService.getShort());
    
    trainer.isDoubleBattle = this.gbaService.getByte() == 1;
    this.gbaService.skip(3);
    trainer.ai = this.gbaService.getInt();
    trainer.partyCount = this.gbaService.getByte();
    this.gbaService.skip(3);
    trainer.partyAddress = this.gbaService.getPointer();
    let revertPosition = this.gbaService.position;

    let partySlotSize = trainer.hasCustomMoves ? 16 : 8;
    this.gbaService.goTo(trainer.partyAddress);
    trainer.partyData = this.gbaService.getBytes(partySlotSize * trainer.partyCount);
    
    this.gbaService.goTo(trainer.partyAddress);
    for (let i = 0; i < 6; i++) {
      let partyMonster: PokeTrainerMonster = new PokeTrainerMonster();
      if (i < trainer.partyCount) {
        partyMonster.uid = i;
        partyMonster.evs = this.gbaService.getShort();
        partyMonster.level = this.gbaService.getShort();
        partyMonster.species = this.gbaService.getShort();

        if (trainer.hasHeldItems) 
          partyMonster.heldItem = this.gbaService.getShort();
        else 
          this.gbaService.skip(2);
        
          
        if (trainer.hasCustomMoves) {
          partyMonster.customMoves = [];
          for (let i = 0; i < 4; i++) 
            partyMonster.customMoves.push(this.gbaService.getShort());
        }
      } else {
        partyMonster.uid = i;
        partyMonster.evs = 0;
        partyMonster.level = 0;
        partyMonster.species = 0;
      }

      trainer.party.push(partyMonster);
    }
    this.gbaService.goTo(revertPosition);

    this.trainers.push(trainer);
  }

  public loadSprite(trainerId: number) {
    let pixelStart = 0;
    let paletteStart = 0;

    this.gbaService.goTo(this.gbaService.constants().TRAINER_BITMAPS_ADDRESS + (trainerId * 8));
    pixelStart = this.gbaService.getPointer();

    this.gbaService.goTo(this.gbaService.constants().TRAINER_PALETTES_ADDRESS + (trainerId * 8));
    paletteStart = this.gbaService.getPointer();

    let pixelObj: BitmapPixelData = new BitmapPixelData(pixelStart, BitmapPixelDepth.BPP_4, undefined, this.bitmapService, this.gbaService);
    let paletteObj: BitmapPalette = new BitmapPalette(paletteStart, 16, undefined, undefined, this.bitmapService, this.gbaService);

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

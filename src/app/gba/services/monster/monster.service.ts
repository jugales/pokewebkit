import { Injectable } from '@angular/core';
import { BitmapAnimation, BitmapPalette, BitmapPixelData, BitmapPixelDepth, BitmapService } from '../graphics/bitmap.service';
import { GbaService } from '../gba.service';

@Injectable({
  providedIn: 'root'
})
export class MonsterService {

  public monsters: Monster[] = [];
  public monsterIcons: BitmapAnimation[] = [];
  public abilityNames: string[] = [];
  public moveNames: string[] = [];

  public isLoaded: boolean = false;

  constructor(private gbaService: GbaService, private bitmapService: BitmapService) { }

  public loadMonsters() {
    this.monsters = new Array(this.gbaService.constants().MONSTER_COUNT);

    this.loadNames();
    this.loadBaseStats();
    this.loadAbilityNames();
    this.loadMoveNames();
    this.loadMonsterIcons();

    this.isLoaded = true;
    this.gbaService.markToolLoaded();
  }

  private loadMonsterIcons() {
    let monsterIconPalettes: BitmapPalette[] = [];
    for (let i = 0; i < this.gbaService.constants().MONSTER_COUNT; i++) {
      this.gbaService.goTo(this.gbaService.constants().MONSTER_ICON_PIXEL_ADDRESS + (i * 4));
      this.gbaService.goTo(this.gbaService.getPointer());
      let frame0Values = this.gbaService.getBytes(32 * 32 / 2);
      let frame1Values = this.gbaService.getBytes(32 * 32 / 2);
      let frame0Data = new BitmapPixelData(undefined, BitmapPixelDepth.BPP_4, frame0Values, this.bitmapService, this.gbaService);
      let frame1Data = new BitmapPixelData(undefined, BitmapPixelDepth.BPP_4, frame1Values, this.bitmapService, this.gbaService);
      
      this.gbaService.goTo(this.gbaService.constants().MONSTER_ICON_PALETTE_ADDRESS + i);
      let paletteId = this.gbaService.getByte();

      if (monsterIconPalettes.length < this.gbaService.constants().MONSTER_ICON_PALETTE_COUNT) {
        for (let j = 0; j < this.gbaService.constants().MONSTER_ICON_PALETTE_COUNT; j++) {
          this.gbaService.goTo(this.gbaService.constants().MONSTER_ICON_PALETTES + (j * 32));
          let paletteValues = this.gbaService.getBytes(32);
          monsterIconPalettes.push(new BitmapPalette(undefined, 16, paletteValues, undefined, this.bitmapService, this.gbaService, j));
        }
      }

      let iconBitmap0 = this.bitmapService.createBitmapCanvas(frame0Data, monsterIconPalettes[paletteId], 32, 32, true);
      let iconBitmap1 = this.bitmapService.createBitmapCanvas(frame1Data, monsterIconPalettes[paletteId], 32, 32, true);

      this.monsterIcons.push(new BitmapAnimation([iconBitmap0, iconBitmap1], iconBitmap0, 350, true, false, 0));
    }
  }

  private loadNames() {
    this.gbaService.goTo(this.gbaService.constants().MONSTER_NAMES_ADDRESS);
    let monsterNamesAddress: number = this.gbaService.getPointer();
    this.gbaService.goTo(monsterNamesAddress);
    let names: string[] = this.gbaService
      .getGameStringAutoList(this.gbaService.constants().MONSTER_COUNT);
    
    for (let i = 0; i < names.length; i++) {
      if (this.monsters[i] == undefined)
        this.monsters[i] = new Monster();
      
      this.monsters[i].uid = i;
      this.monsters[i].name = names[i];
    }
  }

  private loadBaseStats() {
    this.gbaService.goTo(this.gbaService.constants().MONSTER_BASE_STATS_ADDRESS);
    let startPosition: number = this.gbaService.getPointer();
    for (let i = 0; i < this.monsters.length; i++) {
      let baseStats: MonsterBaseStats = new MonsterBaseStats();

      baseStats.address = startPosition + (i * 28);
      this.gbaService.goTo(baseStats.address);
      baseStats.data = this.gbaService.getBytes(28);

      this.gbaService.goTo(baseStats.address);
      baseStats.baseHP = this.gbaService.getByte();
      baseStats.baseAttack = this.gbaService.getByte();
      baseStats.baseDefense = this.gbaService.getByte();
      baseStats.baseSpeed = this.gbaService.getByte();
      baseStats.baseSpAttack = this.gbaService.getByte();
      baseStats.baseSpDefense = this.gbaService.getByte();
      baseStats.type1 = this.gbaService.getByte();
      baseStats.type2 = this.gbaService.getByte();
      baseStats.catchRate = this.gbaService.getByte();
      baseStats.baseExpYield = this.gbaService.getByte();
      baseStats.effortYield = this.gbaService.getShort();
      baseStats.item1 = this.gbaService.getShort();
      baseStats.item2 = this.gbaService.getShort();
      baseStats.gender = this.gbaService.getByte();
      baseStats.eggCycles = this.gbaService.getByte();
      baseStats.baseFriendship = this.gbaService.getByte();
      baseStats.levelUpType = this.gbaService.getByte();
      baseStats.eggGroup1 = this.gbaService.getByte();
      baseStats.eggGroup2 = this.gbaService.getByte();
      baseStats.ability1 = this.gbaService.getByte();
      baseStats.ability2 = this.gbaService.getByte();
      baseStats.safariZoneRate = this.gbaService.getByte();
      baseStats.colorAndFlip = this.gbaService.getByte();

      // lol i hated this so much, edit at your own risk
      baseStats.hpYield = ((baseStats.effortYield & ((1 << 2) - 1) & ~(((1 << 0) - 1))) >>> 0);
      baseStats.attackYield = ((baseStats.effortYield & ((1 << 4) - 1) & ~(((1 << 2) - 1))) >>> 2);
      baseStats.defenseYield = ((baseStats.effortYield & ((1 << 6) - 1) & ~(((1 << 4) - 1))) >>> 4);
      baseStats.speedYield = ((baseStats.effortYield & ((1 << 8) - 1) & ~(((1 << 6) - 1))) >>> 6);
      baseStats.spAttackYield = ((baseStats.effortYield & ((1 << 10) - 1) & ~(((1 << 8) - 1))) >>> 8);
      baseStats.spDefenseYield = ((baseStats.effortYield & ((1 << 12) - 1) & ~(((1 << 10) - 1))) >>> 10);

      this.monsters[i].baseStats = baseStats;
    }
  }

  public loadAbilityNames() {
    this.gbaService.goTo(this.gbaService.constants().ABILITY_NAMES_ADDRESS);
    this.abilityNames = this.gbaService.getGameStringAutoList(this.gbaService.constants().ABILITY_COUNT);
  }

  public loadMoveNames() {
    this.gbaService.goTo(this.gbaService.constants().MOVE_NAMES_ADDRESS);
    let moveNamesAddress = this.gbaService.getPointer();
    this.gbaService.goTo(moveNamesAddress);
    this.moveNames = this.gbaService.getGameStringAutoList(this.gbaService.constants().MOVE_COUNT);
    console.log(this.moveNames);
  }

  public loadBattleSprite(monsterId: number, isFront: boolean, isShiny: boolean) {
    let pixelStart = 0;
    let paletteStart = 0;

    if (isFront) 
      pixelStart = this.gbaService.constants().MONSTER_FRONT_PIXEL_ADDRESS;
    else
      pixelStart = this.gbaService.constants().MONSTER_BACK_PIXEL_ADDRESS;
    if (this.gbaService.header.gameCode.startsWith('BPRE')) {
      this.gbaService.goTo(pixelStart);
      pixelStart = this.gbaService.getPointer();
    }

    if (isShiny)
      paletteStart = this.gbaService.constants().MONSTER_SHINY_PALETTE_ADDRESS;
    else
      paletteStart = this.gbaService.constants().MONSTER_NORMAL_PALETTE_ADDRESS;
    
    if (this.gbaService.header.gameCode.startsWith('BPRE')) {
      this.gbaService.goTo(paletteStart);
      paletteStart = this.gbaService.getPointer();
    }

    this.gbaService.goTo(pixelStart + (8 * monsterId));
    let pixelAddress: number = this.gbaService.getPointer();
    this.gbaService.goTo(paletteStart + (8 * monsterId));
    let paletteAddress: number = this.gbaService.getPointer();

    let pixelObj: BitmapPixelData = new BitmapPixelData(pixelAddress, BitmapPixelDepth.BPP_4, undefined, this.bitmapService, this.gbaService);
    let paletteObj: BitmapPalette = new BitmapPalette(paletteAddress, 16, undefined, undefined, this.bitmapService, this.gbaService);

    return this.bitmapService.createBitmap(pixelObj, paletteObj, 64, 64, true);
  }

}
export class Monster {

  constructor(
    public uid?: number,
    public name?: string,
    public baseStats?: MonsterBaseStats
  ) { }
}
export class MonsterBaseStats {

  constructor(
    public address?: number,
    public data: number[] = [],
    public baseHP?: number,
    public baseAttack?: number,
    public baseDefense?: number,
    public baseSpeed?: number,
    public baseSpAttack?: number,
    public baseSpDefense?: number,
    public type1?: number,
    public type2?: number,
    public catchRate?: number,
    public baseExpYield?: number,
    public effortYield?: number,
    public item1?: number,
    public item2?: number,
    public gender?: number,
    public eggCycles?: number,
    public baseFriendship?: number,
    public levelUpType?: number,
    public eggGroup1?: number,
    public eggGroup2?: number,
    public ability1?: number,
    public ability2?: number,
    public safariZoneRate?: number,
    public colorAndFlip?: number,

    public hpYield?: number,
    public attackYield?: number,
    public defenseYield?: number,
    public speedYield?: number,
    public spAttackYield?: number,
    public spDefenseYield?: number,
  ) { }
}

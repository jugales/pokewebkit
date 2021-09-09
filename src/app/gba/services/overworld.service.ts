import { Injectable } from '@angular/core';
import { BitmapPalette, BitmapPixelData, BitmapPixelDepth, BitmapService } from './bitmap.service';
import { GbaService } from './gba.service';

@Injectable({
  providedIn: 'root'
})
export class OverworldService {

  public overworldPalettes: BitmapPalette[] = new Array(16);
  public overworldSpriteCache: Map<Number, PokeOverworldSprite> = new Map<Number, PokeOverworldSprite>();

  constructor(private gbaService: GbaService, private bitmapService: BitmapService) { }

  public loadOverworldPalettes() {
    for (let i = 0; i < this.overworldPalettes.length; i++) {
      this.gbaService.goTo(this.gbaService.constants().MAP_SPRITES_PALETTES + (i * 8));
      let paletteAddress: number = this.gbaService.getPointer();
      let paletteId: number = this.gbaService.getByte();
      this.overworldPalettes[i] = new BitmapPalette(paletteAddress, 16, undefined, undefined, this.bitmapService, this.gbaService, paletteId);
    }
  }

  public getOverworldPalette(index: number) {
    for (let i = 0; i < this.overworldPalettes.length; i++) {
      if (this.overworldPalettes[i].internalId == index) {
        return this.overworldPalettes[i];
      }
    }
    return this.overworldPalettes[index];
  }

  public getOverworld(index: number) {
    if (!this.overworldPalettes[0]) {
      this.loadOverworldPalettes();
    }
    
    if (this.overworldSpriteCache.has(index))
      return this.overworldSpriteCache.get(index);

    let spritePointerAddress: number = this.gbaService.constants().MAP_SPRITES_ADDRESS + (index * 4);
    this.gbaService.goTo(spritePointerAddress);
    this.gbaService.goTo(this.gbaService.getPointer());
    let overworld: PokeOverworldSprite = new PokeOverworldSprite();
    this.gbaService.skip(2); // filler always 0xffff
    overworld.primaryPaletteId = this.gbaService.getByte();
    this.gbaService.skip(3); // unknown data
    this.gbaService.skip(2); // some kind of synchronization flag ?
    overworld.width = this.gbaService.getShort();
    overworld.height = this.gbaService.getShort();
    this.gbaService.skip(4); // 2 unkonwn bytes, 2 filler
    this.gbaService.skip(4); // no clue
    overworld.sizeDrawAddress = this.gbaService.getPointer();
    overworld.framesAddress = this.gbaService.getPointer();
    overworld.spriteAddress = this.gbaService.getPointer();

    let spriteData: PokeOverworldSpriteData = new PokeOverworldSpriteData();
    this.gbaService.goTo(overworld.spriteAddress);
    spriteData.pixelsAddress = this.gbaService.getPointer();
    spriteData.pixelCount = this.gbaService.getShort();
    overworld.spriteData = spriteData;

    this.overworldSpriteCache.set(index, overworld);
    return overworld;
  }

  public getOverworldSprite(index: number, frameId?: number) {
    let overworld: PokeOverworldSprite = this.getOverworld(index);

    if (!frameId || overworld.width > 32)
      frameId = 0;

    if (overworld.width == 0 || overworld.height == 0 || !(overworld.width % 8 == 0) || !(overworld.height % 8 == 0))
      return undefined; // only if something bad happened 

    this.gbaService.goTo(overworld.spriteData.pixelsAddress + (frameId * overworld.spriteData.pixelCount));
    let pixelData: number[] = this.gbaService.getBytes(overworld.spriteData.pixelCount);
    let pixels: BitmapPixelData = new BitmapPixelData(undefined, BitmapPixelDepth.BPP_4, pixelData, this.bitmapService, this.gbaService);

    let paletteId = 0;
    for (let i = 0; i < this.overworldPalettes.length; i++) {
      if (this.overworldPalettes[i].internalId == overworld.primaryPaletteId) {
        paletteId = i;
      }
    }

    let result = this.bitmapService.createBitmapCanvas(pixels, this.overworldPalettes[paletteId], overworld.width, overworld.height, true);
    return result;
  }
}
export class PokeOverworldSprite {

  constructor(
    public primaryPaletteId?: number,
    public secondaryPaletteId?: number,
    public width?: number,
    public height?: number,
    public sizeDrawAddress?: number,
    public framesAddress?: number,
    public spriteAddress?: number,
    public spriteData?: PokeOverworldSpriteData
  ) { }

}
export class PokeOverworldSpriteData {

  constructor(
    public pixelsAddress?: number,
    public pixelCount?: number
  ) { }

}

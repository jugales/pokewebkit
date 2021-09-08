import { Injectable } from '@angular/core';
import { BitmapPalette, BitmapPixelData, BitmapPixelDepth, BitmapService } from './bitmap.service';
import { RomService } from './rom.service';

@Injectable({
  providedIn: 'root'
})
export class OverworldService {

  public overworldPalettes: BitmapPalette[] = new Array(16);
  public overworldSpriteCache: Map<Number, PokeOverworldSprite> = new Map<Number, PokeOverworldSprite>();

  constructor(private romService: RomService, private bitmapService: BitmapService) { }

  public loadOverworldPalettes() {
    for (let i = 0; i < this.overworldPalettes.length; i++) {
      this.romService.goTo(this.romService.constants().MAP_SPRITES_PALETTES + (i * 8));
      let paletteAddress: number = this.romService.getPointer();
      let paletteId: number = this.romService.getByte();
      this.overworldPalettes[i] = new BitmapPalette(paletteAddress, 16, undefined, undefined, this.bitmapService, this.romService, paletteId);
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

    let spritePointerAddress: number = this.romService.constants().MAP_SPRITES_ADDRESS + (index * 4);
    this.romService.goTo(spritePointerAddress);
    this.romService.goTo(this.romService.getPointer());
    let overworld: PokeOverworldSprite = new PokeOverworldSprite();
    this.romService.skip(2); // filler always 0xffff
    overworld.primaryPaletteId = this.romService.getByte();
    this.romService.skip(3); // unknown data
    this.romService.skip(2); // some kind of synchronization flag ?
    overworld.width = this.romService.getShort();
    overworld.height = this.romService.getShort();
    this.romService.skip(4); // 2 unkonwn bytes, 2 filler
    this.romService.skip(4); // no clue
    overworld.sizeDrawAddress = this.romService.getPointer();
    overworld.framesAddress = this.romService.getPointer();
    overworld.spriteAddress = this.romService.getPointer();

    let spriteData: PokeOverworldSpriteData = new PokeOverworldSpriteData();
    this.romService.goTo(overworld.spriteAddress);
    spriteData.pixelsAddress = this.romService.getPointer();
    spriteData.pixelCount = this.romService.getShort();
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

    this.romService.goTo(overworld.spriteData.pixelsAddress + (frameId * overworld.spriteData.pixelCount));
    let pixelData: number[] = this.romService.getBytes(overworld.spriteData.pixelCount);
    let pixels: BitmapPixelData = new BitmapPixelData(undefined, BitmapPixelDepth.BPP_4, pixelData, this.bitmapService, this.romService);

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

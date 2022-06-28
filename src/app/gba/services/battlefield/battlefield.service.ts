import { Injectable } from '@angular/core';
import { BitmapPalette, BitmapPixelData, BitmapPixelDepth, BitmapService, BitmapTilemap, BitmapTilemapType } from '../graphics/bitmap.service';
import { GbaService } from '../gba.service';

@Injectable({
  providedIn: 'root'
})
export class BattlefieldService {

  /* TODO: Better names */
  public battlefields: any[] = [
    { name: 'Grass' },
    { name: 'Tall Grass' },
    { name: 'Sand' },
    { name: 'Water 1' },
    { name: 'Water 2' },
    { name: 'Water 3' },
    { name: 'Rocky 1' },
    { name: 'Rocky 2' },
    { name: 'Indoor 1' },
    { name: 'Indoor 2' },
    { name: 'Indoor 3' },
    { name: 'Indoor 4' },
    { name: 'Indoor 5' },
    { name: 'Indoor 6' },
    { name: 'Indoor 7' },
    { name: 'Indoor 8' },
    { name: 'Indoor 9' },
    { name: 'Indoor 10' },
    { name: 'Indoor 11' },
    { name: 'Indoor 12' }
  ];
  public isLoaded: boolean = false;
  
  constructor(private gbaService: GbaService, private bitmapService: BitmapService) { 
    for (let i = 0; i < this.battlefields.length; i++)
      this.battlefields[i].index = i;
  }

  public loadBattlefield(index: number) {
    if (this.battlefields.length !== this.gbaService.constants().BATTLE_BACKGROUNDS_COUNT)
      this.battlefields = this.battlefields.slice(0, this.gbaService.constants().BATTLE_BACKGROUNDS_COUNT);

    this.gbaService.goTo(this.gbaService.constants().BATTLE_BACKGROUNDS_ADDRESS + (index * 20));
    if (!this.battlefields[index].backgroundAddress) {
      let battlefield: PokeBattlefield = this.battlefields[index];
      battlefield.index = index;
      battlefield.address = this.gbaService.position;
      battlefield.data = this.gbaService.getBytes(20);

      this.gbaService.goTo(battlefield.address);
      battlefield.backgroundAddress = this.gbaService.getPointer();
      battlefield.backgroundTileAddress = this.gbaService.getPointer();
      battlefield.entryImageAddress = this.gbaService.getPointer();
      battlefield.entryImageTileAddress = this.gbaService.getPointer();
      battlefield.paletteAddress = this.gbaService.getPointer();
  
      let revertPosition = this.gbaService.position;
  
      battlefield.palettes = new Array(5);
      battlefield.palettes[0] = new BitmapPalette(battlefield.paletteAddress, 48, undefined, undefined, this.bitmapService, this.gbaService); // prevents error with default tile 0x00
      for (let i = 0; i < battlefield.palettes.length - 2; i++) 
        battlefield.palettes[i + 2] = battlefield.palettes[0].getSubPalette(i * 16, i * 16 + 16);
  
      battlefield.backgroundTilemap = new BitmapTilemap(battlefield.backgroundTileAddress, BitmapTilemapType.TEXT_4, undefined, this.bitmapService, this.gbaService);
      battlefield.backgroundPixelData = new BitmapPixelData(battlefield.backgroundAddress, BitmapPixelDepth.BPP_4, undefined, this.bitmapService, this.gbaService);
      battlefield.backgroundImage = this.bitmapService.createTiledBitmap(
        battlefield.backgroundPixelData, 
        battlefield.palettes, 
        battlefield.backgroundTilemap,
        256, 112);
  
      battlefield.entryTilemap = new BitmapTilemap(battlefield.entryImageTileAddress, BitmapTilemapType.TEXT_4, undefined, this.bitmapService, this.gbaService);
      battlefield.entryPixelData = new BitmapPixelData(battlefield.entryImageAddress, BitmapPixelDepth.BPP_4, undefined, this.bitmapService, this.gbaService);
      battlefield.entryImage = this.bitmapService.createTiledBitmap(
        battlefield.entryPixelData, 
        battlefield.palettes, 
        battlefield.entryTilemap,
        256, 112);
  
      this.gbaService.goTo(revertPosition);
  
      this.battlefields[index] = battlefield;
    }
    this.isLoaded = true;
    this.gbaService.markToolLoaded();

    return this.battlefields[index];
  }
}
export class PokeBattlefield {

  constructor(
    public index: number,
    public address: number,
    public data: number[] = [],
    public name: string,
    public backgroundAddress?: number,
    public backgroundTileAddress?: number,
    public entryImageAddress?: number,
    public entryImageTileAddress?: number,
    public paletteAddress?: number,
    
    public backgroundPixelData?: BitmapPixelData,
    public backgroundTilemap?: BitmapTilemap,
    public entryPixelData?: BitmapPixelData,
    public entryTilemap?: BitmapTilemap,
    public palettes: BitmapPalette[] = [],

    public backgroundImage?: any,
    public entryImage?: any
  ) { }
}

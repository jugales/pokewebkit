import { Injectable } from '@angular/core';
import { BitmapPalette, BitmapPixelData, BitmapPixelDepth, BitmapService } from './bitmap.service';
import { GbaService } from './gba.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  public items: PokeItem[] = [];
  public isLoaded: boolean = false;

  constructor(private gbaService: GbaService, private bitmapService: BitmapService) { }

  public loadItems() {
    this.gbaService.goTo(this.gbaService.constants().ITEM_DATA_ADDRESS);

    for (let i = 0; i < this.gbaService.constants().ITEM_COUNT; i++) {
      this.loadItem();
    }
    this.isLoaded = true;
    this.gbaService.markToolLoaded();
  }

  private loadItem() {
    let revertPosition = 0;
    let item: PokeItem = new PokeItem();
    item.address = this.gbaService.position;
    item.name = this.gbaService.getGameString(14).trim();
    item.uid = this.gbaService.getShort();
    item.price = this.gbaService.getShort();
    item.holdEffect = this.gbaService.getByte();
    item.parameter = this.gbaService.getByte();
    item.descriptionAddress = this.gbaService.getPointer();
    item.mysteryValue = this.gbaService.getShort();
    item.pocket = this.gbaService.getByte();
    item.type = this.gbaService.getByte();
    item.fieldUsageCodeAddress = this.gbaService.getPointer();
    item.battleUsage = this.gbaService.getInt();
    item.battleUsageCodeAddress = this.gbaService.getPointer();
    item.extraParameter = this.gbaService.getInt();

    revertPosition = this.gbaService.position;
    this.gbaService.goTo(item.descriptionAddress);
    item.description = this.gbaService.getGameString(255);
    
    this.gbaService.position = item.descriptionAddress;
    item.descriptionData = this.gbaService.getBytes(255);
    this.gbaService.position = item.address;
    item.data = this.gbaService.getBytes(44);
    this.gbaService.position = revertPosition;

    this.items.push(item);
  }

  public loadSprite(itemId: number) {
    let pixelStart = 0;
    let paletteStart = 0;

    this.gbaService.goTo(this.gbaService.constants().ITEM_BITMAPS_ADDRESS + (itemId * 8))
    pixelStart = this.gbaService.getPointer();
    paletteStart = this.gbaService.getPointer();

    let pixelObj: BitmapPixelData = new BitmapPixelData(pixelStart, BitmapPixelDepth.BPP_4, undefined, this.bitmapService, this.gbaService);
    let paletteObj: BitmapPalette = new BitmapPalette(paletteStart, 16, undefined, undefined, this.bitmapService, this.gbaService);

    return this.bitmapService.createBitmap(pixelObj, paletteObj, 24, 24);
  }
}
export class PokeItem {

  constructor(
    public address?: number,
    public name?: string,
    public uid?: number,
    public price?: number,
    public holdEffect?: number,
    public parameter?: number,
    public descriptionAddress?: number,
    public mysteryValue?: number,
    public pocket?: number,
    public type?: number,
    public fieldUsageCodeAddress?: number,
    public battleUsage?: number,
    public battleUsageCodeAddress?: number,
    public extraParameter?: number,

    public data: number[] = [],
    public description?: string,
    public descriptionData: number[] = []
  ) { }
}

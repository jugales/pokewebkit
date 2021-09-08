import { Injectable } from '@angular/core';
import { BitmapPalette, BitmapPixelData, BitmapPixelDepth, BitmapService } from './bitmap.service';
import { RomService } from './rom.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  public items: PokeItem[] = [];
  public isLoaded: boolean = false;

  constructor(private romService: RomService, private bitmapService: BitmapService) { }

  public loadItems() {
    this.romService.goTo(this.romService.constants().ITEM_DATA_ADDRESS);

    for (let i = 0; i < this.romService.constants().ITEM_COUNT; i++) {
      this.loadItem();
    }
    this.isLoaded = true;
    this.romService.markToolLoaded();
  }

  private loadItem() {
    let revertPosition = 0;
    let item: PokeItem = new PokeItem();
    item.address = this.romService.position;
    item.name = this.romService.getGameString(14).trim();
    item.uid = this.romService.getShort();
    item.price = this.romService.getShort();
    item.holdEffect = this.romService.getByte();
    item.parameter = this.romService.getByte();
    item.descriptionAddress = this.romService.getPointer();
    item.mysteryValue = this.romService.getShort();
    item.pocket = this.romService.getByte();
    item.type = this.romService.getByte();
    item.fieldUsageCodeAddress = this.romService.getPointer();
    item.battleUsage = this.romService.getInt();
    item.battleUsageCodeAddress = this.romService.getPointer();
    item.extraParameter = this.romService.getInt();

    revertPosition = this.romService.position;
    this.romService.goTo(item.descriptionAddress);
    item.description = this.romService.getGameString(255);
    
    this.romService.position = item.descriptionAddress;
    item.descriptionData = this.romService.getBytes(255);
    this.romService.position = item.address;
    item.data = this.romService.getBytes(44);
    this.romService.position = revertPosition;

    this.items.push(item);
  }

  public loadSprite(itemId: number) {
    let pixelStart = 0;
    let paletteStart = 0;

    this.romService.goTo(this.romService.constants().ITEM_BITMAPS_ADDRESS + (itemId * 8))
    pixelStart = this.romService.getPointer();
    paletteStart = this.romService.getPointer();

    let pixelObj: BitmapPixelData = new BitmapPixelData(pixelStart, BitmapPixelDepth.BPP_4, undefined, this.bitmapService, this.romService);
    let paletteObj: BitmapPalette = new BitmapPalette(paletteStart, 16, undefined, undefined, this.bitmapService, this.romService);

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

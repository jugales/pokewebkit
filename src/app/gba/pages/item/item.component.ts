import { Component, OnInit } from '@angular/core';
import { CharacterSetService } from 'src/app/gba/services/character-set.service';
import { ItemService, PokeItem } from 'src/app/gba/services/item/item.service';
import { PendingChange, GbaService } from 'src/app/gba/services/gba.service';
import { ViewportService } from 'src/app/services/viewport.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {

  public currentItem: PokeItem;
  public sprite: any;;

  constructor(public gbaService: GbaService, public itemService: ItemService,
    public viewportService: ViewportService, private characterSetService: CharacterSetService) { 
    if (this.gbaService.isLoaded()) 
      this.loadItems();
  
    this.gbaService.romLoaded.subscribe(() => {
      this.loadItems();
    });
  }

  ngOnInit(): void {
  }

  private async loadItems() {
    this.itemService.loadItems();
    this.itemService.isLoaded = true;

    if (!this.currentItem)
      this.setCurrent(this.itemService.items[0]);
  }

  public setCurrent(newItem: PokeItem) {
    this.currentItem = newItem;
    this.sprite = this.itemService.loadSprite(this.currentItem.uid, true);
  }

  public updateItem(item: PokeItem): void {
    this.setCurrent(item);
    this.baseItemDataChanged();
  }

  public getPaddedId(id: number) {
    let result = id.toString();
    while (result.length < 3) {
      result = "0" + result;
    }
    return result;
  }

  public baseItemDataChanged() {
    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentItem.address + '-changed';
    pendingChange.changeReason = this.currentItem.name + ' Base Data Changed';
    pendingChange.address = this.currentItem.address;
    pendingChange.bytesBefore = this.currentItem.data;

    let writeBuffer = new ArrayBuffer(44);
    let writeView = new DataView(writeBuffer);

    // write bytes in little endian
    let itemNameValues: number[] = this.characterSetService.toBytes(this.currentItem.name);
    for (let i = 0; i < itemNameValues.length; i++)
      writeView.setUint8(i, itemNameValues[i]);
    writeView.setUint8(this.characterSetService.toBytes(this.currentItem.name).length, 0xFF); // end of string
    writeView.setUint16(14, this.currentItem.uid, true);
    writeView.setUint16(16, this.currentItem.price, true);
    writeView.setUint8(18, this.currentItem.holdEffect);
    writeView.setUint8(19, this.currentItem.parameter);

    let descriptionAddress = this.currentItem.descriptionAddress;
    if (this.gbaService.pendingChanges.has(this.currentItem.uid + '-item-description-change')) {
      if (this.gbaService.pendingChanges.get(this.currentItem.uid + '-item-description-change').repointAddress) {
        descriptionAddress = this.gbaService.pendingChanges.get(this.currentItem.uid + '-item-description-change').repointAddress;
      }
    }
      
    writeView.setUint32(20, this.gbaService.toPointer(descriptionAddress), true);
    writeView.setUint16(24, this.currentItem.mysteryValue, true);
    writeView.setUint8(26, this.currentItem.pocket);
    writeView.setUint8(27, this.currentItem.type);
    writeView.setUint32(28, this.gbaService.toPointer(this.currentItem.fieldUsageCodeAddress), true);
    writeView.setUint32(32, this.currentItem.battleUsage, true);
    writeView.setUint32(36, this.gbaService.toPointer(this.currentItem.battleUsageCodeAddress), true);
    writeView.setUint32(40, this.currentItem.extraParameter, true);

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.gbaService.queueChange(pendingChange);
  }
}

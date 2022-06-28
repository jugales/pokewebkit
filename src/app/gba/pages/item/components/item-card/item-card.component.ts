import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PokeItem, ItemService } from 'src/app/gba/services/item/item.service';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css']
})
export class ItemCardComponent implements OnInit, OnChanges {

  @Input()
  public item: PokeItem;
  public sprite: any;

  constructor(private itemService: ItemService) { }

  ngOnInit(): void {
    this.loadSprite();
  }

  public setCurrentSprite(newSprite: any) {
    this.sprite = newSprite;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.item) 
      this.loadSprite();
  }

  private loadSprite() {
    this.sprite = this.itemService.loadSprite(this.item.uid, true);
  }

}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemService } from 'src/app/gba/services/item/item.service';
import { Monster, MonsterService } from 'src/app/gba/services/monster/monster.service';

@Component({
  selector: 'app-monster-growth-tool',
  templateUrl: './growth-tool.component.html',
  styleUrls: ['./growth-tool.component.css']
})
export class GrowthToolComponent implements OnInit {

  @Input()
  public monster: Monster;

  @Output()
  public monsterUpdated: EventEmitter<Monster> = new EventEmitter<Monster>();

  constructor(public monsterService: MonsterService, public itemService: ItemService) { }

  ngOnInit(): void {
  }

  public baseStatsChanged(): void {
    this.monsterUpdated.emit(this.monster);
  }

}

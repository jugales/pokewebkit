import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemService } from 'src/app/gba/services/item/item.service';
import { Monster, MonsterService } from 'src/app/gba/services/monster/monster.service';

@Component({
  selector: 'app-monster-ev-tool',
  templateUrl: './ev-tool.component.html',
  styleUrls: ['./ev-tool.component.css']
})
export class EvToolComponent implements OnInit {

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

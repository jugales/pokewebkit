import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemService } from 'src/app/gba/services/item/item.service';
import { Monster, MonsterService } from 'src/app/gba/services/monster/monster.service';

@Component({
  selector: 'app-monster-general-tool',
  templateUrl: './general-tool.component.html',
  styleUrls: ['./general-tool.component.css']
})
export class GeneralToolComponent implements OnInit {

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

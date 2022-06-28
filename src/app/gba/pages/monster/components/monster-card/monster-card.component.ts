import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Monster, MonsterService } from 'src/app/gba/services/monster/monster.service';

@Component({
  selector: 'app-monster-card',
  templateUrl: './monster-card.component.html',
  styleUrls: ['./monster-card.component.css']
})
export class MonsterCardComponent implements OnInit, OnChanges {

  @Input()
  public monster: Monster;

  public currentSprite: any;
  public frontNormalSprite: any;
  public frontShinySprite: any;
  public backNormalSprite: any;
  public backShinySprite: any;

  constructor(private monsterService: MonsterService) { }

  ngOnInit(): void {
    this.loadSprites();
  }

  public setCurrentSprite(newSprite: any) {
    this.currentSprite = newSprite;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.monster) 
      this.loadSprites();
  }

  private loadSprites() {
    this.frontNormalSprite = this.monsterService.loadBattleSprite(this.monster.uid, true, false);
    this.backNormalSprite = this.monsterService.loadBattleSprite(this.monster.uid, false, false);
    this.frontShinySprite = this.monsterService.loadBattleSprite(this.monster.uid, true, true);
    this.backShinySprite = this.monsterService.loadBattleSprite(this.monster.uid, false, true);
    this.currentSprite = this.frontNormalSprite;
  }

}

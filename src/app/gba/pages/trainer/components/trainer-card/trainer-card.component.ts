import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PokeTrainer, TrainerService } from 'src/app/gba/services/world/trainer.service';

@Component({
  selector: 'app-trainer-card',
  templateUrl: './trainer-card.component.html',
  styleUrls: ['./trainer-card.component.css']
})
export class TrainerCardComponent implements OnInit, OnChanges {

  @Input()
  public trainer: PokeTrainer;
  public sprite: any;

  constructor(private trainerService: TrainerService) { }

  ngOnInit(): void {
    this.loadSprite();
  }

  public setCurrentSprite(newSprite: any) {
    this.sprite = newSprite;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.trainer) 
      this.loadSprite();
  }

  private loadSprite() {
    console.log(this.trainer.uid)
    this.sprite = this.trainerService.loadSprite(this.trainer.spriteId, true);
  }

}

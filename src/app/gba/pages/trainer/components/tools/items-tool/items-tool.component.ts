import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CharacterSetService } from 'src/app/gba/services/character-set.service';
import { GbaService, PendingChange } from 'src/app/gba/services/gba.service';
import { ItemService, PokeItem } from 'src/app/gba/services/item/item.service';
import { PokeTrainer, TrainerService } from 'src/app/gba/services/world/trainer.service';

@Component({
  selector: 'app-trainer-items-tool',
  templateUrl: './items-tool.component.html',
  styleUrls: ['./items-tool.component.css']
})
export class ItemsToolComponent implements OnInit {

  @Input()
  public trainer: PokeTrainer;

  @Output()
  public trainerUpdated: EventEmitter<PokeTrainer> = new EventEmitter<PokeTrainer>();

  constructor(public itemService: ItemService, public trainerService: TrainerService) { }

  ngOnInit(): void { }

  public trainerChanged(): void {
    this.trainerUpdated.emit(this.trainer);
  }

}

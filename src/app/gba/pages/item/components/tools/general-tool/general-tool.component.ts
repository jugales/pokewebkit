import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CharacterSetService } from 'src/app/gba/services/character-set.service';
import { GbaService, PendingChange } from 'src/app/gba/services/gba.service';
import { ItemService, PokeItem } from 'src/app/gba/services/item/item.service';

@Component({
  selector: 'app-item-general-tool',
  templateUrl: './general-tool.component.html',
  styleUrls: ['./general-tool.component.css']
})
export class GeneralToolComponent implements OnInit, OnChanges {

  @Input()
  public item: PokeItem;
  public itemDescription: string = '';

  public gameCode: string = '';

  @Output()
  public itemUpdated: EventEmitter<PokeItem> = new EventEmitter<PokeItem>();

  constructor(public itemService: ItemService,
    private gbaService: GbaService, private characterSetService: CharacterSetService) { }

  ngOnInit(): void {
    this.gameCode = this.gbaService.header.gameCode;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.item)
      this.itemDescription = changes.item.currentValue.description
  }

  public baseItemDataChanged(): void {
    this.itemUpdated.emit(this.item);
  }

  public descriptionChanged() {
    let shouldRepoint: boolean = this.characterSetService.toBytes(this.item.description).length 
      < this.characterSetService.toBytes(this.itemDescription).length;

    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.item.uid + '-item-description-change';
    pendingChange.changeReason = this.item.name + ' item description ' + (shouldRepoint ? 'repointed/changed' : 'changed');
    pendingChange.address = this.item.descriptionAddress;
    pendingChange.bytesToWrite = this.characterSetService.toBytes(this.itemDescription);
    pendingChange.bytesBefore = this.item.descriptionData.slice(0, this.characterSetService.toBytes(this.item.description).length);
    pendingChange.isTextUpdated = true;

    if (shouldRepoint) {
      pendingChange.repointAddress = this.gbaService.findFreeSpaceAddresses(this.itemDescription.length + 64, 1)[0];
      pendingChange.repointAt = [this.item.address + 20];

      if (this.gbaService.pendingChanges.has(this.item.address + '-changed')) {
        let baseDataChange: PendingChange = this.gbaService.pendingChanges.get(this.item.address + '-changed');
        let writeView = new DataView(baseDataChange.bytesToWrite);
        writeView.setUint32(20, this.gbaService.toPointer(pendingChange.repointAddress), true);
        this.gbaService.pendingChanges.set(this.item.address + '-changed', baseDataChange);
      }
    }

    this.gbaService.queueChange(pendingChange);
  }

  public holdEffects: any[] = [
    { value: 0, effect: 'None' },
    { value: 1, effect: 'Heal HP [used] [param required]' },
    { value: 2, effect: 'Cure Paralysis [used]' },
    { value: 3, effect: 'Cure Sleep [used]' },
    { value: 4, effect: 'Cure Poison [used]' },
    { value: 5, effect: 'Cure Burn [used]' },
    { value: 6, effect: 'Cure Freeze [used]' },
    { value: 7, effect: 'Heal PP [used] [param required]' },
    { value: 8, effect: 'Cure Confusion [used]' },
    { value: 9, effect: 'Cure All Status Effects [used]' },
    { value: 10, effect: 'Heal HP [used] [may confuse] [param required]' },
    { value: 11, effect: 'Heal HP [used] [may confuse] [param required]' },
    { value: 12, effect: 'Heal HP [used] [may confuse] [param required]' },
    { value: 13, effect: 'Heal HP [used] [may confuse] [param required]' },
    { value: 14, effect: 'Heal HP [used] [may confuse] [param required]' },
    { value: 15, effect: 'Raises ATTACK in a pinch [used] [param required]' },
    { value: 16, effect: 'Raises DEFENSE in a pinch [used] [param required]' },
    { value: 17, effect: 'Raises SPEED in a pinch [used] [param required]' },
    { value: 18, effect: 'Raises SP. ATK in a pinch [used] [param required]' },
    { value: 19, effect: 'Raises SP. DEF in a pinch [used] [param required]' },
    { value: 20, effect: 'Raises Critical-hit Ratio in a pinch [used] [param required]' },
    { value: 21, effect: 'Raises one stat in a pinch [used] [param required]' },
    { value: 22, effect: 'Lowers Opponents Accuracy [param required]' },
    { value: 23, effect: 'Restores any lowered stat [used]' },
    { value: 24, effect: 'Promotes strong growth but lowers SPEED while it is held' },
    { value: 25, effect: 'The holder gets a share of EXP. points without having to battle' },
    { value: 26, effect: 'The holder may be able to strike first [param required]' },
    { value: 27, effect: 'Promotes friendly growth' },
    { value: 28, effect: 'Cures Infatuation [used]' },
    { value: 29, effect: 'Powers up one move, which becomes the only usable one' },
    { value: 30, effect: 'It may cause the foe to flinch upon taking damage [param required]' },
    { value: 31, effect: 'Boosts the power of BUG-type moves [param required]' },
    { value: 32, effect: 'Doubles the battle money if the holding POKéMON takes part [param required]' },
    { value: 33, effect: 'Repels wild POKéMON if the holder is first in the party' },
    { value: 34, effect: 'Raises the SP. ATK and SP. DEF stats [LATIOS\LATIAS only]' },
    { value: 35, effect: 'Raises the SP. ATK stat' },
    { value: 36, effect: 'Raises the SP. DEF stat' },
    { value: 37, effect: 'Holding POKéMON can flee from any wild POKéMON' },
    { value: 38, effect: 'The holding POKéMON is prevented from evolving' },
    { value: 39, effect: 'Holding POKéMON may endure an attack, leaving just 1 HP [param required]' },
    { value: 40, effect: 'Extra EXP. points in battle' },
    { value: 41, effect: 'Boosts the critical-hit ratio of the holding POKéMON' },
    { value: 42, effect: 'Boosts the power of STEEL-type moves [param required]' },
    { value: 43, effect: 'Heals HP after every turn in battle [param required]' },
    { value: 44, effect: 'DRAGON SCALE effect [param required]' },
    { value: 45, effect: 'Doubles SP. ATK, may paralize opponents [PIKACHU only]' },
    { value: 46, effect: 'Boosts the power of GROUND-type moves [param required]' },
    { value: 47, effect: 'Boosts the power of ROCK-type moves [param required]' },
    { value: 48, effect: 'Boosts the power of GRASS-type moves [param required]' },
    { value: 49, effect: 'Boosts the power of DARK-type moves [param required]' },
    { value: 50, effect: 'Boosts the power of FIGHTING-type moves [param required]' },
    { value: 51, effect: 'Boosts the power of ELECTRIC-type moves [param required]' },
    { value: 52, effect: 'Boosts the power of WATER-type moves [param required]' },
    { value: 53, effect: 'Boosts the power of FLYING-type moves [param required]' },
    { value: 54, effect: 'Boosts the power of POISON-type moves [param required]' },
    { value: 55, effect: 'Boosts the power of ICE-type moves [param required]' },
    { value: 56, effect: 'Boosts the power of GHOST-type moves [param required]' },
    { value: 57, effect: 'Boosts the power of PSYCHIC-type moves [param required]' },
    { value: 58, effect: 'Boosts the power of FIRE-type moves [param required]' },
    { value: 59, effect: 'Boosts the power of DRAGON-type moves [param required]' },
    { value: 60, effect: 'Boosts the power of GHOST-type moves [param required]' },
    { value: 61, effect: 'UP-GRADE effect' },
    { value: 62, effect: 'Heals HP after hitting an opponent in battle [param required]' },
    { value: 63, effect: 'Raises Critical-Hit Ratio [CHANSEY only]' },
    { value: 64, effect: 'Raises DEFENSE [DITTO only]' },
    { value: 65, effect: 'It raises the ATTACK stat [CUBONE/MAROWAK only]' },
    { value: 66, effect: 'Raises Critical-Hit Ratio [FARFETCH\'D only]' }
  ];

}

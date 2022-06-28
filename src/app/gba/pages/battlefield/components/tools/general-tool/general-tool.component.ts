import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BattlefieldService, PokeBattlefield } from 'src/app/gba/services/battlefield/battlefield.service';

@Component({
  selector: 'app-battlefield-general-tool',
  templateUrl: './general-tool.component.html',
  styleUrls: ['./general-tool.component.css']
})
export class GeneralToolComponent implements OnInit {

  @Input()
  public battlefield: PokeBattlefield;

  @Output()
  public battlefieldUpdated: EventEmitter<PokeBattlefield> = new EventEmitter<PokeBattlefield>();

  constructor(public battlefieldService: BattlefieldService) { }

  ngOnInit(): void { }

  public battlefieldChanged(): void {
    this.battlefieldUpdated.emit(this.battlefield);
  }

  public getInputHexValue(event: any) {
    let hexString: string = event.target.value;
    let hexTest = /[0-9A-Fa-f]{6}/g;
    let result: number = 0;

    if (hexTest.test(hexString)) 
      result = Number.parseInt(hexString, 16);

    return result;
  }

}

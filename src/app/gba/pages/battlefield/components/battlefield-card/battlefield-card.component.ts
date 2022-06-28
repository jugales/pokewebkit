import { Component, Input, OnInit } from '@angular/core';
import { PokeBattlefield } from 'src/app/gba/services/battlefield/battlefield.service';

@Component({
  selector: 'app-battlefield-card',
  templateUrl: './battlefield-card.component.html',
  styleUrls: ['./battlefield-card.component.css']
})
export class BattlefieldCardComponent implements OnInit {

  @Input()
  public battlefield: PokeBattlefield;

  constructor() { }

  ngOnInit(): void { }

}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonsterCardComponent } from './monster-card.component';

describe('MonsterCardComponent', () => {
  let monster = {"uid": 6,"name": "CHARIZARD","baseStats": {"address": 2443308,"data": [78,84,78,100,109,85,10,2,45,209,0,3,0,0,0,0,31,20,70,3,1,14,66,0,0,0,0,0],"baseHP": 78,"baseAttack": 84,"baseDefense": 78,"baseSpeed": 100,"baseSpAttack": 109,"baseSpDefense": 85,"type1": 10,"type2": 2,"catchRate": 45,"baseExpYield": 209,"effortYield": 768,"item1": 0,"item2": 0,"gender": 31,"eggCycles": 20,"baseFriendship": 70,"levelUpType": 3,"eggGroup1": 1,"eggGroup2": 14,"ability1": 66,"ability2": 0,"safariZoneRate": 0,"colorAndFlip": 0,"hpYield": 0,"attackYield": 0,"defenseYield": 0,"speedYield": 0,"spAttackYield": 3,"spDefenseYield": 0}}
  let component: MonsterCardComponent;
  let fixture: ComponentFixture<MonsterCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonsterCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonsterCardComponent);
    component = fixture.componentInstance;
    component.monster = monster;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

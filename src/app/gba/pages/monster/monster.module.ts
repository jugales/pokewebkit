import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonsterRoutingModule } from './monster-routing.module';
import { MonsterComponent } from './monster.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { MonsterCardComponent } from './components/monster-card/monster-card.component';
import { GeneralToolComponent } from './components/tools/general-tool/general-tool.component';
import { BattleStatsToolComponent } from './components/tools/battle-stats-tool/battle-stats-tool.component';
import { EvToolComponent } from './components/tools/ev-tool/ev-tool.component';
import { GrowthToolComponent } from './components/tools/growth-tool/growth-tool.component';


@NgModule({
  declarations: [
    MonsterComponent,
    MonsterCardComponent,
    GeneralToolComponent,
    BattleStatsToolComponent,
    EvToolComponent,
    GrowthToolComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    MonsterRoutingModule
  ]
})
export class MonsterModule { }

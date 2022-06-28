import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BattlefieldRoutingModule } from './battlefield-routing.module';
import { BattlefieldComponent } from './battlefield.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { BattlefieldCardComponent } from './components/battlefield-card/battlefield-card.component';
import { GeneralToolComponent } from './components/tools/general-tool/general-tool.component';


@NgModule({
  declarations: [
    BattlefieldComponent,
    BattlefieldCardComponent,
    GeneralToolComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    BattlefieldRoutingModule
  ]
})
export class BattlefieldModule { }

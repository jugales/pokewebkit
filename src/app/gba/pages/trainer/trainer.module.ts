import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrainerRoutingModule } from './trainer-routing.module';
import { TrainerComponent } from './trainer.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { TrainerCardComponent } from './components/trainer-card/trainer-card.component';
import { OptionsToolComponent } from './components/tools/options-tool/options-tool.component';
import { ItemsToolComponent } from './components/tools/items-tool/items-tool.component';
import { PartyToolComponent } from './components/tools/party-tool/party-tool.component';


@NgModule({
  declarations: [
    TrainerComponent,
    TrainerCardComponent,
    OptionsToolComponent,
    ItemsToolComponent,
    PartyToolComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TrainerRoutingModule
  ]
})
export class TrainerModule { }

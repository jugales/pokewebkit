import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemRoutingModule } from './item-routing.module';
import { ItemComponent } from './item.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ItemCardComponent } from './components/item-card/item-card.component';
import { GeneralToolComponent } from './components/tools/general-tool/general-tool.component';


@NgModule({
  declarations: [
    ItemComponent,
    ItemCardComponent,
    GeneralToolComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ItemRoutingModule
  ]
})
export class ItemModule { }

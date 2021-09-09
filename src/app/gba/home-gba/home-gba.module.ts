import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeGbaRoutingModule } from './home-gba-routing.module';
import { HomeGbaComponent } from './home-gba.component';
import { MaterialModule } from 'src/app/material.module';
import { ToolsModule } from 'src/app/gba/tools/tools.module';


@NgModule({
  declarations: [
    HomeGbaComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ToolsModule,
    HomeGbaRoutingModule
  ]
})
export class HomeGbaModule { }

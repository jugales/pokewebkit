import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-nds-routing.module';
import { HomeNdsComponent } from './home-nds.component';
import { MaterialModule } from 'src/app/material.module';
import { ToolsModule } from 'src/app/gba/tools/tools.module';


@NgModule({
  declarations: [
    HomeNdsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ToolsModule,
    HomeRoutingModule
  ]
})
export class HomeNdsModule { }

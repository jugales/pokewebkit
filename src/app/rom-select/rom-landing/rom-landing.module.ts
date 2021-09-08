import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RomLandingRoutingModule } from './rom-landing-routing.module';
import { RomLandingComponent } from './rom-landing.component';
import { MaterialModule } from 'src/app/material.module';


@NgModule({
  declarations: [
    RomLandingComponent
  ],
  imports: [
    CommonModule,
    RomLandingRoutingModule,
    MaterialModule
  ]
})
export class RomLandingModule { }

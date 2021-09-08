import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RomLandingComponent } from './rom-landing.component';

const routes: Routes = [
  {
    path: '',
    component: RomLandingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RomLandingRoutingModule { }

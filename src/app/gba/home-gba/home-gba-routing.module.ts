import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeGbaComponent } from './home-gba.component';

const routes: Routes = [
  {
    path: '',
    component: HomeGbaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeGbaRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeNdsComponent } from './home-nds.component';

const routes: Routes = [
  {
    path: '',
    component: HomeNdsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

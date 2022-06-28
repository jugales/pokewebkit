import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BattlefieldComponent } from './battlefield.component';

const routes: Routes = [
  {
    path: '',
    component: BattlefieldComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BattlefieldRoutingModule { }

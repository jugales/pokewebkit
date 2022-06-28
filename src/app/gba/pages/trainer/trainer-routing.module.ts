import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrainerComponent } from './trainer.component';

const routes: Routes = [
  {
    path: '',
    component: TrainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainerRoutingModule { }

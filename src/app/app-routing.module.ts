import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { MainComponent } from './main/main.component';
import { RomSelectComponent } from './rom-select/rom-select.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./main/home/home.module').then(m => m.HomeModule), 
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'start',
    component: RomSelectComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./rom-select/rom-landing/rom-landing.module').then(m => m.RomLandingModule), 
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

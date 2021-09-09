import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { GbaComponent } from './gba/gba.component';
import { NdsComponent } from './nds/nds.component';
import { RomSelectComponent } from './rom-select/rom-select.component';

const routes: Routes = [
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
  },
  {
    path: 'gba',
    component: GbaComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./gba/home-gba/home-gba.module').then(m => m.HomeGbaModule), 
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'nds',
    component: NdsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./nds/home-nds/home-nds.module').then(m => m.HomeNdsModule), 
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**', 
    redirectTo: '/start'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

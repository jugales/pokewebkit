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
        path: 'battlefields',
        loadChildren: () => import('./gba/pages/battlefield/battlefield.module').then(m => m.BattlefieldModule), 
        pathMatch: 'full'
      },
      {
        path: 'items',
        loadChildren: () => import('./gba/pages/item/item.module').then(m => m.ItemModule), 
        pathMatch: 'full'
      },
      {
        path: 'monsters',
        loadChildren: () => import('./gba/pages/monster/monster.module').then(m => m.MonsterModule), 
        pathMatch: 'full'
      },
      {
        path: 'trainers',
        loadChildren: () => import('./gba/pages/trainer/trainer.module').then(m => m.TrainerModule), 
        pathMatch: 'full'
      },
      {
        path: 'world',
        loadChildren: () => import('./gba/pages/world/world.module').then(m => m.WorldModule), 
        pathMatch: 'full'
      },
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

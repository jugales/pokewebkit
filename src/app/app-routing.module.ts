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
    path: 'gba/battlefields',
    component: GbaComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./gba/pages/battlefield/battlefield.module').then(m => m.BattlefieldModule), 
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'gba/items',
    component: GbaComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./gba/pages/item/item.module').then(m => m.ItemModule), 
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'gba/monsters',
    component: GbaComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./gba/pages/monster/monster.module').then(m => m.MonsterModule), 
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'gba/trainers',
    component: GbaComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./gba/pages/trainer/trainer.module').then(m => m.TrainerModule), 
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'gba/world',
    component: GbaComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./gba/pages/world/world.module').then(m => m.WorldModule), 
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

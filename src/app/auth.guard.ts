import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { GbaService } from './gba/services/gba.service';
import { NdsService } from './nds/services/nds.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(public gbaService: GbaService, public ndsService:NdsService, private router: Router) {} 


  canActivate(): boolean {
    if (!this.gbaService.isLoaded() && !this.ndsService.isLoaded) {
      this.router.navigate(['/start']);
      return false;
    }

    return true;
  }
  
}

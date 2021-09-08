import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RomService } from './services/rom.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(public romService: RomService, private router: Router) {} 


  canActivate(): boolean {
    if (!this.romService.isLoaded()) {
      this.router.navigate(['/start']);
      return false;
    }

    return true;
  }
  
}

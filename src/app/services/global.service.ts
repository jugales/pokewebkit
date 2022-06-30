import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';

/**
 * Utility service to programmatically set global config
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public isAppLoading: boolean = false;

  constructor() { }
}

import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';

/**
 * Utility service to programmatically view the current Bootstrap breakpoint / screen width
 */
@Injectable({
  providedIn: 'root'
})
export class ViewportService {

  public isExtraSmall: boolean = false;
  public isSmall: boolean = false;
  public isMedium: boolean = false;
  public isLarge: boolean = false;
  public isExtraLarge: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver) { 
    // initial
    this.isExtraSmall = this.breakpointObserver.isMatched('(max-width: 575px)');
    this.isSmall = this.breakpointObserver.isMatched('(min-width: 576px)');
    this.isMedium = this.breakpointObserver.isMatched('(min-width: 768px)');
    this.isLarge = this.breakpointObserver.isMatched('(min-width: 992px)');
    this.isExtraLarge = this.breakpointObserver.isMatched('(min-width: 1200px)');

    // on screen size change
    this.breakpointObserver.observe(['(max-width: 575px)']).subscribe(result => this.isExtraSmall = result.matches);
    this.breakpointObserver.observe(['(min-width: 576px)']).subscribe(result => this.isSmall = result.matches);
    this.breakpointObserver.observe(['(min-width: 768px)']).subscribe(result => this.isMedium = result.matches);
    this.breakpointObserver.observe(['(min-width: 992px)']).subscribe(result => this.isLarge = result.matches);
    this.breakpointObserver.observe(['(min-width: 1200px)']).subscribe(result => this.isExtraLarge = result.matches);
  }
}

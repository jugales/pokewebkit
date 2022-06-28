import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { GbaService } from './services/gba.service';
import { SaveDialogGbaComponent } from './components/save-dialog-gba/save-dialog-gba.component';

@Component({
  selector: 'app-gba',
  templateUrl: './gba.component.html',
  styleUrls: ['./gba.component.css']
})
export class GbaComponent implements OnInit {

  public isLoaded: boolean = false;
  public romLoadTime: number = undefined;
  public currentRoute: string = '';

  public tools: any[] = [
    { url: '/gba/battlefields', name: 'Battlefield Editor' },
    { url: '/gba/items', name: 'Item Editor' },
    { url: '/gba/monsters', name: 'Monster Editor' },
    { url: '/gba/trainers', name: 'Trainer Editor' },
    { url: '/gba/world', name: 'World Editor' },
  ];

  constructor(public gbaService: GbaService, private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    this.gbaService.markLoaded();

    // To avoid ExpressionChangedAfterItHasBeenCheckedError, setTimeout :(
    setTimeout(() => {
      this.romLoadTime = this.gbaService.romLoadTime;
      this.isLoaded = true;
    });

    this.currentRoute = this.router.url;
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    })
  }

  public saveChanges() {
    this.dialog.open(SaveDialogGbaComponent);
  }
}

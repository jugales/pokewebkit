import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { GlobalService } from './services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'PokeWebKit';


  constructor(public globalService: GlobalService, private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        this.globalService.isAppLoading = true;
      }

      if (event instanceof NavigationEnd) {
        this.globalService.isAppLoading = false;
      }
    })
  }
}

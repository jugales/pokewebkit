import { AfterViewInit, Component } from '@angular/core';
import { NdsService } from '../services/nds.service';

@Component({
  selector: 'app-home-nds',
  templateUrl: './home-nds.component.html',
  styleUrls: ['./home-nds.component.css']
})
export class HomeNdsComponent implements AfterViewInit {

  public isLoaded: boolean = false;

  constructor(public ndsService: NdsService) { }

  ngAfterViewInit(): void {
    console.log('Landed on NDS page');
  }
}

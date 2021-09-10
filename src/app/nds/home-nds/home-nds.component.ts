import { AfterViewInit, Component } from '@angular/core';
import { NdsService } from '../services/nds.service';
import { NitroFileInfo, NitroFileService } from '../services/nitro-file.service';

@Component({
  selector: 'app-home-nds',
  templateUrl: './home-nds.component.html',
  styleUrls: ['./home-nds.component.css']
})
export class HomeNdsComponent implements AfterViewInit {

  public isLoaded: boolean = false;

  constructor(public ndsService: NdsService, private nitroFileService: NitroFileService) { }

  ngAfterViewInit(): void {
    console.log('Landed on NDS page');
    this.nitroFileService.load(this.ndsService);
    
    let file: NitroFileInfo = this.nitroFileService.getFile("a/0/8/2");
    console.log(file);
  }
}

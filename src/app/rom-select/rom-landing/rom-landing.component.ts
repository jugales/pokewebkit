import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RomHeader, GbaService } from 'src/app/gba/services/gba.service';
import { NdsService } from 'src/app/nds/services/nds.service';

@Component({
  selector: 'app-rom-landing',
  templateUrl: './rom-landing.component.html',
  styleUrls: ['./rom-landing.component.css']
})
export class RomLandingComponent implements OnInit {

  constructor(private gbaService: GbaService, private ndsService: NdsService,
    private title: Title, private router: Router) { }

  ngOnInit(): void {
    this.gbaService.romLoaded.subscribe(() => {
      let header: RomHeader = this.gbaService.header;
      let title: string = 'PokéWebKit: ' + header.title + ' (' + header.gameCode + ')' + (header.version == 1 ? 'v1.1' : '');
      this.title.setTitle(title);

      this.router.navigate(['/']);
    });
  }

  public onFileInput(event: any) {
    let r = new FileReader();

    // can't use class variables in the onload
    let startTime = Date.now();
    let gbaService: GbaService = this.gbaService;
    let ndsService: NdsService = this.ndsService;
    let router: Router = this.router; 
    let file: File = event.target.files[0];
    r.onload = function() {
      let fileData = r.result;
      
      if (file.name.endsWith('.gba')) {
        gbaService.loadRom(fileData as ArrayBuffer, startTime);
        router.navigate(['/gba']);
        console.log('Going to GBA page');
      } else if (file.name.endsWith('.nds')) {
        ndsService.loadRom(fileData as ArrayBuffer, startTime);
        router.navigate(['/nds']);
        console.log('Going to NDS page');
      }

      console.log('Done file processing');
    }
    r.readAsArrayBuffer(file);
  }

}

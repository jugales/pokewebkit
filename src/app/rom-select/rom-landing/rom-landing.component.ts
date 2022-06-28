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
    });
  }

  public onFileInput(event: any) {
    let startTime = Date.now();
    let file: File = event.target.files[0];

    let r = new FileReader();
    r.onload = () => this.loadROM(file.name, r.result as ArrayBuffer, startTime);
    r.readAsArrayBuffer(file);
  }

  private loadROM(fileName: string, fileData: ArrayBuffer, startTime: number) {
    let extension: string = fileName.split('.').pop();
    if (extension !== 'gba' && extension !== 'nds')
      return;

    if (extension === 'gba') 
      this.gbaService.loadRom(fileData, startTime);
    else if (extension === 'nds')
      this.ndsService.loadRom(fileData, startTime);

    this.router.navigate([`/${extension}/monsters`]);
  }

}

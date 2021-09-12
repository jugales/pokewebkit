import { AfterViewInit, Component } from '@angular/core';
import { NARC } from '../services/file-types/NARC';
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

    // uncomment below to preview NARC file read
    // let fileInfo: NitroFileInfo = this.nitroFileService.getFile("fielddata/build_model/bm_room.narc");
    // let narcFile: NARC = new NARC(this.ndsService, fileInfo);
    // narcFile.unpack();

    // console.log(narcFile.files);
    // console.log(narcFile.folders);
  }
}

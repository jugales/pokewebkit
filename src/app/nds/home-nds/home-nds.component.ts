import { AfterViewInit, Component } from '@angular/core';
import { BTX0 } from '../file-types/BTX0';
import { NARC } from '../file-types/NARC';
import { NdsService } from '../services/nds.service';
import { NitroFileInfo, NitroFileService } from '../services/nitro-file.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-home-nds',
  templateUrl: './home-nds.component.html',
  styleUrls: ['./home-nds.component.css']
})
export class HomeNdsComponent implements AfterViewInit {

  public isLoaded: boolean = false;

  constructor(public ndsService: NdsService, private nitroFileService: NitroFileService, 
    private utilService: UtilService) { }

  ngAfterViewInit(): void {
    console.log('Landed on NDS page');
    this.nitroFileService.load(this.ndsService);

    // uncomment below to preview NARC file read
    // let fileInfo: NitroFileInfo = this.nitroFileService.getFile("a/0/8/1");
    // let narcFile: NARC = new NARC(this.ndsService, fileInfo);
    // narcFile.unpack();
    // console.log(narcFile.files);
    // console.log(narcFile.folders);

    // uncomment below to preview BTX0 file read (NARC must be enabled and set to a/0/8/1 to work)
    // let btxFileInfo: NitroFileInfo = narcFile.files[190];
    // let btxFile: BTX0 = new BTX0(this.ndsService, btxFileInfo, this.utilService);
    // btxFile.unpack();
    // for (let i = 0; i < btxFile.frames.length; i++)
    //   console.log(btxFile.frames[i].toDataURL());

  }
}

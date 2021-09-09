import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { GbaService } from 'src/app/gba/services/gba.service';

@Component({
  selector: 'app-home-gba',
  templateUrl: './home-gba.component.html',
  styleUrls: ['./home-gba.component.css']
})
export class HomeGbaComponent implements AfterViewInit {

  public isLoaded: boolean = false;
  public romLoadTime: number = undefined;

  @ViewChild('toolGroup') public toolGroup: MatTabGroup;
  @ViewChild('worldTool') public worldTool: MatTab;
  @ViewChild('battlefieldTool') public battlefieldTool: MatTab;
  @ViewChild('monsterTool') public monsterTool: MatTab;
  @ViewChild('trainerTool') public trainerTool: MatTab;
  @ViewChild('itemTool') public itemTool: MatTab;

  constructor(public gbaService: GbaService) { }

  ngAfterViewInit(): void {
    this.gbaService.markLoaded();

    // To avoid ExpressionChangedAfterItHasBeenCheckedError, setTimeout :(
    setTimeout(() => {
      this.romLoadTime = this.gbaService.romLoadTime;
      this.isLoaded = true;
    });

    this.gbaService.toolSwitched.subscribe((newTool: any) => {
      this.toolGroup.selectedIndex = this[newTool.tool].position;
    });
  }

}

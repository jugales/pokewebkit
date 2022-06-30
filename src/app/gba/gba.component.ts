import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { GbaService } from './services/gba.service';
import { SaveDialogGbaComponent } from './components/save-dialog-gba/save-dialog-gba.component';
import { MonsterService } from './services/monster/monster.service';
import { ItemService } from './services/item/item.service';
import { TrainerService } from './services/world/trainer.service';
import { OverworldService } from './services/world/overworld.service';
import { GlobalService } from '../services/global.service';

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
    { 
      id: 'battles', 
      url: '/gba/battlefields', 
      name: 'Battle Editor'
    }, // Battlefield is too long of a word for the header on mobile
    { 
      id: 'items', 
      url: '/gba/items', 
      name: 'Item Editor'
    },
    { 
      id: 'monsters', 
      url: '/gba/monsters', 
      name: 'Monster Editor'
    },
    { 
      id: 'trainers', 
      url: '/gba/trainers', 
      name: 'Trainer Editor'
    },
    { 
      id: 'world', 
      url: '/gba/world', 
      name: 'World Editor'
    },
  ];

  constructor(public gbaService: GbaService, private dialog: MatDialog, private router: Router,
    private monsterService: MonsterService, private itemService: ItemService,
    private trainerService: TrainerService, private overworldService: OverworldService,
    private globalService: GlobalService) { }

  ngOnInit(): void {
    this.gbaService.markLoaded();

    // To avoid ExpressionChangedAfterItHasBeenCheckedError, setTimeout :(
    setTimeout(() => {
      this.romLoadTime = this.gbaService.romLoadTime;
      this.loadToolSprites();
      this.isLoaded = true;
    });

    this.currentRoute = this.router.url;
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    })
  }

  public goToTool(tool: any) {
    this.globalService.isAppLoading = true;
    this.router.navigate([tool.url]);
  }

  public saveChanges() {
    this.dialog.open(SaveDialogGbaComponent);
  }

  public getTool(id: string): any {
    return this.tools.filter((value: any) => value.id === id)[0];
  }

  private loadToolSprites() {
    this.getTool('battles').image = this.monsterService.loadBattleSprite(3, false, true);
    this.getTool('items').image = this.itemService.loadSprite(1, true);
    this.getTool('monsters').image = this.monsterService.loadBattleSprite(6, true, true);
    this.getTool('trainers').image = this.trainerService.loadSprite(0, true);
    this.getTool('world').image = this.overworldService.getOverworldSpriteContextualized(71, 0, false).toDataURL();
  }
}

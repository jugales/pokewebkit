import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OverworldService, PokeOverworldSprite } from 'src/app/gba/services/overworld.service';
import { RomService } from 'src/app/gba/services/rom.service';
import { OverworldPaletteEditorDialogComponent } from './dialogs/overworld-palette-editor-dialog/overworld-palette-editor-dialog.component';

@Component({
  selector: 'app-overworld-editor',
  templateUrl: './overworld-editor.component.html',
  styleUrls: ['./overworld-editor.component.css']
})
export class OverworldEditorComponent implements OnInit {

  public currentOverworld: PokeOverworldSprite;
  public sprite: any;

  public isLoaded: boolean = false;

  constructor(public romService: RomService, public overworldService: OverworldService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.currentOverworld = this.overworldService.getOverworld(0);
    this.isLoaded = true;
  }

  public showPalettes() {
    this.dialog.open(OverworldPaletteEditorDialogComponent, { data: { palettes: this.overworldService.overworldPalettes } });
  }
}

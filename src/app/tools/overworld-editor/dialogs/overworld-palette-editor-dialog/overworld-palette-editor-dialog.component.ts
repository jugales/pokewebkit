import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BitmapPalette } from 'src/app/services/bitmap.service';

@Component({
  selector: 'app-overworld-palette-editor-dialog',
  templateUrl: './overworld-palette-editor-dialog.component.html',
  styleUrls: ['./overworld-palette-editor-dialog.component.css']
})
export class OverworldPaletteEditorDialogComponent implements OnInit {

  public palettes: BitmapPalette[] = [];

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any) { 
    this.palettes = data.palettes;
  }

  ngOnInit(): void {
  }

  public close() {
    this.dialog.closeAll();
  }
}

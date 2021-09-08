import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GbaService } from './services/rom.service';
import { SaveDialogComponent } from './save-dialog/save-dialog.component';

@Component({
  selector: 'app-gba',
  templateUrl: './gba.component.html',
  styleUrls: ['./gba.component.css']
})
export class GbaComponent implements OnInit {

  constructor(public gbaService: GbaService, private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    
  }

  public switchToEditor(editor: string) {
    this.router.navigate(['/' + editor]);
  }

  public saveChanges() {
    this.dialog.open(SaveDialogComponent);
  }
}

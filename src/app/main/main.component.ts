import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RomService } from '../services/rom.service';
import { SaveDialogComponent } from './save-dialog/save-dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public romService: RomService, private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    
  }

  public switchToEditor(editor: string) {
    this.router.navigate(['/' + editor]);
  }

  public saveChanges() {
    this.dialog.open(SaveDialogComponent);
  }
}

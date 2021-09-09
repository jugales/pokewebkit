import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NdsService } from './services/nds.service';
import { SaveDialogNdsComponent } from './save-dialog-nds/save-dialog-nds.component';

@Component({
  selector: 'app-nds',
  templateUrl: './nds.component.html',
  styleUrls: ['./nds.component.css']
})
export class NdsComponent implements OnInit {

  constructor(public ndsService: NdsService, private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    
  }

  public switchToEditor(editor: string) {
    this.router.navigate(['/' + editor]);
  }

  public saveChanges() {
    this.dialog.open(SaveDialogNdsComponent);
  }
}

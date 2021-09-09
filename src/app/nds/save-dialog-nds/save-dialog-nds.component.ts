import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CharacterSetService } from 'src/app/gba/services/character-set.service';
import { PendingChange } from 'src/app/nds/services/nds.service';
import { NdsService } from '../services/nds.service';

@Component({
  selector: 'app-save-dialog-nds',
  templateUrl: './save-dialog-nds.component.html',
  styleUrls: ['./save-dialog-nds.component.css']
})
export class SaveDialogNdsComponent implements OnInit {

  constructor(private dialog: MatDialog, public ndsService: NdsService,
    public characterSetService: CharacterSetService) { }

  ngOnInit(): void {
  }

  public save() {
    this.ndsService.save();
    this.close();
  }

  public close() {
    this.dialog.closeAll();
  }

  public undoChange(change: PendingChange) {
    this.ndsService.pendingChanges.delete(change.key);

    if (this.ndsService.pendingChanges.size == 0) {
      this.close();
    }
  }
}

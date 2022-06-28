import { AfterContentChecked, AfterContentInit, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PorkyScriptCommandTemplate } from 'src/app/gba/structures/porky-script-constants';
import { PorkyScript, PorkyScriptService } from 'src/app/gba/services/scripting/porky-script.service';

@Component({
  selector: 'app-script-editor-dialog',
  templateUrl: './script-editor-dialog.component.html',
  styleUrls: ['./script-editor-dialog.component.css']
})
export class ScriptEditorDialogComponent implements AfterContentInit, AfterContentChecked {

  public scriptAddress: number = 0;
  public script: PorkyScript;
  public scriptText: string = '';
  public isLoading: boolean = true;

  public currentLine: number = 0;
  public currentLineCommand: PorkyScriptCommandTemplate;

  @ViewChild('scriptEditor') scriptEditorElement: any;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, 
    private scriptService: PorkyScriptService, private changeDetector: ChangeDetectorRef) {   
    this.scriptAddress = data.address;
  }

  // use these lifecycle hooks to better work with the code editor and avoid change detection errors
  ngAfterContentInit(): void {
    this.script = this.scriptService.decompile(this.scriptAddress);
    this.scriptText = this.scriptService.toXSE(this.script);
    this.isLoading = false;

    setTimeout(() => this.scriptEditorElement.codeMirror.refresh(), 1500);
  }
  ngAfterContentChecked(): void {
    this.refresh();
  }

  public refresh() {
    if (this.scriptEditorElement && this.scriptEditorElement.codeMirror)
      this.scriptEditorElement.codeMirror.refresh();
    this.changeDetector.detectChanges();
  }

  public close() {
    this.dialog.closeAll();
  }

  public updateCurrentLine(event: any) {
    this.currentLine = event.getCursor().line;
    let commandText: string = this.scriptText.split('\n')[this.currentLine];
    let commandLabel: string = commandText.split(' ')[0];
    this.currentLineCommand = this.scriptService.getCommand(commandLabel);
  }

  public saveScript() {
    // TODO
  }
}

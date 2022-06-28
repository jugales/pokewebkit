import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorldRoutingModule } from './world-routing.module';
import { WorldComponent } from './world.component';
import { BlockEditorDialogComponent } from './dialogs/block-editor-dialog/block-editor-dialog.component';
import { DoorEditorDialogComponent } from './dialogs/door-editor-dialog/door-editor-dialog.component';
import { FieldEditorDialogComponent } from './dialogs/field-editor-dialog/field-editor-dialog.component';
import { ScriptEditorDialogComponent } from './dialogs/script-editor-dialog/script-editor-dialog.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';


@NgModule({
  declarations: [
    WorldComponent,
    BlockEditorDialogComponent,
    DoorEditorDialogComponent,
    FieldEditorDialogComponent,
    ScriptEditorDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    CodemirrorModule,
    WorldRoutingModule
  ]
})
export class WorldModule { }

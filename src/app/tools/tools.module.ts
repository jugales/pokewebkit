import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldEditorComponent } from './world-editor/world-editor.component';
import { BattlefieldEditorComponent } from './battlefield-editor/battlefield-editor.component';
import { MonsterEditorComponent } from './monster-editor/monster-editor.component';
import { TrainerEditorComponent } from './trainer-editor/trainer-editor.component';
import { PluginEditorComponent } from './plugin-editor/plugin-editor.component';
import { MaterialModule } from '../material.module';
import { FormsModule } from '@angular/forms';
import { ItemEditorComponent } from './item-editor/item-editor.component';
import { GameStartEditorComponent } from './game-start-editor/game-start-editor.component';
import { BlockEditorDialogComponent } from './world-editor/dialogs/block-editor-dialog/block-editor-dialog.component';
import { DoorEditorDialogComponent } from './world-editor/dialogs/door-editor-dialog/door-editor-dialog.component';
import { FieldEditorDialogComponent } from './world-editor/dialogs/field-editor-dialog/field-editor-dialog.component';
import { OverworldEditorComponent } from './overworld-editor/overworld-editor.component';
import { OverworldPaletteEditorDialogComponent } from './overworld-editor/dialogs/overworld-palette-editor-dialog/overworld-palette-editor-dialog.component';
import { ScriptEditorDialogComponent } from './world-editor/dialogs/script-editor-dialog/script-editor-dialog.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

const components = [
  WorldEditorComponent,
  BattlefieldEditorComponent,
  MonsterEditorComponent,
  TrainerEditorComponent,
  PluginEditorComponent,
  ItemEditorComponent,
  GameStartEditorComponent,
  BlockEditorDialogComponent,
  DoorEditorDialogComponent,
  FieldEditorDialogComponent,
  ScriptEditorDialogComponent,
  OverworldEditorComponent,
  OverworldPaletteEditorDialogComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    CodemirrorModule
  ],
  exports: [
    ...components
  ]
})
export class ToolsModule { }

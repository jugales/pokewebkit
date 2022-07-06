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
import { MapCardComponent } from './components/map-card/map-card.component';
import { BlocksetMinitoolComponent } from './components/minitools/blockset-minitool/blockset-minitool.component';
import { MapRendererComponent } from './components/map-renderer/map-renderer.component';
import { MovementMinitoolComponent } from './components/minitools/movement-minitool/movement-minitool.component';
import { EntityMinitoolComponent } from './components/minitools/entity-minitool/entity-minitool.component';
import { EncounterMinitoolComponent } from './components/minitools/encounter-minitool/encounter-minitool.component';
import { HeaderToolComponent } from './components/tools/header-tool/header-tool.component';
import { LayoutToolComponent } from './components/tools/layout-tool/layout-tool.component';


@NgModule({
  declarations: [
    WorldComponent,
    MapCardComponent,
    BlockEditorDialogComponent,
    DoorEditorDialogComponent,
    FieldEditorDialogComponent,
    ScriptEditorDialogComponent,
    BlocksetMinitoolComponent,
    MapRendererComponent,
    MovementMinitoolComponent,
    EntityMinitoolComponent,
    EncounterMinitoolComponent,
    HeaderToolComponent,
    LayoutToolComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    WorldRoutingModule
  ]
})
export class WorldModule { }

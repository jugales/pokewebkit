import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileEditorComponent } from './file-editor/file-editor.component';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    FileEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  exports: [
    FileEditorComponent
  ]
})
export class ToolsModule { }

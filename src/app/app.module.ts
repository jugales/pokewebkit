import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GbaComponent } from './gba/gba.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { RomSelectComponent } from './rom-select/rom-select.component';
import { FormsModule } from '@angular/forms';
import { GbaService } from './gba/services/rom.service';
import { CharacterSetService } from './gba/services/character-set.service';
import { MonsterService } from './gba/services/monster.service';
import { SaveDialogComponent } from './gba/save-dialog/save-dialog.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

@NgModule({
  declarations: [
    AppComponent,
    GbaComponent,
    RomSelectComponent,
    SaveDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    MaterialModule,
    CodemirrorModule
  ],
  providers: [
    GbaService,
    CharacterSetService,
    MonsterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

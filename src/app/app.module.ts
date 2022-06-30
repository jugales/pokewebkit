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
import { GbaService } from './gba/services/gba.service';
import { CharacterSetService } from './gba/services/character-set.service';
import { MonsterService } from './gba/services/monster/monster.service';
import { SaveDialogGbaComponent } from './gba/components/save-dialog-gba/save-dialog-gba.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NdsComponent } from './nds/nds.component';
import { SaveDialogNdsComponent } from './nds/save-dialog-nds/save-dialog-nds.component';
import { GlobalService } from './services/global.service';

@NgModule({
  declarations: [
    AppComponent,
    GbaComponent,
    NdsComponent,
    RomSelectComponent,
    SaveDialogGbaComponent,
    SaveDialogNdsComponent
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
    MonsterService,
    GlobalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { RomSelectComponent } from './rom-select/rom-select.component';
import { FormsModule } from '@angular/forms';
import { RomService } from './services/rom.service';
import { CharacterSetService } from './services/character-set.service';
import { MonsterService } from './services/monster.service';
import { SaveDialogComponent } from './main/save-dialog/save-dialog.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
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
    RomService,
    CharacterSetService,
    MonsterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

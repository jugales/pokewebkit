import { Injectable } from '@angular/core';
import { GbaService } from './gba.service';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  public midiSounds: MidiSound[] = [];

  constructor(private gbaService: GbaService) { 
    if (gbaService.isLoaded())
      this.loadMidiSounds();

    gbaService.romLoaded.subscribe(() => {
      this.midiSounds = []; // reset
      this.loadMidiSounds();
    });
  }

  private loadMidiSounds() {
    // TODO
  }

}
export class MidiSound {

  constructor(
    public uid?: number,
    public address?: number,
    public buffer?: ArrayBuffer,
    public json?: string) { }

}
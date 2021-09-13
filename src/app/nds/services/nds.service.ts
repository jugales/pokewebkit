import { EventEmitter } from '@angular/core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NdsService {

  public header: NdsRomHeader = new NdsRomHeader();

  public position: number = 0;
  public readBuffer: DataView;
  public writeBuffer: DataView;

  public romLoadTime: number = 0;
  public isLoaded: boolean = false;
  public onRomLoad: EventEmitter<any> = new EventEmitter<any>();

  public pendingChanges: Map<String, PendingChange> = new Map<String, PendingChange>();

  constructor() { }

  public loadRom(buffer: ArrayBuffer, startTime?: number) {
    if (!startTime)
      startTime = Date.now();

    this.readBuffer = new DataView(buffer);
    this.writeBuffer = new DataView(buffer.slice(0)); // copy-of as writable, so we can manipulate the readable without real editing

    this.loadHeader();
    this.romLoadTime = Date.now() - startTime;
    this.isLoaded = true;
    this.onRomLoad.emit();

    console.log('Loaded NDS ROM in ' + this.romLoadTime);
  }

  private loadHeader() {
    this.goTo(0);
    let header: NdsRomHeader = new NdsRomHeader();
    header.title = this.getString(12);
    header.gameCode = this.getString(4);
    this.skip(3);
    header.encryptionKey = this.getByte();
    this.goTo(30);
    header.version = this.getByte();
    this.skip(33);
    header.fntOffset = this.getInt();
    header.fntLength = this.getInt();
    header.fatOffset = this.getInt();
    header.fatLength = this.getInt();
    this.header = header;
  }

  public save() {
    // TODO
  }

  public goTo(position: number) {
    this.position = position;
  }

  public skip(amount: number) {
    this.position += amount;
  }

  public getByte(position?: number) {
    if (position)
      this.position = position;

    let result = this.readBuffer.getUint8(this.position);
    this.position++;
    return result;
  }

  public getShort(position?: number) {
    if (position)
      this.position = position;

    let result = this.readBuffer.getUint16(this.position, true);
    this.position += 2;
    return result;
  }

  public getInt(position?: number) {
    if (position)
    this.position = position;

    let result = this.readBuffer.getUint32(this.position, true);
    this.position += 4;
    return result;
  }

  public getBytes(length: number) {
    let result: number[] = [];
    for (let i = 0; i < length; i++)
      result.push(this.getByte());
    return result;
  }

  public getShorts(length: number) {
    let result: number[] = [];
    for (let i = 0; i < length; i++)
      result.push(this.getShort());
    return result;
  }

  public getInts(length: number) {
    let result: number[] = [];
    for (let i = 0; i < length; i++)
      result.push(this.getInt());
    return result;
  }

  public getString(length: number) {
    let byteResult: number[] = this.getBytes(length);
    let result = '';
    for (let i = 0; i < byteResult.length; i++) {
      if (byteResult[i] == 0 || byteResult[i] == 1) {
        result += ' ';
        continue;
      }

      if (byteResult[i] <= 127 || String.fromCharCode(byteResult[i]) == 'é') {
        result += String.fromCharCode(byteResult[i]);
      }
      
    }
      
    return result.trim();
  }
}
export class NdsRomHeader {

  constructor(
    public title?: string,
    public gameCode?: string,
    public version?: number,
    public encryptionKey?: number,
    // public fileLength?: number,
    // public arm9RomOffset?: number,
    // public arm9EntryAddress?: number,
    // public arm9LoadAddress?: number,
    // public arm9Length?: number,
    // public arm7RomOffset?: number,
    // public arm7EntryAddress?: number,
    // public arm7LoadAddress?: number,
    // public arm7Length?: number,
    public fntOffset?: number,
    public fntLength?: number,
    public fatOffset?: number,
    public fatLength?: number
  ) { }
}
export class PendingChange {

  constructor(
    public key?: string, // used for lookup and update to a change
    public changeReason?: string, // displayed before saving
    public address?: number, // address to write at; displayed before saving
    public repointAddress?: number, // if the address needs to be changed (e.g. data size constraints and data was enlarged)
    public repointAt: number[] = [],
    public bytesBefore: number[] = [], // for comparison
    public bytesToWrite?: any, // bytes to overwrite with; displayed before saving
    public isTextUpdated: boolean = false // used to display text instead of bytes in comparison
  ) { }
}

import { Injectable, EventEmitter } from '@angular/core';
import { CharacterSetService } from './character-set.service';
import { RomConstants } from '../structures/rom-constants';
import { saveAs } from 'file-saver-es';

@Injectable({
  providedIn: 'root'
})
export class GbaService {

  private HEADER_TITLE_ADDRESS: number = 0xA0;
  private HEADER_TITLE_LENGTH: number = 12;
  private HEADER_GAME_CODE_LENGTH: number = 4;
  private HEADER_MAKER_CODE_LENGTH: number = 2;
  private HEADER_VERSION_ADDRESS: number = 0xBC;

  public position: number = 0;

  public header: RomHeader = new RomHeader();
  public romLoaded: EventEmitter<any> = new EventEmitter<any>();

  public toolsLoaded: number = 0;
  public toolCount: number = 5;
  public allToolsLoaded: EventEmitter<any> = new EventEmitter<any>();
  public romLoadTime: number;

  public toolSwitched: EventEmitter<any> = new EventEmitter<any>();
  
  private romLoadStartTime: number;

  public readBuffer: DataView;
  public writeBuffer: DataView;

  public pendingChanges: Map<String, PendingChange> = new Map<String, PendingChange>();;

  public romConstants: RomConstants = new RomConstants();

  constructor(private characterSetService: CharacterSetService) { }

  
  public loadRom(buffer: ArrayBuffer, startTime?: number) {
    if (!startTime)
      startTime = Date.now();
    this.romLoadStartTime = startTime;

    this.readBuffer = new DataView(buffer);
    this.writeBuffer = new DataView(buffer.slice(0)); // copy-of as writable, so we can manipulate the readable (e.g. tile animations) without real editing

    this.loadHeader();
  }

  private loadHeader() {
    this.goTo(this.HEADER_TITLE_ADDRESS);
    this.header.title = this.getString(this.HEADER_TITLE_LENGTH);
    this.header.gameCode = this.getString(this.HEADER_GAME_CODE_LENGTH);
    this.header.makerCode = this.getString(this.HEADER_MAKER_CODE_LENGTH);
    this.header.version = this.getByteAt(this.HEADER_VERSION_ADDRESS);

    if (!(this.header.gameCode == 'BPRE' || this.header.gameCode == 'BPEE')) {
      return;
    }

    this.header.isLoaded = true;
    this.romLoaded.emit();
  }

  public isLoaded() {
    return this.header.isLoaded;
  }

  public markLoaded() {
    this.romLoadTime = Date.now() - this.romLoadStartTime;
  }

  public markToolLoaded() {
    this.toolsLoaded++;
    if (this.toolsLoaded == this.toolCount) {
      this.romLoadTime = Date.now() - this.romLoadStartTime;
      this.allToolsLoaded.emit();
    }
  }

  public goTo(newPosition: number) {
    this.position = newPosition;
  }

  public skip(amount: number) {
    this.position += amount;
  }

  public findFreeSpaceAddresses(dataSize: number, addressCount: number) {
    let freeSpaceAddresses: number[] = [];
    let searchPosition: number = this.constants().FREE_SPACE_START;
    for (let i = 0; i < addressCount; i++) {
      let isValidSpace: boolean = false;
      while (!isValidSpace) {
        this.goTo(searchPosition);
        let bytes: number[] = this.getBytes(dataSize);
        if (bytes.every( (val) => val === 255 )) {
          freeSpaceAddresses.push(this.position);
          searchPosition += dataSize;
          break;
        } else {
          searchPosition += 4;
        }
      }
    }

    return freeSpaceAddresses;
  }

  public backtrack(amount: number) {
    this.position -= amount;
  }

  public getByte() {
    let result = this.readBuffer.getUint8(this.position);
    this.position++;
    return result;
  }

  public getByteAt(position: number) {
    this.position = position;
    return this.getByte();
  }

  public getShort() {
    let result = this.readBuffer.getUint16(this.position, true);
    this.position += 2;
    return result;
  }

  public getInt() {
    let result = this.readBuffer.getUint32(this.position, true);
    this.position += 4;
    return result;
  }

  public getPointer() {
    return this.getInt() & 0x1FFFFFF;
  }

  public getShortAt(position: number) {
    this.position = position;
    return this.getShort();
  }

  public getBytes(length: number) {
    let result: number[] = [];
    for (let i = 0; i < length; i++) {
      result.push(this.getByte());
    }
    return result;
  }

  public toBitString(value: number, bitCount: number) {
    let baseBits: string = '';
    for (let i = 0; i < bitCount; i++) 
      baseBits += '0';
    return (baseBits + value.toString(2)).substr(-bitCount)
  }

  public getString(length: number) {
    let byteResult = this.getBytes(length);
    let stringResult: string = '';
    for (let i = 0; i < byteResult.length; i++) {
      stringResult += String.fromCharCode(byteResult[i]);
    }
    return stringResult;
  }

  public getGameString(length: number) {
    let byteResult = this.getBytes(length);
    let stringResult: string = '';

    for (let i = 0; i < byteResult.length; i++) {
      stringResult += this.characterSetService.getLetter(byteResult[i]);

      if (stringResult.endsWith('|end|')) {
        stringResult = stringResult.substring(0, stringResult.length - 5);
        break;
      }
      
    }

    return stringResult;
  }

  public getGameStringAutoList(maxEntries: number) {
    let stringResult: string = '';
    let arrayResult: string[] = [];

    while (arrayResult.length < maxEntries) {
      let byteResult = this.getByte();
      let letter = this.characterSetService.getLetter(byteResult);
      
      if (letter !== '|end|') {
        stringResult += letter;
      } else {
        if (stringResult.trim() !== '')
          arrayResult.push(stringResult.trim());
        stringResult = '';
      }

    }
    return arrayResult;
  }

  public writeBytes(values: number[], isWriteToReadable?: boolean) {
    for (let i = 0; i < values.length; i++) {
      this.writeByte(values[i], isWriteToReadable);
    }
  }

  public writeByte(value: number, isWriteToReadable?: boolean) {
    if (!isWriteToReadable) {
      this.writeBuffer.setUint8(this.position++, value);
    } else {
      this.readBuffer.setUint8(this.position++, value);
    }
  }

  public writeShort(value: number, isWriteToReadable?: boolean) {
    if (!isWriteToReadable) {
      this.writeBuffer.setUint16(this.position, value);
    } else {
      this.readBuffer.setUint16(this.position, value);
    }
    this.position += 2;
  }

  public bytesFromShort(value: number) {
    let values: number[] = new Array(2);
    let bigEndian: string = value.toString(16)
    
    while (bigEndian.length < 4)
      bigEndian = '0' + bigEndian;

    bigEndian = bigEndian.match(/.{0,2}/g).reverse().join('');

    values[0] = Number.parseInt(bigEndian.substring(0, 2), 16);
    values[1] = Number.parseInt(bigEndian.substring(2, 4), 16);

    return values;
  }

  public bytesFromInt(value: number) {
    let values: number[] = new Array(2);
    let bigEndian: string = value.toString(16)
    
    while (bigEndian.length < 8)
      bigEndian = '0' + bigEndian;

    bigEndian = bigEndian.match(/.{0,2}/g).reverse().join('');

    values[0] = Number.parseInt(bigEndian.substring(0, 2), 16);
    values[1] = Number.parseInt(bigEndian.substring(2, 4), 16);
    values[2] = Number.parseInt(bigEndian.substring(4, 6), 16);
    values[3] = Number.parseInt(bigEndian.substring(6, 8), 16);

    return values;
  }

  public bytesFromPointer(value: number) {
    let values: number[] = new Array(3);
    let bigEndian: string = value.toString(16)
    
    while (bigEndian.length < 6)
      bigEndian = '0' + bigEndian;

    bigEndian = bigEndian.match(/.{0,2}/g).reverse().join('');

    values[0] = Number.parseInt(bigEndian.substring(0, 2), 16);
    values[1] = Number.parseInt(bigEndian.substring(2, 4), 16);
    values[2] = Number.parseInt(bigEndian.substring(4, 6), 16);
    values[3] = 8;

    return values;
  }

  public isValidPointer(potentialPointer: number) {
    return potentialPointer > 0x8000000 && potentialPointer % 2 == 0 && (potentialPointer - 0x8000000) < this.readBuffer.byteLength;
  }

  public toPointer(pointer: number) {
    return pointer + 0x8000000;
  }

  public writeInt(value: number, isWriteToReadable?: boolean) {
    if (!isWriteToReadable) {
      this.writeBuffer.setUint32(this.position, value, true);
    } else {
      this.readBuffer.setUint32(this.position, value, true);
    }
  }

  public writePointer(value: number, isWriteToReadable?: boolean) {
    let byteValues = new Uint8Array(this.toBytesInt32(value));
    byteValues[0] = 8;
    byteValues.reverse();

    let nums: number[] = [];
    for (let i = 0; i < byteValues.length; i++)
      nums[i] = byteValues[i];

    this.writeBytes(nums, isWriteToReadable);
  }

  public toBytesInt32 (num) {
    let arr = new Uint8Array([
         (num & 0xff000000) >> 24,
         (num & 0x00ff0000) >> 16,
         (num & 0x0000ff00) >> 8,
         (num & 0x000000ff)
    ]);
    return arr.buffer;
  }

  public toBytesInt16 (num) {
    let arr = new Uint8Array([
         (num & 0x0000ff00) >> 8,
         (num & 0x000000ff)
    ]);
    return arr.buffer;
  }

  public reverseByteBinary(value: number) {
    let valueString = value.toString(2);
    while (valueString.length < 32)
      valueString = '0' + valueString;
    
    return parseInt(valueString.split("").reverse().join(""), 2);
  }

  public revert() {
    this.reset();
    this.loadRom(this.readBuffer.buffer);

    this.romLoaded.emit();
  }

  public reset() {
    this.position = 0;
    this.header = new RomHeader();
    this.readBuffer = undefined;
    this.writeBuffer = undefined;
  }

  public constants() {
    let localCode = this.header.gameCode + (this.header.gameCode === 'BPRE' ? this.header.version.toString() : '');
    return this.romConstants.constants[localCode];
  }

  public queueChange(pendingChange: PendingChange) {
    // check if change is real
    if (pendingChange.bytesBefore.slice(0).toString() == pendingChange.bytesToWrite.slice(0).toString()) {
      // if the change is pending already (and this was an update) revert
      if (this.pendingChanges.has(pendingChange.key))
        this.pendingChanges.delete(pendingChange.key);
      return;
    }
    // only executes if change is determined valid above
    this.pendingChanges.set(pendingChange.key, pendingChange);
  }

  public save() {
    if (this.pendingChanges.size > 0) {
      for (let [key, value] of this.pendingChanges.entries()) {
        let pendingChange: PendingChange = value;

        // flush existing full length to avoid weird post-string data from staying
        this.goTo(pendingChange.address)
        for (let i = 0; i < pendingChange.bytesBefore.length; i++)
          this.writeByte(0xFF);

        let writeData: Int8Array = pendingChange.bytesToWrite;
        if (!pendingChange.repointAddress) {
          this.goTo(pendingChange.address);
          for (let i = 0; i < writeData.length; i++) {
            this.writeByte(writeData[i], false);
          }
        } else {
          this.goTo(pendingChange.repointAddress);
          for (let i = 0; i < writeData.length; i++) {
            this.writeByte(writeData[i], false);
          }
          for (let i = 0; i < pendingChange.repointAt.length; i++) {
            this.goTo(pendingChange.repointAt[i]);
            this.writePointer(pendingChange.repointAddress);
          }
        }
      }

      let blob = new Blob([new Uint8Array(this.writeBuffer.buffer)], { type: "application/octet-stream" });
      saveAs(blob, this.header.gameCode + + '-1.' + this.header.version + ".gba");
    }

    this.pendingChanges.clear();
  }
}
export class RomHeader {

  constructor(
    public title?: string,
    public gameCode?: string,
    public makerCode?: string,
    public version?: number,
    public isLoaded: boolean = false
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

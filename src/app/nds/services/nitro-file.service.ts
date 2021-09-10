import { EventEmitter } from '@angular/core';
import { Injectable } from '@angular/core';
import { NdsService } from './nds.service';

@Injectable({
  providedIn: 'root'
})
export class NitroFileService {

  public fileAllocationTable: NitroFAT;
  public fileNameTable: NitroFNT;

  public isLoaded: boolean = false;
  public onFileSystemLoad: EventEmitter<any> = new EventEmitter<any>();

  constructor() { 

  }

  public load(ndsService: NdsService) {
    this.fileAllocationTable = new NitroFAT(ndsService);
    this.fileNameTable = new NitroFNT(ndsService, this.fileAllocationTable);
    this.isLoaded = true;
    this.onFileSystemLoad.emit();
  }

  public getFileByType(type: string, path: string) {
    if (type === 'NARC') {
      // TODO
    }
    return null;
  }

  public getFile(path: string) {
    let pathData: string[] = path.split('/');
    let fileName = pathData[pathData.length - 1];

    let folderPath: string = '';
    for (let i = 0; i < pathData.length - 1; i++)
      folderPath += pathData[i] + (i !== pathData.length - 2 ? '/' : '');

    let folder: NitroFolder = this.getFolder(folderPath);
    return this.getFileInFolder(folder, fileName);
  }

  public getFolder(path: string) {
    let folderNames: String[] = path.split('/');
    let folders: NitroFolder[] = new Array(folderNames.length);
    let currentFolder: NitroFolder = this.fileNameTable.root;

    for (let i = 0; i < folders.length; i++) {
      folders[i] = this.getFolderInFolder(currentFolder, <string>folderNames[i]);

      if (i == (folders.length - 1)) {
        return folders[i];
      }

      currentFolder = folders[i];
    }
    return undefined;
  }

  private getFolderInFolder(folder: NitroFolder, name: string) {
    for (let i = 0; i < folder.folders.length; i++) {
      let currentFolder: NitroFolder = folder.folders[i];

      if (name === currentFolder.name)
        return currentFolder;
    }
    return undefined;
  }

  private getFileInFolder(folder: NitroFolder, fileName: string) {
    for (let i = 0; i < folder.files.length; i++) {
      let currentFile: NitroFileInfo = folder.files[i];

      if (fileName === currentFile.name)
        return currentFile;
    }
    return undefined;
  }
}
export class NitroFAT {

  public entries: NitroFATEntry[] = [];

  constructor(
    private ndsService: NdsService
  ) { 
    this.ndsService.goTo(this.ndsService.header.fatOffset);
    for (let i = 0; i < ndsService.header.fatLength / 8; i++) {
      let entry: NitroFATEntry = new NitroFATEntry();
      entry.offset = ndsService.getInt();
      entry.size = ndsService.getInt();

      this.entries.push(entry);
    }
  }

}
export class NitroFATEntry {

  constructor(
    public offset?: number,
    public size?: number
  ) { }

}
export class NitroFNT {

  public root: NitroFolder;

  constructor(public ndsService: NdsService, fat: NitroFAT) { 
    let fatEntries: NitroFATEntry[] = fat.entries;
    let directoryCount: number = ndsService.getShort(ndsService.header.fntOffset + 6);

    let mains: NitroFolderRoot[] = [];

    ndsService.goTo(ndsService.header.fntOffset);
    for (let i = 0; i < directoryCount; i++) {
      let main: NitroFolderRoot = new NitroFolderRoot();
      main.offset = ndsService.getInt();
      main.firstFileId = ndsService.getShort();
      main.parentFolderId = ndsService.getShort();

      if (i !== 0 && ndsService.position > ndsService.header.fntOffset + (mains.length > 0 ? mains[0].offset : 0)) {
        directoryCount--;
        i--;
        continue;
      }

      let revertAddress: number = ndsService.position;
      let fileId: number = main.firstFileId;

      ndsService.goTo(ndsService.header.fntOffset + main.offset);
      let nameLength: number = ndsService.getByte();
      while (nameLength !== 0) {
        if (nameLength < 0x80) { // File
          let file: NitroFileInfo = new NitroFileInfo();
          file.name = ndsService.getString(nameLength);
          file.id = fileId++;
          file.address = fatEntries[file.id].offset;
          file.size = fatEntries[file.id].size;
          file.path = ndsService.header.title; // changed on file load to real-time path

          let revertAddress2: number = ndsService.position;
          this.ndsService.goTo(file.address);
          file.format = this.getFileFormat(file.name, file.id, file.size);
          this.ndsService.goTo(revertAddress2);

          main.subFolder.files.push(file);
        } else { // Directory
          nameLength -= 0x80;
          
          let folder: NitroFolder = new NitroFolder();
          folder.name = ndsService.getString(nameLength);
          folder.id = ndsService.getShort();

          main.subFolder.folders.push(folder);
        }
        nameLength = ndsService.getByte();
      }

      mains.push(main);
      ndsService.goTo(revertAddress);
    }

    this.root = this.createFolder(mains, 0, 'root');
    this.root.id = directoryCount;
  }

  private createFolder(mains: NitroFolderRoot[], folderId: number, name: string) {
    let currentFolder = new NitroFolder();
    currentFolder.id = folderId;
    currentFolder.name = name;
    folderId &= 0xFFF;
    currentFolder.files = mains[folderId].subFolder.files;

    if (mains[folderId].subFolder.folders.length > 0) {
      for (let subFolder of mains[folderId].subFolder.folders) {
        currentFolder.folders.push(this.createFolder(mains, subFolder.id, subFolder.name));
      }
    }

    return currentFolder;
  }

  private getFileFormat(name: string, id: number, size: number) {
    if (size <= 0)
      return NitroFileFormat.Unknown;

    name = name.toUpperCase();
    if (name === 'FNT.BIN' || name === 'FAT.BIN' || name.startsWith('OVERLAY9_') || name.startsWith('OVERLAY7_')
      || name === 'ARM9.BIN' || name === 'ARM7.BIN' || name === 'Y9.BIN' || name === 'BANNER.BIN'
      || name.endsWith('.SRL') || name.endsWith('.NDS')) {
      return NitroFileFormat.System;
    }

    return NitroFileFormat.Unknown;
  } 
}
export enum NitroFileFormat {
  Palette,
  Tile,
  Map,
  Cell,
  Animation,
  FullImage,
  Text, 
  Video,
  Sound,
  Font,
  Compressed,
  Unknown,
  System,
  Script,
  Pack,
  Model3D,
  Texture
}
export class NitroFileInfo {

  constructor(
    public address?: number,
    public size?: number,
    public name?: string,
    public id?: number,
    public path?: string,
    public format?: NitroFileFormat,
    public tag?: any
  ) { }

}
export class NitroFolder {
 
  constructor(
    public folders: NitroFolder[] = [],
    public files: NitroFileInfo[] = [],
    public name?: string,
    public id?: number,
    public tag?: any
  ) { }

}
export class NitroFolderRoot {
 
  constructor(
    public offset?: number,
    public firstFileId?: number,
    public parentFolderId?: number,
    public subFolder: NitroFolder = new NitroFolder()
  ) { }

}

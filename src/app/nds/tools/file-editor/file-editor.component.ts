import { Component, OnInit } from '@angular/core';
import { BTX0 } from '../../file-types/BTX0';
import { NARC } from '../../file-types/NARC';
import { NitroFile, NitroHeaderType } from '../../file-types/NitroFile';
import { NdsService } from '../../services/nds.service';
import {  NitroFileInfo, NitroFileService, NitroFolder } from '../../services/nitro-file.service';
import { UtilService } from '../../services/util.service';


@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.css']
})
export class FileEditorComponent implements OnInit {

  public currentPath: string = 'root';
  public currentFolder: NitroFolder;

  public currentFile: NitroFile;
  public currentFileData: number[] = [];

  public hexPageSize: number = 512;
  public currentHexPage: number = 0;
  public currentHexPageCount: number = 1;

  constructor(public ndsService: NdsService, private fileService: NitroFileService,
    private utilityService: UtilService) { }

  ngOnInit(): void {
    if (this.ndsService.isLoaded && this.fileService.isLoaded)
      this.currentFolder = this.fileService.fileNameTable.root;

    this.ndsService.onRomLoad.subscribe(() => {
      if (this.fileService.isLoaded)
        this.currentFolder = this.fileService.fileNameTable.root;
    });
    this.fileService.onFileSystemLoad.subscribe(() => {
      if (this.ndsService.isLoaded)
        this.currentFolder = this.fileService.fileNameTable.root;
    });
  }

  public setCurrentFolder(folder: NitroFolder, ignorePathSet?: boolean) {
    this.currentFolder = folder;

    if (!ignorePathSet)
      this.currentPath += '/' + folder.name;
  }

  public setCurrentFile(fileInfo: NitroFileInfo) {
    this.currentFile = new NitroFile(this.ndsService, fileInfo);

    this.ndsService.goTo(fileInfo.address);
    this.currentFile.readHeader(NitroHeaderType.Length_12);

    switch (this.currentFile.header.extension) {
      case 'NARC':
        this.currentFile = new NARC(this.ndsService, fileInfo);
        break;
      case 'BTX0':
        this.currentFile = new BTX0(this.ndsService, fileInfo, this.utilityService);
        break;
    }

    this.currentFile.unpack();
    this.ndsService.goTo(fileInfo.address);
    this.currentFileData = this.ndsService.getBytes(fileInfo.size <= this.hexPageSize ? fileInfo.size : this.hexPageSize);
    this.currentHexPageCount = (Math.floor(fileInfo.size / this.hexPageSize)) + 1;
    this.currentHexPage = 0;
  }

  public goBack() {
    if (this.currentPath !== 'root') {
      let folderParts = this.currentPath.split('/');
      let parentFolderPath: string = '';
      for (let i = 0; i < folderParts.length - 1; i++)
        parentFolderPath += folderParts[i] + (i !== folderParts.length - 2 ? '/' : '');
  
      this.currentPath = parentFolderPath;
      console.log(parentFolderPath);
      let parentFolder: NitroFolder = undefined;
      if (parentFolderPath == 'root') {
        parentFolder = this.fileService.fileNameTable.root;
      } else {
        parentFolder = this.fileService.getFolder(parentFolderPath.replace('root/', ''));
      }
  
      this.currentPath = parentFolderPath;    
      this.setCurrentFolder(parentFolder, true);
    }
  }

  public goForwardHexPage() {
    if (this.currentHexPage + 1 >= this.currentHexPageCount)
      return;

    let isLastPage: boolean = this.currentHexPage + 2 == this.currentHexPageCount;

    this.currentHexPage++;
    this.ndsService.goTo(this.currentFile.fileInfo.address + (this.currentHexPage * this.hexPageSize));

    console.log(isLastPage);

    if (!isLastPage)
      this.currentFileData = this.ndsService.getBytes(this.hexPageSize);
    else
      this.currentFileData = this.ndsService.getBytes(Math.floor(this.currentFile.fileInfo.size % this.hexPageSize));
  }

  public goBackHexPage() {
    if (this.currentHexPage - 1 < 0)
      return;

    this.currentHexPage--;
    this.ndsService.goTo(this.currentFile.fileInfo.address + (this.currentHexPage * this.hexPageSize));
    this.currentFileData = this.ndsService.getBytes(this.hexPageSize);
  }

  public characterFromByte(number: number) {
    return String.fromCharCode(number);
  }

  public getInputHexValue(event: any) {
    let hexString: string = event.target.value;
    let hexTest = /[0-9A-Fa-f]{6}/g;
    let result: number = 0;

    // If valid hex number
    if (hexTest.test(hexString)) {
      result = Number.parseInt(hexString, 16);
    }
    
    return result;
  }

}


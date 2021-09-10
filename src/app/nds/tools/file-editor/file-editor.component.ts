import { Component, OnInit } from '@angular/core';
import { NdsService } from '../../services/nds.service';
import {  NitroFileInfo, NitroFileService, NitroFolder } from '../../services/nitro-file.service';


@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.css']
})
export class FileEditorComponent implements OnInit {

  public currentPath: string = 'root';
  public currentFolder: NitroFolder;

  public currentFile: NitroFileInfo;
  public currentFileData: number[] = [];

  public currentHexPage: number = 0;

  constructor(public ndsService: NdsService, private fileService: NitroFileService) { }

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

  public setCurrentFile(file: NitroFileInfo) {
    this.currentFile = file;

    this.ndsService.goTo(file.address);
    this.currentFileData = this.ndsService.getBytes(1024);
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
    this.currentHexPage++;
    this.ndsService.goTo(this.currentFile.address + (this.currentHexPage * 1024));
    this.currentFileData = this.ndsService.getBytes(1024);
  }

  public goBackHexPage() {
    if (this.currentHexPage - 1 < 0)
      return;

    this.currentHexPage--;
    this.ndsService.goTo(this.currentFile.address + (this.currentHexPage * 1024));
    this.currentFileData = this.ndsService.getBytes(1024);
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


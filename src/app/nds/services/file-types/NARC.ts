import { NdsService } from "../nds.service";
import { NitroFileInfo, NitroFolder } from "../nitro-file.service";
import { NitroFile, NitroHeaderType } from "./NitroFile";

export class NARC extends NitroFile {

    public fat: NarcFAT;
    public fnt: NarcFNT;
    public fimg: NarcFIMG;

    public folders: NitroFolder[] = [];
    public files: NitroFileInfo[] = [];

    constructor(
        public ndsService: NdsService, 
        public fileInfo: NitroFileInfo) { 
        super(ndsService, fileInfo);
        
        ndsService.goTo(fileInfo.address + 16);
        this.fat = new NarcFAT(fileInfo.address + 16);
        
        ndsService.goTo(fileInfo.address + 24);
        this.fnt = new NarcFNT(ndsService.getInt() * 8 + 28);

        ndsService.goTo(this.fnt.offset + 4);
        this.fimg = new NarcFIMG(ndsService.getInt() + this.fnt.offset);
    }

    public unpack() {
        this.ndsService.goTo(this.fileInfo.address);
        super.readHeader(NitroHeaderType.Length_12);

        this.ndsService.goTo(this.fat.offset);
        this.fat.id = this.ndsService.getString(4);
        this.fat.sectionSize = this.ndsService.getInt();
        this.fat.fileCount = this.ndsService.getInt();

        let entries: NarcFATEntry[] = new Array(this.fat.fileCount);
        for (let i = 0; i < entries.length; i++) {
            entries[i] = new NarcFATEntry();
            entries[i].offset = this.ndsService.getInt();
            entries[i].size = this.ndsService.getInt() - entries[i].offset;
        }
        this.fat.entries = entries;

        this.fnt.id = this.ndsService.getString(4);
        this.fnt.sectionSize = this.ndsService.getInt();

        let rootTableOffset: number = this.ndsService.position;
        this.fimg.offset = this.ndsService.position + this.fnt.sectionSize;

        this.ndsService.skip(6);
        let rootCount: number = this.ndsService.getShort();
        this.ndsService.goTo(this.ndsService.position - 8);

        for (let i = 0; i < rootCount; i++) {
            let main: NarcFNTRoot = new NarcFNTRoot();
            main.offset = this.ndsService.getInt();
            main.firstFileId = this.ndsService.getShort();
            main.parentFolderId = this.ndsService.getShort();
            let fileId: number = main.firstFileId;

            if (main.offset < 8) { // no names
                for (let j = 0; j < this.fat.fileCount; j++) {
                    let currentFile: NitroFileInfo = new NitroFileInfo();
                    currentFile.name = this.fileInfo.name + '_' + fileId;
                    currentFile.id = fileId++;

                    currentFile.path = this.fileInfo.path;
                    currentFile.size = this.fat.entries[currentFile.id].size;
                    currentFile.address = this.fat.entries[currentFile.id].offset + this.fimg.offset;

                    let revertPosition: number = this.ndsService.position;
                    this.ndsService.goTo(currentFile.address);

                    let baseExt: string = '';
                    if (currentFile.size < 4)
                        baseExt = this.ndsService.getString(currentFile.size);
                    else
                        baseExt = this.ndsService.getString(4);

                    let extension: string = '.';
                    for (let e = 0; e < baseExt.length; e++) {
                        let current: any = baseExt.charAt(e);

                        if (/^[a-zA-Z()]+$/.test(current) || !isNaN(current) || (current.charCodeAt(e) == 0x20))
                            extension += baseExt;
                    }

                    if (extension.length == 5 && currentFile.size >= 4) 
                        currentFile.name += extension;
                    else
                        currentFile.name += '.bin';

                    this.ndsService.goTo(revertPosition);
                    main.files.push(currentFile);
                }
                this.fnt.entries.push(main);
                continue;
            }

            let mainPosition: number = this.ndsService.position;
            this.ndsService.goTo(main.offset + rootTableOffset);

            let flag: number = 0x80;
            let id: number = this.ndsService.getByte();
            while (id !== 0) {
                if ((id & flag) == 0) { // File
                    let currentFile: NitroFileInfo = new NitroFileInfo();
                    currentFile.id = fileId++;

                    currentFile.name = this.ndsService.getString(currentFile.id)
                    currentFile.path = this.fileInfo.path;
                    currentFile.address = this.fat.entries[currentFile.id].offset;
                    currentFile.size = this.fat.entries[currentFile.id].size;

                    main.files.push(currentFile);
                } else { // Folder
                    let currentFolder: NitroFolder = new NitroFolder();
                    currentFolder.name = this.ndsService.getString(id - flag);
                    currentFolder.id = this.ndsService.getShort();

                    main.folders.push(currentFolder);
                }
                id = this.ndsService.getByte();
            }
            this.fnt.entries.push(main);
            this.ndsService.goTo(mainPosition);
        }

        let root: NitroFolder = this.createFolderRecursively(this.fnt.entries, 0xF000, 'root');
        for (let i = 0; i < root.files.length; i++)
            this.files.push(root.files[i]);
        for (let i = 0; i < root.folders.length; i++)
            this.folders.push(root.folders[i]);

        this.ndsService.goTo(this.fimg.offset - 8);
        this.fimg.id = this.ndsService.getString(4);
        this.fimg.sectionSize = this.ndsService.getInt();
    }

    private createFolderRecursively(entries: NarcFNTRoot[], folderId: number, folderName: string) {
        let folder: NitroFolder = new NitroFolder();
        folder.name = folderName;
        folder.id = folderId;
        folder.files = entries[folderId & 0xFFF].files;

        for (let subFolder of entries[folderId & 0xFFF].folders) 
            folder.folders.push(this.createFolderRecursively(entries, subFolder.id, subFolder.name));

        return folder;
    }
}
export class NarcFAT {

    public id?: string;
    public sectionSize: number;
    public fileCount: number;
    public entries: NarcFATEntry[] = []

    constructor(
        public offset: number
    ) { }
}
export class NarcFNT {

    public id: string;
    public sectionSize: number;
    public entries: NarcFNTRoot[] = [];

    constructor(
        public offset?: number
    ) { }
}
export class NarcFIMG {

    public id: string;
    public sectionSize: number;

    constructor(
        public offset: number
    ) { }
}
export class NarcFATEntry {

    constructor(
        public offset?: number,
        public size?: number
    ) { }
}
export class NarcFNTRoot {

    constructor(
        public offset?: number,
        public firstFileId?: number,
        public parentFolderId?: number,
        public folders: NitroFolder[] = [],
        public files: NitroFileInfo[] = []
    ) { }
}
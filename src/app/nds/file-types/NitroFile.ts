import { NdsService } from "../services/nds.service";
import { NitroFileInfo } from "../services/nitro-file.service";

export class NitroFile {

    public header: NitroHeader;

    constructor(
        public ndsService: NdsService,
        public fileInfo: NitroFileInfo
    ) { 

    }

    public readHeader(headerType: NitroHeaderType) {
        let header: NitroHeader = undefined
        switch (headerType) {
            case NitroHeaderType.Length_12:
                header = new NitroHeader();
                header.extension = this.ndsService.getString(4);
                header.endian = this.ndsService.getShort() == 0xFFFE ? 'BIG' : 'LITTLE';
                this.ndsService.skip(2);
                header.fileSize = this.ndsService.getInt();
                header.headerSize = this.ndsService.getShort();
                header.sectionCount = this.ndsService.getShort();
            break;
            case NitroHeaderType.Length_16:
                header = new NitroHeader();
                header.extension = this.ndsService.getString(4);
                header.endian = this.ndsService.getShort() == 0xFFFE ? 'BIG' : 'LITTLE';
                this.ndsService.skip(4);
                header.fileSize = this.ndsService.getInt();
                header.headerSize = this.ndsService.getInt();
                header.sectionCount = this.ndsService.getShort();
            break;
            case NitroHeaderType.Length_Long:
                header = new NitroHeader();
                header.extension = this.ndsService.getString(4);
                header.endian = this.ndsService.getShort() == 0xFFFE ? 'BIG' : 'LITTLE';
                this.ndsService.skip(2);
                header.fileSize = this.ndsService.getInt();
                header.headerSize = this.ndsService.getShort();
                header.sectionCount = this.ndsService.getShort();

                let offsets: number[] = new Array(header.sectionCount);
                for (let i = 0; i < offsets.length; i++)
                    offsets[i] = this.ndsService.getInt() + this.fileInfo.address + 4;
                header.sectionOffsets = offsets;
            break;
        }
        this.header = header;
    }
}
export class NitroHeader {

    public extension: string;
    public endian: string;
    public fileSize: number;
    public headerSize: number;
    public sectionCount: number;
    public sectionOffsets: number[]

    constructor() { }
    
}
export enum NitroHeaderType {

    Length_12,
    Length_16,
    Length_Long

}

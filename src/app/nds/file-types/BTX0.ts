import { NdsService } from "../services/nds.service";
import { NitroFileInfo } from "../services/nitro-file.service";
import { UtilService } from "../services/util.service";
import { NitroFile, NitroHeaderType } from "./NitroFile";

export class BTX0 extends NitroFile {

    public texture: BtxTexture;
    public frames: HTMLCanvasElement[] = [];

    constructor(ndsService: NdsService, fileInfo: NitroFileInfo, public utilService: UtilService) { 
        super(ndsService, fileInfo);
    }

    public unpack() {
        super.readHeader(NitroHeaderType.Length_12);
        
        let sectionOffsets: number[] = new Array(this.header.sectionCount);
        for (let i = 0; i < sectionOffsets.length; i++)
            sectionOffsets[i] = this.fileInfo.address + this.ndsService.getInt();

        this.ndsService.goTo(sectionOffsets[0]);
        this.texture = new BtxTexture(this.ndsService);
        this.texture.unpack();

        this.buildFrames();
    }

    private buildFrames() {
        this.frames = new Array(this.texture.textureInfo.objCount);
        for (let i = 0; i < this.frames.length; i++) {
            let textureId = i;
            if (textureId >= this.texture.textureInfo.names.length)
                textureId = 0;
            
            let paletteId;
            let isPaletteFound: boolean = false;
            for (paletteId = 0; paletteId < this.texture.paletteInfo.objCount; paletteId++) {
                if (this.texture.paletteInfo.names[paletteId] == this.texture.textureInfo.names[textureId]
                    || this.texture.paletteInfo.names[paletteId].split('_pl').join('') == this.texture.textureInfo.names[textureId]) {
                    isPaletteFound = true;
                    break;
                }
            }

            if (!isPaletteFound)
                paletteId = 0;

            this.frames[i] = this.buildFrame(textureId, paletteId);
        }
    }

    private buildFrame(textureId: number, paletteId: number) {
        let textureFrame: BtxTextureFrame = this.texture.textureInfo.infoBlock.frameInfos[textureId];
        let paletteFrame: BtxPaletteFrame = this.texture.paletteInfo.info.paletteFrames[paletteId];

        if (textureFrame.format !== 5) {
            let texturePosition: number = textureFrame.textureOffset * 8 + this.texture.address + this.texture.header.textureDataOffset;
            this.ndsService.goTo(texturePosition);
        } else {
            let texturePosition = textureFrame.textureOffset * 8 + this.texture.address + this.texture.header.textureCompressedDataOffset;
            this.ndsService.goTo(texturePosition);
        }

        let tileData: number[] = this.ndsService.getBytes(textureFrame.width * textureFrame.height * textureFrame.depth / 8);

        let palettePosition: number = this.texture.address + this.texture.header.paletteDataOffset + paletteFrame.paletteOffset * 8;
        this.ndsService.goTo(palettePosition);

        let paletteData: number[] = this.ndsService.getBytes(this.getPaletteSize(textureFrame.textureFormat));
        let palette: any[] = this.utilService.bgr555ToColorList(paletteData);

        let texture: HTMLCanvasElement;
        if (textureFrame.format !== 5) {
            texture = this.buildTexture(textureFrame, tileData, palette);
        } else {
            texture = this.buildCompressedTexture(textureFrame, tileData, palette);
        }

        return texture;
    }

    private buildTexture(textureInfo: BtxTextureFrame, tileData: number[], palette: any[]) {
        let imageBuffer = new Uint8ClampedArray(textureInfo.width * textureInfo.height * 4)
        let format: number = textureInfo.format;

        if (format == 3)
            tileData = this.utilService.bytesToBit4(tileData);
        else
            tileData = this.utilService.bytesToBit2(tileData);

        for (let y = 0; y < textureInfo.height; y++) {
            for (let x = 0; x < textureInfo.width; x++) {
                let colorIndex: number = 0;
                let color: any = { red: 0, green: 0, blue: 0, alpha: 255 };

                if (format == 2 || format == 3 || format == 4) { // 2, 4, or 8 bits per color
                    colorIndex = tileData[x + y * textureInfo.width];
                    color = palette[colorIndex];
                } else if (format == 1) { // A3I5
                    colorIndex = tileData[x + y * textureInfo.width] & 0x1F;
                    let alpha: number = ((tileData[x + y * textureInfo.width] >> 5) * 4);
                    alpha = ((alpha * 4) + (alpha / 2)) * 8;
                    color = { red: palette[colorIndex].red, green: palette[colorIndex].green, blue: palette[colorIndex].blue, alpha: alpha };
                } else if (format == 6) { // A5I3
                    colorIndex = tileData[x + y * textureInfo.width] & 0x7;
                    let alpha: number = (tileData[x + y * textureInfo.width] >> 3);
                    alpha *= 8;
                    color = { red: palette[colorIndex].red, green: palette[colorIndex].green, blue: palette[colorIndex].blue, alpha: alpha };
                } else if (format == 7) { // Direct
                    // TODO
                }

                if (!(textureInfo.color0 == 1 && colorIndex == 0)) {
                    let bufferIndex: number = (y * textureInfo.width + x) * 4;
                    // Draw pixel
                    imageBuffer[bufferIndex] = color.red;
                    imageBuffer[bufferIndex + 1] = color.green;
                    imageBuffer[bufferIndex + 2] = color.blue;
                    imageBuffer[bufferIndex + 3] = 255;
                    // console.log('X: ' + x + ', Y: ' + y);
                }
            }
        }

        let canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    
        canvas.width = textureInfo.width;
        canvas.height = textureInfo.height;

        let idata = ctx.createImageData(<number>textureInfo.width, <number>textureInfo.height);
        idata.data.set(imageBuffer);
        ctx.putImageData(idata, 0, 0);

        return canvas;
    }

    private buildCompressedTexture(textureInfo: BtxTextureFrame, tileData: number[], palette: any[]) {
        // TODO
        return undefined;
    }

    

    private getPaletteSize(format: BtxTextureFormat) {
        switch (format) {
            case BtxTextureFormat.NO_TEXTURE:
                return 0;
            case BtxTextureFormat.A3I5_TRANSLUCENT:
                return 64;
            case BtxTextureFormat.COLORS_4_PALETTE:
                return 8;
            case BtxTextureFormat.COLORS_16_PALETTE:
                return 32;
            case BtxTextureFormat.COLORS_256_PALETTE:
                return 512;
            case BtxTextureFormat.TEXEL_4x4_COMPRESSED:
                return 512;
            case BtxTextureFormat.A5I3_TRANSLUCENT:
                return 16;
            case BtxTextureFormat.DIRECT:
                return 0;
            default:
                return 0;
        }
    }


}
export class BtxTexture {

    public address: number;
    public header: BtxTextureHeader;
    public textureInfo: BtxTextureInfo;
    public paletteInfo: BtxPaletteInfo;

    constructor(public ndsService: NdsService) { 
        this.address = this.ndsService.position;
    }

    public unpack() {
        this.ndsService.goTo(this.address);
        this.header = new BtxTextureHeader(this.ndsService);
        this.header.unpack();

        let textureInfoAddress = this.address + this.header.textureInfoOffset;
        this.ndsService.goTo(textureInfoAddress);
        this.textureInfo = new BtxTextureInfo(this.ndsService);
        this.textureInfo.unpack();

        let paletteInfoAddress = this.address + this.header.paletteInfoOffset;
        this.ndsService.goTo(paletteInfoAddress);
        this.paletteInfo = new BtxPaletteInfo(this.ndsService);
        this.paletteInfo.unpack();
    }

}
export class BtxTextureInfo {

    public address: number;
    public dummy: number;
    public objCount: number;
    public sectionSize: number;
    public infoBlock: BtxTextureInfoBlock;
    public names: string[]

    constructor(public ndsService: NdsService) { 
        this.address = this.ndsService.position;
    }

    public unpack() {
        this.ndsService.goTo(this.address);

        this.dummy = this.ndsService.getByte();
        this.objCount = this.ndsService.getByte();
        this.sectionSize = this.ndsService.getShort();

        this.ndsService.skip(8 + (4 * this.objCount));

        this.infoBlock = new BtxTextureInfoBlock(this.ndsService, this.objCount);
        this.infoBlock.unpack();

        this.names = new Array(this.objCount);
        for (let i = 0; i < this.names.length; i++) 
            this.names[i] = this.ndsService.getString(16);
    }

}
export class BtxTextureInfoBlock {

    public address: number;

    public headerSize: number;
    public dataSize: number;
    public frameTextures: number[][];
    public frameInfos: BtxTextureFrame[]

    constructor(public ndsService: NdsService, public objCount: number) { 
        this.address = this.ndsService.position;
    }

    public unpack() {
        this.ndsService.goTo(this.address);
        this.headerSize = this.ndsService.getShort();
        this.dataSize = this.ndsService.getShort();

        this.frameTextures = new Array(this.objCount);
        this.frameInfos = new Array(this.objCount);

        let compressedStartOffset: number = 0;
        for (let i = 0; i < this.objCount; i++) {
            let info: BtxTextureFrame = new BtxTextureFrame(this.ndsService);
            info.unpack();

            if (info.format == 5) {
                info.compressedStartOffset = compressedStartOffset;
                compressedStartOffset += (info.width * info.height / 8);
            }

            this.frameInfos[i] = info;
        }
    }

}
export enum BtxTextureFormat {

    NO_TEXTURE = 0,
	A3I5_TRANSLUCENT = 1,
	COLORS_4_PALETTE = 2,
	COLORS_16_PALETTE = 3,
	COLORS_256_PALETTE = 4,
	TEXEL_4x4_COMPRESSED = 5,
	A5I3_TRANSLUCENT = 6,
	DIRECT = 7

}
export class BtxTextureFrame {

    public address: number;
    public textureOffset: number;
    public parameters: number;
    public width2: number;
    public sizeOpcode: number;
    public coordTransform: number;
    public color0: number;
    public format: number;
    public height: number;
    public width: number;
    public flipY: number;
    public flipX: number;
    public repeatY: number;
    public repeatX: number;
    public compressedStartOffset: number;
    public textureFormat: BtxTextureFormat;
    public depth: number;

    constructor(public ndsService: NdsService) { 
        this.address = this.ndsService.position;
    }
    
    public unpack() {
        this.ndsService.goTo(this.address);

        this.textureOffset = this.ndsService.getShort();
        this.parameters = this.ndsService.getShort();
        this.width2 = this.ndsService.getByte();
        this.sizeOpcode = this.ndsService.getByte();
        this.ndsService.skip(2);

        this.coordTransform = (this.parameters & 14);
        this.color0 = ((this.parameters >> 13) & 1);
        this.format = ((this.parameters >> 10) & 7);
        this.height = (8 << ((this.parameters >> 7) & 7));
        this.width = (8 << ((this.parameters >> 4) & 7));
        this.flipY = ((this.parameters >> 3) & 1);
        this.flipX = ((this.parameters >> 2) & 1);
        this.repeatY = ((this.parameters >> 1) & 1);
        this.repeatX = (this.parameters & 1);

        if (this.width == 0) {
        	switch (this.sizeOpcode & 3) {
                case 2:
                    this.width = 0x200;
                    break;
                default:
                    this.width = 0x100;
                    break;
        	}
        }

        if (this.height == 0) {
        	switch ((this.sizeOpcode >> 4) & 3) {
        	case 2:
        		this.height = 0x200;
        		break;
        	default:
        		this.height = 0x100;
        		break;
        	}
        }

        this.textureFormat = this.getTextureFormat(this.format);
        this.depth = this.getDepth(this.textureFormat);
    }

    private getDepth(format: BtxTextureFormat) {
        switch (format) {
            case BtxTextureFormat.NO_TEXTURE:
                return 0;
            case BtxTextureFormat.A3I5_TRANSLUCENT:
                return 8;
            case BtxTextureFormat.COLORS_4_PALETTE:
                return 2;
            case BtxTextureFormat.COLORS_16_PALETTE:
                return 4;
            case BtxTextureFormat.COLORS_256_PALETTE:
                return 8;
            case BtxTextureFormat.TEXEL_4x4_COMPRESSED:
                return 2;
            case BtxTextureFormat.A5I3_TRANSLUCENT:
                return 8;
            case BtxTextureFormat.DIRECT:
                return 16;
            default:
                return 0;
        }
    }

    private getTextureFormat(formatId: number) {
        switch (formatId) {
            case 0:
                return BtxTextureFormat.NO_TEXTURE;
            case 1:
                return BtxTextureFormat.A3I5_TRANSLUCENT;
            case 2:
                return BtxTextureFormat.COLORS_4_PALETTE;
            case 3:
                return BtxTextureFormat.COLORS_16_PALETTE;
            case 4:
                return BtxTextureFormat.COLORS_256_PALETTE;
            case 5:
                return BtxTextureFormat.TEXEL_4x4_COMPRESSED;
            case 6:
                return BtxTextureFormat.A5I3_TRANSLUCENT;
            case 7:
                return BtxTextureFormat.DIRECT;
            default:
                return BtxTextureFormat.NO_TEXTURE;
        }
    }
}
export class BtxTextureHeader {

    public address: number;
    public type: string;
    public sectionSize: number;
    public textureDataSize: number;
    public textureDataOffset: number;
    public textureInfoOffset: number;
    public textureCompressedDataSize: number;
    public textureCompressedInfoOffset: number;
    public textureCompressedDataOffset: number;
    public textureCompressedInfoDataOffset: number;
    public paletteDataSize: number;
    public paletteInfoOffset: number;
    public paletteDataOffset: number;

    constructor(public ndsService: NdsService) { 
        this.address = this.ndsService.position;
    }

    public unpack() {
        this.ndsService.goTo(this.address);

        this.type = this.ndsService.getString(4);
        this.sectionSize = this.ndsService.getInt();
        this.ndsService.skip(4);
        this.textureDataSize = this.ndsService.getShort();
        this.textureInfoOffset = this.ndsService.getShort();
        this.ndsService.skip(4);
        this.textureDataOffset = this.ndsService.getInt();
        this.ndsService.skip(4);
        this.textureCompressedDataSize = this.ndsService.getShort();
        this.textureCompressedInfoOffset = this.ndsService.getShort();
        this.ndsService.skip(4);
        this.textureCompressedDataOffset = this.ndsService.getInt();
        this.textureCompressedInfoDataOffset = this.ndsService.getInt();
        this.ndsService.skip(4);
        this.paletteDataSize = this.ndsService.getInt();
        this.paletteInfoOffset = this.ndsService.getInt();
        this.paletteDataOffset = this.ndsService.getInt();

        this.textureCompressedDataSize <<= 3
        this.paletteDataSize <<= 3;
    }

}
export class BtxPaletteInfo {

    public address: number;
    public dummy: number;
    public objCount: number;
    public sectionSize: number;
    public info: BtxPaletteInfoBlock;
    public names: string[]

    constructor(public ndsService: NdsService) { 
        this.address = this.ndsService.position;
    }

    public unpack() {
        this.ndsService.goTo(this.address);
        this.dummy = this.ndsService.getByte();
        this.objCount = this.ndsService.getByte();
        this.sectionSize = this.ndsService.getByte();

        this.ndsService.skip(8 + (4 * this.objCount));

        this.info = new BtxPaletteInfoBlock(this.ndsService, this.objCount);
        this.info.unpack();

        this.names = new Array(this.objCount);
        for (let i = 0; i < this.objCount; i++)
            this.names[i] = this.ndsService.getString(16);
    }

}
export class BtxPaletteInfoBlock {

    public address: number;
    public headerSize: number;
    public dataSize: number;
    public paletteData: number[][];
    public paletteFrames: BtxPaletteFrame[];

    constructor(public ndsService: NdsService, public objCount: number) { 
        this.address = this.ndsService.position;
    }

    public unpack() {
        this.ndsService.goTo(this.address);

        this.headerSize = this.ndsService.getShort();
        this.dataSize = this.ndsService.getShort();

        this.paletteData = new Array(this.objCount);
        this.paletteFrames = new Array(this.objCount);
        for (let i = 0; i < this.objCount; i++) {
            let palette: BtxPaletteFrame = new BtxPaletteFrame(this.ndsService);
            palette.unpack();

            this.paletteFrames[i] = palette;
        }
    }

}
export class BtxPaletteFrame {

    public address: number;
    public paletteOffset: number;

    constructor(public ndsService: NdsService) { 
        this.address = this.ndsService.position;
    }

    public unpack() {
        this.ndsService.goTo(this.address);
        this.paletteOffset = this.ndsService.getShort() & 0x1FFF;
    }

}

import { Injectable, NgZone } from '@angular/core';
import { GbaService } from '../gba.service';

const LZ77_OPCODE = 0x10;
const TILE_SIZE = 8;

@Injectable({
  providedIn: 'root'
})
export class BitmapService {

  constructor(private gbaService: GbaService) { }


  public createBitmap(pixels: BitmapPixelData, palette: BitmapPalette, width: number, height?: number, hasTransparency?: boolean) {
    return this.createBitmapCanvas(pixels, palette, width, height, hasTransparency).toDataURL();
  }

  public createBitmapCanvas(pixels: BitmapPixelData, palette: BitmapPalette, width: number, height?: number, hasTransparency?: boolean) {
    if (!height)
      height = this.getBitmapHeight(pixels, width);
    let imageBuffer = new Uint8ClampedArray(width * height * 4)

    let pixelIndex: number = 0;
    for (let yTile = 0; yTile < height / TILE_SIZE; yTile++) {
      for (let xTile = 0; xTile < width / TILE_SIZE; xTile++) {
        for (let yPixel = 0; yPixel < TILE_SIZE; yPixel++) {
          for (let xPixel = 0; xPixel < TILE_SIZE; xPixel++) {
            let trueX = xPixel + (xTile * TILE_SIZE);
            let trueY = yPixel + (yTile * TILE_SIZE);
            let bufferIndex = (trueY * width + trueX) * 4;

            let colorIndex = pixels.getPixel(pixelIndex);
            let color: any = 0;
            if (palette && palette.colors && palette.colors[colorIndex]) 
              color = palette.colors[colorIndex];

            imageBuffer[bufferIndex] = color.red;
            imageBuffer[bufferIndex + 1] = color.green;
            imageBuffer[bufferIndex + 2] = color.blue;
            imageBuffer[bufferIndex + 3] = hasTransparency && colorIndex == 0 ? 0 : 255;

            pixelIndex++;
          }
        }
      }
    }

    let canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    let idata = ctx.createImageData(width, height);
    idata.data.set(imageBuffer);
    ctx.putImageData(idata, 0, 0);

    return canvas;
  }

  public createTiledBitmap(pixels: BitmapPixelData, palettes: BitmapPalette[], tilemap: BitmapTilemap, width: number, height: number) {
    if (!height)
      height = this.getBitmapHeight(pixels, width);
    let imageBuffer = new Uint8ClampedArray(width * height * 4)
    let image = document.createElement('canvas');
    let imageContext = image.getContext('2d');
    image.width = width;
    image.height = height;
    
    let tileIndex: number = 0;
    for (let yTile = 0; yTile < (height / TILE_SIZE); yTile++) {
			// loop through columns of tiles
			for (let xTile = 0; xTile < (width / TILE_SIZE); xTile++) {
				let subimage = new Uint8ClampedArray(8 * 8 * 4);
        let tile: BitmapTilemapEntry = tilemap.entries[tileIndex];
        let tileImage = document.createElement('canvas');
        tileImage.width = 8;
        tileImage.height = 8;
        let tileContext = tileImage.getContext('2d');

        let pixelIndex: number = 0;
        // loop through rows of pixels inside tile
				for (let yPixel = 0; yPixel < TILE_SIZE; yPixel++) {
					// loop through columns of pixels inside tile
					for (let xPixel = 0; xPixel < TILE_SIZE; xPixel++) {
            if (tile.tileId != 0) {
							let colorIndex = pixels.getPixel((tile.tileId * 64) + pixelIndex);
							let color: any = palettes[tile.paletteId].colors[colorIndex];

              let bufferIndex = pixelIndex * 4;

              subimage[bufferIndex] = color.red;
              subimage[bufferIndex + 1] = color.green;
              subimage[bufferIndex + 2] = color.blue;
              subimage[bufferIndex + 3] = (colorIndex == 0 ? 0 : 255);
						}
            
						pixelIndex++;
          }
        }
        

        let idata = tileContext.createImageData(8, 8);
        idata.data.set(subimage);
        tileContext.putImageData(idata, 0, 0);

        tileContext = this.flipImage(tileImage, tile.flipX, tile.flipY);

        imageContext.drawImage(tileImage, xTile * 8, yTile * 8);

        
        tileIndex++;
      }
    }

    
    return image.toDataURL();
  }

  public flipImage(image: HTMLCanvasElement, flipH, flipV) {
    let newImage = document.createElement('canvas');
    let newImageContext = newImage.getContext('2d');

    newImageContext.save();  // save the current canvas state
    newImageContext.setTransform(
      flipH ? -1 : 1, 0, // set the direction of x axis
        0, flipV ? -1 : 1,   // set the direction of y axis
        0 + flipH ? image.width : 0, // set the x origin
        0 + flipV ? image.height : 0   // set the y origin
    );
    newImageContext.drawImage(image,0,0);
    newImageContext.restore(); // restore the state as it was when this function was called

    return newImageContext;
  }

  public decompressLz77(startPosition: number) {
    if (this.gbaService.getByteAt(startPosition) != LZ77_OPCODE) {
      console.log('Invalid LZ77 Opcode');
      return [];
    }

    let data: number[] = new Array(this.getDecompressLz77Length());
    let destination, flags, offset, length, value, position = 0;
    let flagged: boolean = false;

    while (position < data.length) {
      flags = this.gbaService.getByte();
      for (let i = 0; i < 8; i++) {
        flagged = (flags & (0x80 >> i)) > 0;
        if (flagged) {
          value = this.gbaService.getByte();
          length = (value >> 4) + 3;
          offset = ((value & 0x0F) << 8) | this.gbaService.getByte();
          destination = position;

          if (offset > position) {
            console.log('Your Lz77 offset is greater than its position! :(');
            return [];
          }

          for (let j = 0; j < length; j++)
            data[position++] = data[destination - offset - 1 + j];
        } else {
          value = this.gbaService.getByte();
          if (position < data.length)
            data[position++] = value;
          else if (value == 0)
            break;
        }
      }
    }

    return data;
  }

  private getDecompressLz77Length() {
    let length = 0;
    for (let i = 0; i < 3; i++)
      length |= (this.gbaService.getByte() << (i * 8));
    if (length == 0)
      length = this.gbaService.getInt();
    return length;
  }

  private getBitmapHeight(pixels: BitmapPixelData, width: number) {
    return (pixels.values.length / width) * (8 / pixels.depth);
  }

}
export enum BitmapPixelDepth {
  BPP_1 = 1,
  BPP_2 = 2,
  BPP_4 = 4,
  BPP_8 = 8
}
export class BitmapPixelData {

  constructor(
    public address?: number,
    public depth?: BitmapPixelDepth,
    public values?: any[],
    private bitmapService?: BitmapService,
    private gbaService?: GbaService
  ) { 
    if (!this.values)
      this.values = [];

    if (address) {
      let lz77Check = this.gbaService.getByteAt(address);
      if (!values && lz77Check == 0x10) {
        this.values = this.bitmapService.decompressLz77(address);
      } else {
        this.values = this.gbaService.getBytes(2048);
      }
    }
  }

  public getPixel(index: number) {
    let pixel = this.values[Math.floor(index / (Math.floor(8 / this.depth)))];
      
    if ((index & 1) == 0)
      pixel &= 0x0F;
    else
      pixel = (pixel & 0xF0) >> this.depth;
    return pixel;
  }

}
export class BitmapPalette {

  constructor(
    public address: number,
    public paletteSize: number,
    public values: number[] = [],
    public colors: any[] = [],
    public bitmapService?: BitmapService,
    public gbaService?: GbaService,
    public internalId?: number
  ) { 
    if (!this.values)
      this.values = new Array(paletteSize * 2);
    if (!this.colors)
      this.colors = new Array(paletteSize);

    if (address) {
      let lz77Check = this.gbaService.getByteAt(address);
      if (lz77Check == 0x10) {
        this.values = this.bitmapService.decompressLz77(address);
      } else {
        this.gbaService.goTo(address);
        for (let i = 0; i < paletteSize * 2; i++)
          this.values.push(this.gbaService.getByteAt(address + i));
      }
    }

    if (this.colors.length == 0) {
      this.colors = new Array(this.values.length / 2);
      for (let i = 0; i < this.values.length; i += 2) {
        let value = this.values[i] | (this.values[i + 1] << 8);
  
        let red = (value & 0x1F) << 3;
        let green = (value & 0x3E0) >> 2;
        let blue = (value & 0x7C00) >> 7;
  
        this.colors[i / 2] = { red: red, green: green, blue: blue };
      }
    }
  }
  
  public getSubPalette(start: number, end: number) {
		let paletteSize = end - start;
		
		let address = this.address + (start * 2);
		let values: number[] = new Array(paletteSize);
		let colors: any[] = new Array(paletteSize);

		for (let i = 0; i < paletteSize; i++) {
			values[i] = this.values[i + start];
			colors[i] = this.colors[i + start];
		}
		
		return new BitmapPalette(address, undefined, values, colors, this.bitmapService, this.gbaService);
	}
}
export class BitmapTilemap {

  private DEFAULT_LENGTH = 4096;
  private INDEX_MASK = 0x3FF;
  private X_FLIP_MASK = 0x400;
  private Y_FLIP_MASK = 0x800;
  private PALETTE_MASK = 0xF;

  public entries: BitmapTilemapEntry[] = [];

  constructor(
    public tilemapAddress?: number,
    public tilemapType?: BitmapTilemapType,
    public length?: number,
    public bitmapService?: BitmapService,
    public gbaService?: GbaService
  ) { 
    let values: any[] = undefined;
    let lz77Flag = this.gbaService.getByteAt(tilemapAddress);
    if (lz77Flag == 0x10) 
      values = this.bitmapService.decompressLz77(tilemapAddress);
    else {
      for (let i = 0; i < (length ? length : this.DEFAULT_LENGTH); i++)
        values.push(this.gbaService.getByteAt(tilemapAddress + i));
    }
      
    this.load(values, tilemapType);
  }

  private load(values: any[], type: BitmapTilemapType) {
    this.entries = new Array(values.length / 2);
		for (let i = 0; i < values.length; i++) {
			if (type == BitmapTilemapType.TEXT_4) {
				let shortValue = values[i] | (values[++i] << 8);
				this.entries[Math.floor(i / 2)] = new BitmapTilemapEntry(
						(shortValue & this.INDEX_MASK),
						(shortValue >> 12) &  this.PALETTE_MASK,
						(shortValue & this.X_FLIP_MASK) == this.X_FLIP_MASK,
						(shortValue & this.Y_FLIP_MASK) == this.Y_FLIP_MASK
						);
			} else if (type == BitmapTilemapType.TEXT_8) {
				let shortValue = values[i] | (values[++i] << 8);
				this.entries[Math.floor(i / 2)] = { tileId: (shortValue & this.INDEX_MASK),
          flipX: (shortValue & this.X_FLIP_MASK) == this.X_FLIP_MASK,
          flipY: (shortValue & this.Y_FLIP_MASK) == this.Y_FLIP_MASK
          }
			} else {
				let byteValue = values[i];
				this.entries[i] = new BitmapTilemapEntry(byteValue);
			}
		}
  }
}
export class BitmapTilemapEntry {

  constructor(
    public tileId?: number,
    public paletteId?: number,
    public flipX?: boolean,
    public flipY?: boolean
  ) { }
}
export enum BitmapTilemapType {

  NONE,
  TEXT_4,
  TEXT_4_REVERSED,
  TEXT_8

}
export class BitmapAnimation {

  private currentStepStart = 0;
  private initialIndex: number = 0;

  constructor(
    public bitmapFrames?: any[], // each image data
    public currentFrame?: any,
    public interval?: number,
    public isLooping?: boolean,
    public isAnimating?: boolean,
    public currentIndex: number = 0
  ) {
    this.initialIndex = this.currentIndex;
  }

    public async start(zone?: NgZone) {
      if (this.bitmapFrames.length > 1) {
        this.isAnimating = true;
        this.currentIndex = this.initialIndex;
        this.currentStepStart = performance.now();
      }
    }

    public doAnimation(overrideLoopTime?: number) {
      let currentLoopTime: number = overrideLoopTime ? overrideLoopTime : performance.now();
      if (this.isAnimating && (currentLoopTime - this.currentStepStart >= this.interval)) {
        if ((this.currentIndex < this.bitmapFrames.length || this.isLooping)) {
          this.currentStepStart = currentLoopTime;
          this.currentIndex = this.currentIndex < this.bitmapFrames.length ? this.currentIndex : this.initialIndex;
          this.currentFrame = this.bitmapFrames[this.currentIndex++];
        } else {
          this.stop();
        }
      }
    }

    public async stop() {
      this.isAnimating = false;
      this.currentFrame = this.bitmapFrames[this.initialIndex];
    }

}

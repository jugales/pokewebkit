import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  public bgr555ToColorList(bytes: number[]) {
    let colors: any = new Array(bytes.length / 2);
    for (let i = 0; i < colors.length; i++)
        colors[i] = this.bgr555ToColor(bytes[i * 2], bytes[i * 2 + 1]);

    return colors;
  }

  public bgr555ToColor(byte1: number, byte2: number) {
    let r, g, b;
    let bgr = this.bytesToInt16([byte1, byte2], 0);

    r = (bgr & 0x001F) * 8;
    g = ((bgr & 0x03E0) >> 5) * 8;
    b = ((bgr & 0x7C00) >> 10) * 8;

    return { red: r, green: g, blue: b, alpha: 1 };
  }

  public bytesToInt16(bytes: number[], index: number) {
    return ((0xff & bytes[index + 1]) << 8 | (0xff & bytes[index]) << 0)
  }

  public byteToBit4(data: number) {
      let bit4: number[] = new Array(2);

      bit4[0] = (data & 0x0F);
      bit4[1] = ((data & 0xF0) >> 4);

      return bit4;
  }
  public bytesToBit4(data: number[]) {
    let bit4: number[] = new Array(data.length * 2);
    for (let i = 0; i < data.length; i++) {
      let b4: number[] = this.byteToBit4(data[i]);
      bit4[i * 2] = b4[0];
      bit4[i * 2 + 1] = b4[1];
    }
    
    return bit4;
  }
  
  public byteToBit2(data: number) {
    let bit2: number[] = new Array(4);

    bit2[0] = (data & 0x3);
    bit2[1] = ((data >> 2) & 0x3);
    bit2[2] = ((data >> 4) & 0x3);
    bit2[3] = ((data >> 6) & 0x3);

    return bit2;
  }
  
  public bytesToBit2(data: number[]) {
    let bit2: number[] = Array(data.length * 4);

    for (let i = 0; i < bit2.length; i += 4) {
      bit2[i] = (data[i] & 0x3);
      bit2[i + 1] = ((data[i] >> 2) & 0x3);
      bit2[i + 2] = ((data[i] >> 4) & 0x3);
      bit2[i + 3] = ((data[i] >> 6) & 0x3);
    }

    return bit2;
  }
}

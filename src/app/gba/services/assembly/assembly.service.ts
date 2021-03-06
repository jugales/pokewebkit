import { Injectable } from '@angular/core';
import { GbaService } from '../gba.service';

/**
 * TODO: Clean this up
 */
@Injectable({
  providedIn: 'root'
})
export class AssemblyService {

  public BPRE_FLAG = 0x999;

  public tileAnimationReplacementScript: number[] = [0x00, 0x00, 0x01, 0x21, 0x09, 0x02, 0x88, 0x42, 0x01, 0xD3, 0x00, 0x20, 0x10, 0x80, 0x10, 0x4C, 0x20, 0x88, 0x01, 0x30, 0x20, 0x80, 0x0F, 0x49, 0x00, 0x00, 0x01, 0x21, 0x09, 0x02, 0x88, 0x42, 0x01, 0xD3, 0x00, 0x20, 0x20, 0x80, 0x03, 0x4C, 0x00, 0xF0, 0x03, 0xF8, 0x10, 0xBC, 0x01, 0xBC, 0x00, 0x47, 0x20, 0x47];
  public tileAnimationReplacementScriptFiller: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  
  public tileAnimationAssemblyScriptBPRE0: number[] = [0xFF, 0xB5, 0x12, 0x88, 0x47, 0x48, 0x00, 0x68, 0x00, 0x69, 0x00, 0x28, 0x1A, 0xD0, 0x06, 0x69, 0x00, 0x2E, 0x17, 0xD0, 0xF7, 0x7B, 0x00, 0x24, 0x21, 0x01, 0x71, 0x18, 0x8D, 0x7B, 0x10, 0x23, 0x2B, 0x40, 0x10, 0x2B, 0x0B, 0xD0, 0x8D, 0x79, 0x13, 0x1C, 0x2B, 0x40, 0xCD, 0x79, 0x9D, 0x42, 0x08, 0xD8, 0x04, 0xD3, 0x0D, 0x79, 0x10, 0x1C, 0xE8, 0x40, 0x00, 0xF0, 0x25, 0xF8, 0x01, 0x34, 0xBC, 0x42, 0xE9, 0xD3, 0x37, 0x48, 0x00, 0x68, 0x40, 0x69, 0x00, 0x28, 0x1A, 0xD0, 0x06, 0x69, 0x00, 0x2E, 0x17, 0xD0, 0xF7, 0x7B, 0x00, 0x24, 0x21, 0x01, 0x71, 0x18, 0x8D, 0x7B, 0x10, 0x23, 0x2B, 0x40, 0x10, 0x2B, 0x0B, 0xD0, 0x8D, 0x79, 0x13, 0x1C, 0x2B, 0x40, 0xCD, 0x79, 0x9D, 0x42, 0x08, 0xD8, 0x04, 0xD3, 0x0D, 0x79, 0x10, 0x1C, 0xE8, 0x40, 0x00, 0xF0, 0x05, 0xF8, 0x01, 0x34, 0xBC, 0x42, 0xE9, 0xD3, 0xFF, 0xBC, 0x00, 0xBD, 0xFC, 0xB5, 0x8F, 0x7B, 0x02, 0x26, 0x3E, 0x40, 0x02, 0x2E, 0x02, 0xD1, 0xC0, 0x1A, 0x00, 0x04, 0x00, 0x0C, 0x08, 0x26, 0x3E, 0x40, 0x08, 0x2E, 0x0A, 0xD1, 0x4E, 0x79, 0xB0, 0x42, 0x00, 0xD8, 0x06, 0xE0, 0x10, 0x31, 0x8F, 0x7B, 0x10, 0x26, 0x3E, 0x40, 0x10, 0x2E, 0x00, 0xD0, 0x25, 0xE0, 0x4A, 0x89, 0x01, 0x26, 0x3E, 0x40, 0x01, 0x2E, 0x01, 0xD0, 0x10, 0x40, 0x05, 0xE0, 0x12, 0xB4, 0x11, 0x1C, 0x17, 0x4C, 0x00, 0xF0, 0x28, 0xF8, 0x12, 0xBC, 0x8A, 0x89, 0x0C, 0x68, 0x0D, 0x89, 0x02, 0x26, 0x3E, 0x40, 0x02, 0x2E, 0x0F, 0xD1, 0x0B, 0x89, 0x5B, 0x01, 0x4A, 0x89, 0x10, 0x40, 0x80, 0x00, 0x00, 0x19, 0x00, 0x68, 0x8A, 0x89, 0x12, 0x01, 0x0E, 0x49, 0xC9, 0x18, 0x0B, 0xDF, 0x0D, 0x49, 0xC9, 0x18, 0x0B, 0xDF, 0x01, 0xE0, 0x00, 0xF0, 0x02, 0xF8, 0xFC, 0xBD, 0xC0, 0x46, 0x37, 0xB5, 0x80, 0x00, 0x00, 0x19, 0x00, 0x68, 0x08, 0x49, 0x6D, 0x01, 0x49, 0x19, 0x52, 0x01, 0x07, 0x4C, 0x00, 0xF0, 0x01, 0xF8, 0x37, 0xBD, 0x20, 0x47, 0x00, 0x00, 0xFC, 0x6D, 0x03, 0x02, 0x85, 0x46, 0x1E, 0x08, 0x14, 0x7B, 0x03, 0x02, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x06, 0x05, 0xFF, 0x06, 0x08, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x74, 0xB8, 0x3A, 0x08, 0x03, 0x00, 0x07, 0x00, 0xD0, 0x01, 0x07, 0x00, 0x12, 0x00, 0x00, 0x03, 0x54, 0xA6, 0x3A, 0x08, 0x04, 0x00, 0x0F, 0x01, 0xA0, 0x01, 0x07, 0x00, 0x30, 0x00, 0x00, 0x03, 0x60, 0x76, 0x3A, 0x08, 0x04, 0x00, 0x0F, 0x02, 0xFC, 0x01, 0x05, 0x00, 0x04, 0x00, 0x01, 0x03, 0xB4, 0xBD, 0x3A, 0x08, 0x04, 0x00, 0x0C, 0x00, 0xE8, 0x02, 0x05, 0x00, 0x08, 0x00, 0x01, 0x01, 0xC8, 0xC7, 0x3A, 0x08, 0x01, 0x00, 0x01, 0x00, 0x70, 0x03, 0x01, 0x00, 0x07, 0x00, 0x00, 0x01, 0x50, 0xC9, 0x3A, 0x08, 0x04, 0x00, 0x0F, 0x00, 0xE3, 0x02, 0x03, 0x00, 0x04, 0x00, 0x00, 0x01, 0xE8, 0xC1, 0x3A, 0x08, 0x04, 0x00, 0x0A, 0x00, 0xD0, 0x03, 0x03, 0x00, 0x08, 0x00, 0x00, 0x01, 0xF8, 0xC5, 0x3A, 0x08, 0x04, 0x00, 0x0F, 0x00, 0x80, 0x03, 0x03, 0x00, 0x08, 0x00, 0x00, 0x01];
  public tileAnimationAssemblyScriptBPRE1: number[] = [0xff, 0xb5, 0x12, 0x88, 0x47, 0x48, 0x0, 0x68, 0x0, 0x69, 0x0, 0x28, 0x1a, 0xd0, 0x6, 0x69, 0x0, 0x2e, 0x17, 0xd0, 0xf7, 0x7b, 0x0, 0x24, 0x21, 0x1, 0x71, 0x18, 0x8d, 0x7b, 0x10, 0x23, 0x2b, 0x40, 0x10, 0x2b, 0xb, 0xd0, 0x8d, 0x79, 0x13, 0x1c, 0x2b, 0x40, 0xcd, 0x79, 0x9d, 0x42, 0x8, 0xd8, 0x4, 0xd3, 0xd, 0x79, 0x10, 0x1c, 0xe8, 0x40, 0x0, 0xf0, 0x25, 0xf8, 0x1, 0x34, 0xbc, 0x42, 0xe9, 0xd3, 0x37, 0x48, 0x0, 0x68, 0x40, 0x69, 0x0, 0x28, 0x1a, 0xd0, 0x6, 0x69, 0x0, 0x2e, 0x17, 0xd0, 0xf7, 0x7b, 0x0, 0x24, 0x21, 0x1, 0x71, 0x18, 0x8d, 0x7b, 0x10, 0x23, 0x2b, 0x40, 0x10, 0x2b, 0xb, 0xd0, 0x8d, 0x79, 0x13, 0x1c, 0x2b, 0x40, 0xcd, 0x79, 0x9d, 0x42, 0x8, 0xd8, 0x4, 0xd3, 0xd, 0x79, 0x10, 0x1c, 0xe8, 0x40, 0x0, 0xf0, 0x5, 0xf8, 0x1, 0x34, 0xbc, 0x42, 0xe9, 0xd3, 0xff, 0xbc, 0x0, 0xbd, 0xfc, 0xb5, 0x8f, 0x7b, 0x2, 0x26, 0x3e, 0x40, 0x2, 0x2e, 0x2, 0xd1, 0xc0, 0x1a, 0x0, 0x4, 0x0, 0xc, 0x8, 0x26, 0x3e, 0x40, 0x8, 0x2e, 0xa, 0xd1, 0x4e, 0x79, 0xb0, 0x42, 0x0, 0xd8, 0x6, 0xe0, 0x10, 0x31, 0x8f, 0x7b, 0x10, 0x26, 0x3e, 0x40, 0x10, 0x2e, 0x0, 0xd0, 0x25, 0xe0, 0x4a, 0x89, 0x1, 0x26, 0x3e, 0x40, 0x1, 0x2e, 0x1, 0xd0, 0x10, 0x40, 0x5, 0xe0, 0x12, 0xb4, 0x11, 0x1c, 0x17, 0x4c, 0x0, 0xf0, 0x28, 0xf8, 0x12, 0xbc, 0x8a, 0x89, 0xc, 0x68, 0xd, 0x89, 0x2, 0x26, 0x3e, 0x40, 0x2, 0x2e, 0xf, 0xd1, 0xb, 0x89, 0x5b, 0x1, 0x4a, 0x89, 0x10, 0x40, 0x80, 0x0, 0x0, 0x19, 0x0, 0x68, 0x8a, 0x89, 0x12, 0x1, 0xe, 0x49, 0xc9, 0x18, 0xb, 0xdf, 0xd, 0x49, 0xc9, 0x18, 0xb, 0xdf, 0x1, 0xe0, 0x0, 0xf0, 0x2, 0xf8, 0xfc, 0xbd, 0xc0, 0x46, 0x37, 0xb5, 0x80, 0x0, 0x0, 0x19, 0x0, 0x68, 0x8, 0x49, 0x6d, 0x1, 0x49, 0x19, 0x52, 0x1, 0x7, 0x4c, 0x0, 0xf0, 0x1, 0xf8, 0x37, 0xbd, 0x20, 0x47, 0x0, 0x0, 0xfc, 0x6d, 0x3, 0x2, 0xf5, 0x46, 0x1e, 0x8, 0x14, 0x7b, 0x3, 0x2, 0x0, 0x0, 0x0, 0x5, 0x0, 0x0, 0x0, 0x6, 0x19, 0xff, 0x6, 0x8, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xe4, 0xb8, 0x3a, 0x8, 0x3, 0x0, 0x7, 0x0, 0xd0, 0x1, 0x7, 0x0, 0x12, 0x0, 0x0, 0x3, 0xc4, 0xa6, 0x3a, 0x8, 0x4, 0x0, 0xf, 0x1, 0xa0, 0x1, 0x7, 0x0, 0x30, 0x0, 0x0, 0x3, 0xd0, 0x76, 0x3a, 0x8, 0x4, 0x0, 0xf, 0x2, 0xfc, 0x1, 0x5, 0x0, 0x4, 0x0, 0x1, 0x3, 0x24, 0xbe, 0x3a, 0x8, 0x4, 0x0, 0xc, 0x0, 0xe8, 0x2, 0x5, 0x0, 0x8, 0x0, 0x1, 0x1, 0x38, 0xc8, 0x3a, 0x8, 0x1, 0x0, 0x1, 0x0, 0x70, 0x3, 0x1, 0x0, 0x7, 0x0, 0x0, 0x1, 0xc0, 0xc9, 0x3a, 0x8, 0x4, 0x0, 0xf, 0x0, 0xe3, 0x2, 0x3, 0x0, 0x4, 0x0, 0x0, 0x1, 0x58, 0xc2, 0x3a, 0x8, 0x4, 0x0, 0xa, 0x0, 0xd0, 0x3, 0x3, 0x0, 0x8, 0x0, 0x0, 0x1, 0x68, 0xc6, 0x3a, 0x8, 0x4, 0x0, 0xf, 0x0, 0x80, 0x3, 0x3, 0x0, 0x8, 0x0, 0x0, 0x1];
  public tileAnimationAssemblyScriptBPEE: number[] = [0xff, 0xb5, 0x12, 0x88, 0x47, 0x48, 0x0, 0x68, 0x0, 0x69, 0x0, 0x28, 0x1a, 0xd0, 0x46, 0x69, 0x0, 0x2e, 0x17, 0xd0, 0xf7, 0x7b, 0x0, 0x24, 0x21, 0x1, 0x71, 0x18, 0x8d, 0x7b, 0x10, 0x23, 0x2b, 0x40, 0x10, 0x2b, 0xb, 0xd0, 0x8d, 0x79, 0x13, 0x1c, 0x2b, 0x40, 0xcd, 0x79, 0x9d, 0x42, 0x8, 0xd8, 0x4, 0xd3, 0xd, 0x79, 0x10, 0x1c, 0xe8, 0x40, 0x0, 0xf0, 0x25, 0xf8, 0x1, 0x34, 0xbc, 0x42, 0xe9, 0xd3, 0x37, 0x48, 0x0, 0x68, 0x40, 0x69, 0x0, 0x28, 0x1a, 0xd0, 0x46, 0x69, 0x0, 0x2e, 0x17, 0xd0, 0xf7, 0x7b, 0x0, 0x24, 0x21, 0x1, 0x71, 0x18, 0x8d, 0x7b, 0x10, 0x23, 0x2b, 0x40, 0x10, 0x2b, 0xb, 0xd0, 0x8d, 0x79, 0x13, 0x1c, 0x2b, 0x40, 0xcd, 0x79, 0x9d, 0x42, 0x8, 0xd8, 0x4, 0xd3, 0xd, 0x79, 0x10, 0x1c, 0xe8, 0x40, 0x0, 0xf0, 0x5, 0xf8, 0x1, 0x34, 0xbc, 0x42, 0xe9, 0xd3, 0xff, 0xbc, 0x0, 0xbd, 0xfc, 0xb5, 0x8f, 0x7b, 0x2, 0x26, 0x3e, 0x40, 0x2, 0x2e, 0x2, 0xd1, 0xc0, 0x1a, 0x0, 0x4, 0x0, 0xc, 0x8, 0x26, 0x3e, 0x40, 0x8, 0x2e, 0xa, 0xd1, 0x4e, 0x79, 0xb0, 0x42, 0x0, 0xd8, 0x6, 0xe0, 0x10, 0x31, 0x8f, 0x7b, 0x10, 0x26, 0x3e, 0x40, 0x10, 0x2e, 0x0, 0xd0, 0x25, 0xe0, 0x4a, 0x89, 0x1, 0x26, 0x3e, 0x40, 0x1, 0x2e, 0x1, 0xd0, 0x10, 0x40, 0x5, 0xe0, 0x12, 0xb4, 0x11, 0x1c, 0x17, 0x4c, 0x0, 0xf0, 0x28, 0xf8, 0x12, 0xbc, 0x8a, 0x89, 0xc, 0x68, 0xd, 0x89, 0x2, 0x26, 0x3e, 0x40, 0x2, 0x2e, 0xf, 0xd1, 0xb, 0x89, 0x5b, 0x1, 0x4a, 0x89, 0x10, 0x40, 0x80, 0x0, 0x0, 0x19, 0x0, 0x68, 0x8a, 0x89, 0x12, 0x1, 0xe, 0x49, 0xc9, 0x18, 0xb, 0xdf, 0xd, 0x49, 0xc9, 0x18, 0xb, 0xdf, 0x1, 0xe0, 0x0, 0xf0, 0x2, 0xf8, 0xfc, 0xbd, 0xc0, 0x46, 0x37, 0xb5, 0x80, 0x0, 0x0, 0x19, 0x0, 0x68, 0x8, 0x49, 0x6d, 0x1, 0x49, 0x19, 0x52, 0x1, 0x7, 0x4c, 0x0, 0xf0, 0x1, 0xf8, 0x37, 0xbd, 0x20, 0x47, 0x0, 0x0, 0x18, 0x73, 0x3, 0x2, 0xe1, 0x7b, 0x2e, 0x8, 0x14, 0x7b, 0x3, 0x2, 0x0, 0x0, 0x0, 0x5, 0x0, 0x0, 0x0, 0x6, 0x81, 0x9, 0xa, 0x8, 0x0, 0x0, 0x0, 0x0, 0x64, 0x7, 0x51, 0x8, 0x4, 0x0, 0xf, 0x0, 0xfc, 0x1, 0x3, 0x0, 0x4, 0x0, 0x0, 0x5, 0x74, 0x25, 0x51, 0x8, 0x4, 0x0, 0xf, 0x1, 0xb0, 0x1, 0x7, 0x0, 0x1e, 0x0, 0x0, 0x5, 0x54, 0x2e, 0x51, 0x8, 0x4, 0x0, 0xf, 0x2, 0xd0, 0x1, 0x7, 0x0, 0xa, 0x0, 0x0, 0x5, 0x74, 0x31, 0x51, 0x8, 0x4, 0x0, 0xf, 0x3, 0xf0, 0x1, 0x3, 0x0, 0x6, 0x0, 0x0, 0x5, 0x84, 0x36, 0x51, 0x8, 0x4, 0x0, 0xf, 0x4, 0xe0, 0x1, 0x3, 0x0, 0xa, 0x0, 0x0, 0x5, 0x24, 0x58, 0x51, 0x8, 0x3, 0x0, 0x7, 0x0, 0x80, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x9, 0x64, 0x59, 0x51, 0x8, 0x3, 0x0, 0x7, 0x0, 0xc0, 0x3, 0x1, 0x0, 0x4, 0x0, 0x0, 0x9, 0x24, 0x58, 0x51, 0x8, 0x3, 0x0, 0x7, 0x1, 0x84, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x9, 0x24, 0x58, 0x51, 0x8, 0x3, 0x0, 0x7, 0x2, 0x88, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x9, 0x24, 0x58, 0x51, 0x8, 0x3, 0x0, 0x7, 0x3, 0x8c, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x9, 0x24, 0x58, 0x51, 0x8, 0x3, 0x0, 0x7, 0x4, 0x90, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x9, 0x24, 0x58, 0x51, 0x8, 0x3, 0x0, 0x7, 0x5, 0x94, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x9, 0x24, 0x58, 0x51, 0x8, 0x3, 0x0, 0x7, 0x6, 0x98, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x9, 0x24, 0x58, 0x51, 0x8, 0x3, 0x0, 0x7, 0x7, 0x9c, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x9, 0xfc, 0x64, 0x51, 0x8, 0x3, 0x0, 0x7, 0x0, 0xaa, 0x2, 0x3, 0x0, 0x6, 0x0, 0x0, 0x1, 0x2c, 0x6d, 0x51, 0x8, 0x4, 0x0, 0xf, 0x0, 0xe0, 0x2, 0x3, 0x0, 0x4, 0x0, 0x0, 0x1, 0x84, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x0, 0x60, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xe4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x0, 0x60, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0xb4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x0, 0x80, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xf4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x0, 0x80, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0x84, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x1, 0x64, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xe4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x1, 0x64, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0xb4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x1, 0x84, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xf4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x1, 0x84, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0x84, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x2, 0x68, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xe4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x2, 0x68, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0xb4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x2, 0x88, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xf4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x2, 0x88, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0x84, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x3, 0x6c, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xe4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x3, 0x6c, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0xb4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x3, 0x8c, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xf4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x3, 0x8c, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0x84, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x4, 0x70, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xe4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x4, 0x70, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0xb4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x4, 0x90, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xf4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x4, 0x90, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0x84, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x5, 0x74, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xe4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x5, 0x74, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0xb4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x5, 0x94, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xf4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x5, 0x94, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0x84, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x6, 0x78, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xe4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x6, 0x78, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0xb4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x6, 0x98, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xf4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x6, 0x98, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0x84, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x7, 0x7c, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xe4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x7, 0x7c, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0xb4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x7, 0x9c, 0x2, 0xc, 0x0, 0x4, 0x0, 0xd, 0x20, 0xf4, 0x53, 0x51, 0x8, 0x3, 0xb, 0x7, 0x7, 0x9c, 0x2, 0x3, 0x0, 0x4, 0x0, 0x10, 0x20, 0x94, 0x38, 0x51, 0x8, 0x4, 0x0, 0xf, 0x0, 0x20, 0x3, 0x3, 0x0, 0x4, 0x0, 0x0, 0x3, 0x8c, 0x5d, 0x51, 0x8, 0x4, 0x0, 0xf, 0x1, 0xa0, 0x2, 0x3, 0x0, 0x4, 0x0, 0x0, 0x3, 0x94, 0x38, 0x51, 0x8, 0x4, 0x0, 0xf, 0x2, 0x24, 0x3, 0x3, 0x0, 0x4, 0x0, 0x4, 0x3, 0xdc, 0x61, 0x51, 0x8, 0x3, 0x0, 0x7, 0x0, 0xe0, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x8, 0xdc, 0x61, 0x51, 0x8, 0x3, 0x0, 0x7, 0x1, 0xe4, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x8, 0xdc, 0x61, 0x51, 0x8, 0x3, 0x0, 0x7, 0x2, 0xe8, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x8, 0xdc, 0x61, 0x51, 0x8, 0x3, 0x0, 0x7, 0x3, 0xec, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x8, 0xdc, 0x61, 0x51, 0x8, 0x3, 0x0, 0x7, 0x4, 0xf0, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x8, 0xdc, 0x61, 0x51, 0x8, 0x3, 0x0, 0x7, 0x5, 0xf4, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x8, 0xdc, 0x61, 0x51, 0x8, 0x3, 0x0, 0x7, 0x6, 0xf8, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x8, 0xdc, 0x61, 0x51, 0x8, 0x3, 0x0, 0x7, 0x7, 0xfc, 0x2, 0x7, 0x0, 0x4, 0x0, 0x4, 0x8, 0xe4, 0x43, 0x51, 0x8, 0x4, 0x0, 0xf, 0x0, 0xd0, 0x3, 0x3, 0x0, 0x1e, 0x0, 0x0, 0x2, 0x4, 0x4e, 0x51, 0x8, 0x4, 0x0, 0xf, 0x1, 0xf0, 0x3, 0x7, 0x0, 0x8, 0x0, 0x0, 0x2, 0xc4, 0x2, 0x52, 0x8, 0x4, 0x0, 0xf, 0x0, 0xf0, 0x2, 0x7, 0x0, 0x60, 0x0, 0x0, 0x1, 0xc, 0x68, 0x51, 0x8, 0x3, 0x0, 0x7, 0x0, 0xda, 0x2, 0x3, 0x0, 0x6, 0x0, 0x0, 0x1, 0x1c, 0x6b, 0x51, 0x8, 0x3, 0x0, 0x7, 0x0, 0xda, 0x2, 0x3, 0x0, 0x6, 0x0, 0x0, 0x1, 0x3c, 0x6e, 0x51, 0x8, 0x3, 0x0, 0x7, 0x0, 0xf0, 0x1, 0x1, 0x0, 0x4, 0x0, 0x0, 0x1, 0x8c, 0x5d, 0x51, 0x8, 0x4, 0x0, 0xf, 0x1, 0xa0, 0x3, 0x3, 0x0, 0x4, 0x0, 0x0, 0x1, 0x9c, 0x82, 0x51, 0x8, 0x2, 0x0, 0x3, 0x0, 0xf0, 0x3, 0x1, 0x0, 0x9, 0x0, 0x0, 0x1, 0xf4, 0x45, 0x51, 0x8, 0x4, 0x0, 0xf, 0x0, 0xf0, 0x3, 0x3, 0x0, 0x4, 0x0, 0x0, 0x1, 0x44, 0x7a, 0x51, 0x8, 0x3, 0x0, 0x7, 0x0, 0xf0, 0x3, 0x3, 0x0, 0xc, 0x0, 0x1, 0x2, 0x50, 0x7a, 0x51, 0x8, 0x3, 0x0, 0x7, 0x0, 0xd0, 0x3, 0x3, 0x0, 0x14, 0x0, 0x1, 0x2, 0x34, 0x80, 0x51, 0x8, 0x1, 0x0, 0x1, 0x0, 0x90, 0x2, 0x1, 0x0, 0x10, 0x0, 0x0, 0x1, 0xc, 0x7c, 0x51, 0x8, 0x6, 0x0, 0x3f, 0x1, 0xe0, 0x3, 0x1, 0x0, 0x4, 0x0, 0x0, 0x2, 0xfc, 0x7b, 0x51, 0x8, 0x3, 0x0, 0x7, 0x1, 0xf8, 0x3, 0x3, 0x0, 0x1, 0x0, 0x0, 0x2, 0x59, 0x16, 0xa, 0x8, 0x2, 0x0, 0x3, 0x0, 0x8, 0x0, 0x3, 0x0, 0x1, 0x0, 0x2, 0x1, 0x64, 0x48, 0x52, 0x8, 0x3, 0x0, 0x7, 0x0, 0x97, 0x2, 0x3, 0x0, 0x8, 0x0, 0x1, 0x2, 0x70, 0x48, 0x52, 0x8, 0x3, 0x0, 0x7, 0x0, 0x87, 0x2, 0x3, 0x0, 0x8, 0x0, 0x1, 0x2];

  constructor(private gbaService: GbaService) { }

  public applyTileAnimationAssembly(address: number) {
    if (this.gbaService.header.gameCode == 'BPRE' && this.gbaService.header.version == 0) {

      // check if script already applied, if so, return; ensures compatibility with existing rom changes
      this.gbaService.goTo(0x70000);
      let flagValue = this.gbaService.getInt();
      let flag = this.gbaService.constants().MAP_TILESET_ANIMATION_FLAG;
      if (flagValue !== flag)
        return;

      this.gbaService.goTo(0x6FFCC);
      this.gbaService.writeBytes(this.tileAnimationReplacementScript, true);
      this.gbaService.writePointer(address, true);
      this.gbaService.writeBytes(this.tileAnimationReplacementScriptFiller, true);
  
      this.gbaService.goTo(0x7004E);
      this.gbaService.writeInt(0, true);
  
      this.gbaService.goTo(0x7008A);
      this.gbaService.writeInt(0, true);
  
      this.gbaService.goTo(address);
      this.gbaService.writeBytes(this.tileAnimationAssemblyScriptBPRE0, true);
  
      let scriptStart = address + 1;

      this.gbaService.goTo(0x70000);
      this.gbaService.writePointer(scriptStart, true);

      this.gbaService.goTo(0x2D4AA4);
      this.gbaService.writePointer(address + 324, true);
      
      this.gbaService.goTo(0x2D4B4C);
      this.gbaService.writePointer(address + 372, true);
  
      this.gbaService.goTo(0x2D4D44);
      this.gbaService.writePointer(address + 388, true);
  
      this.gbaService.goTo(0x2D4D5C);
      this.gbaService.writePointer(address + 404, true);
  
      this.gbaService.goTo(0x2D4EDC);
      this.gbaService.writePointer(address + 420, true);
  
      this.gbaService.goTo(0x2D4FFC);
      this.gbaService.writePointer(address + 436, true);
    } else if (this.gbaService.header.gameCode == 'BPRE' && this.gbaService.header.version == 1) {
      // check if script already applied, if so, return; ensures compatibility with existing rom changes
      this.gbaService.goTo(0x70014);
      let flagValue = this.gbaService.getInt();
      let flag = this.gbaService.constants().MAP_TILESET_ANIMATION_FLAG;
      if (flagValue !== flag) {
        console.log('script already applied!');
        return;
      }

      this.gbaService.goTo(0x6FFE0);
      this.gbaService.writeBytes(this.tileAnimationReplacementScript, true);
      this.gbaService.writePointer(address, true);
      this.gbaService.writeBytes(this.tileAnimationReplacementScriptFiller, true);
  
      this.gbaService.goTo(0x70062);
      this.gbaService.writeInt(0, true);
  
      this.gbaService.goTo(0x7009E);
      this.gbaService.writeInt(0, true);
  
      this.gbaService.goTo(address);
      this.gbaService.writeBytes(this.tileAnimationAssemblyScriptBPRE1, true);
  
      let scriptStart = address + 1;

      this.gbaService.goTo(0x70014);
      this.gbaService.writePointer(scriptStart, true);

      this.gbaService.goTo(0x2D4B14);
      this.gbaService.writePointer(address + 324, true);
      
      this.gbaService.goTo(0x2D4BBC);
      this.gbaService.writePointer(address + 372, true);
  
      this.gbaService.goTo(0x2D4DB4);
      this.gbaService.writePointer(address + 388, true);
  
      this.gbaService.goTo(0x2D4DCC);
      this.gbaService.writePointer(address + 404, true);
  
      this.gbaService.goTo(0x2D4F4C);
      this.gbaService.writePointer(address + 420, true);
  
      this.gbaService.goTo(0x2D506C);
      this.gbaService.writePointer(address + 436, true);
    } else if (this.gbaService.header.gameCode == 'BPEE') {

      // check if script already applied, if so, return; ensures compatibility with existing rom changes
      this.gbaService.goTo(0xA0A7C);
      let flagValue = this.gbaService.getInt();
      let flag = this.gbaService.constants().MAP_TILESET_ANIMATION_FLAG;
      if (flagValue !== flag) {
        console.log('script already applied!');
        return;
      }

      this.gbaService.goTo(0xA0A48);
      this.gbaService.writeBytes(this.tileAnimationReplacementScript, true);
      this.gbaService.writePointer(address, true);
      this.gbaService.writeBytes(this.tileAnimationReplacementScriptFiller, true);
  
      this.gbaService.goTo(0xA0ACA);
      this.gbaService.writeInt(0, true);
  
      this.gbaService.goTo(0xA0B06);
      this.gbaService.writeInt(0, true);
  
      this.gbaService.goTo(address);
      this.gbaService.writeBytes(this.tileAnimationAssemblyScriptBPEE, true);
  
      let scriptStart = address + 1;

      this.gbaService.goTo(0xA0A7C);
      this.gbaService.writePointer(scriptStart, true);

      this.gbaService.goTo(0x3DF718);
      this.gbaService.writePointer(address + 319 + 1, true);
      
      this.gbaService.goTo(0x3DF730);
      this.gbaService.writeInt(0, true);
  
      this.gbaService.goTo(0x3DF748);
      this.gbaService.writePointer(address + 399 + 1, true);
  
      this.gbaService.goTo(0x3DF760);
      this.gbaService.writePointer(address + 543 + 1, true);
  
      this.gbaService.goTo(0x3DF778);
      this.gbaService.writePointer(address + 559 + 1, true);

      this.gbaService.goTo(0x3DF790);
      this.gbaService.writePointer(address + 575 + 1, true);

      this.gbaService.goTo(0x3DF7A8);
      this.gbaService.writePointer(address + 1087 + 1, true);

      this.gbaService.goTo(0x3DF7C0);
      this.gbaService.writeInt(0, true);

      this.gbaService.goTo(0x3DF7D8);
      this.gbaService.writeInt(0, true);

      this.gbaService.goTo(0x3DF7F0);
      this.gbaService.writeInt(0, true);

      this.gbaService.goTo(0x3DF808);
      this.gbaService.writeInt(0, true);

      this.gbaService.goTo(0x3DF820);
      this.gbaService.writePointer(address + 1135 + 1, true);

      this.gbaService.goTo(0x3DF838);
      this.gbaService.writePointer(address + 1263 + 1, true);

      this.gbaService.goTo(0x3DF850);
      this.gbaService.writePointer(address + 1295 + 1, true);

      this.gbaService.goTo(0x3DF868);
      this.gbaService.writePointer(address + 1311 + 1, true);

      this.gbaService.goTo(0x3DF880);
      this.gbaService.writePointer(address + 1327 + 1, true);

      this.gbaService.goTo(0x3DF898);
      this.gbaService.writePointer(address + 1343 + 1, true);

      this.gbaService.goTo(0x3DF8E0);
      this.gbaService.writePointer(address + 1359 + 1, true);

      this.gbaService.goTo(0x3DF9E8);
      this.gbaService.writePointer(address + 1375 + 1, true);

      this.gbaService.goTo(0x3DFB38);
      this.gbaService.writePointer(address + 1391 + 1, true);

      this.gbaService.goTo(0x3DFB68);
      this.gbaService.writePointer(address + 1407 + 1, true);

      this.gbaService.goTo(0x3DFBE0);
      this.gbaService.writePointer(address + 1439 + 1, true);

      this.gbaService.goTo(0x3DFC90);
      this.gbaService.writePointer(address + 1455 + 1, true);

      this.gbaService.goTo(0x3DFCD8);
      this.gbaService.writePointer(address + 1487 + 1, true);

      this.gbaService.goTo(0x3DFD38);
      this.gbaService.writePointer(address + 1503 + 1, true);
    }
  }
}

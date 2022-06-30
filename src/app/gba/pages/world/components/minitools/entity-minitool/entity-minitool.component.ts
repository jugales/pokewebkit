import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GbaService, PendingChange } from 'src/app/gba/services/gba.service';
import { ItemService } from 'src/app/gba/services/item/item.service';
import { MonsterService } from 'src/app/gba/services/monster/monster.service';
import { PorkyScript, PorkyScriptService } from 'src/app/gba/services/scripting/porky-script.service';
import { OverworldService } from 'src/app/gba/services/world/overworld.service';
import { PokeTrainer, TrainerService } from 'src/app/gba/services/world/trainer.service';
import { MapNPCData, MapScriptData, MapSignData, MapWarpData, PokeMap } from 'src/app/gba/structures/world-structures';
import { ScriptEditorDialogComponent } from '../../../dialogs/script-editor-dialog/script-editor-dialog.component';

@Component({
  selector: 'app-entity-minitool',
  templateUrl: './entity-minitool.component.html',
  styleUrls: ['./entity-minitool.component.css']
})
export class EntityMinitoolComponent implements OnInit {

  @Input() public currentMap: PokeMap;
  @Input() public currentEntityType: string = 'NPC';
  @Input() public currentEntityId: number = 0;
  @Input() public currentNPC: MapNPCData;
  @Input() public currentSign: MapSignData;
  @Input() public currentWarp: MapWarpData;
  @Input() public currentScript: MapScriptData;
  @Output() public entitySelected: EventEmitter<any> = new EventEmitter<any>();

  constructor(public gbaService: GbaService, private overworldService: OverworldService, private dialog: MatDialog,
    private trainerService: TrainerService, private scriptService: PorkyScriptService, public itemService: ItemService,
    public monsterService: MonsterService) { }

  ngOnInit(): void {
  }

  public npcSpriteChanged() {
    let directionFrame: number = 0;
    let shouldFlip: boolean = false;
    switch (this.currentNPC.movementType) {
      case 7:
        directionFrame = 1;
        break;
      case 8:
      case 11:
        directionFrame = 0;
        break;
      case 9:
        directionFrame = 2;
        break;
      case 10:
        directionFrame = 2;
        shouldFlip = true;
        break;
    }

    let spriteImage = this.overworldService.getOverworldSprite(this.currentNPC.spriteId & 0xFF, directionFrame);
    let spriteCanvas: HTMLCanvasElement = document.createElement('canvas');
    spriteCanvas.width = spriteImage.width;
    spriteCanvas.height = spriteImage.height;
    let spriteContext = spriteCanvas.getContext('2d');

    if (shouldFlip && spriteImage.width <= 32) {
      spriteContext.save();
      spriteContext.translate(spriteCanvas.width, 0);
      spriteContext.scale(-1, 1);
      spriteContext.drawImage(spriteImage, 0, 0);
      spriteContext.restore();
    } else {
      spriteContext.save();
      spriteContext.drawImage(spriteImage, 0, 0);
      spriteContext.restore();
    }

    this.currentNPC.overworldSprite = spriteCanvas;
  }

  public npcChanged() {
    this.npcSpriteChanged();
    
    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentNPC.address + '-changed';
    pendingChange.changeReason = this.currentMap.label + ' NPC Data Changed';
    pendingChange.address = this.currentNPC.address;
    pendingChange.bytesBefore = this.currentNPC.data;

    let writeBuffer = new ArrayBuffer(24);
    let writeView = new DataView(writeBuffer);

    // write bytes in little endian
    writeView.setUint8(0, this.currentNPC.npcIndex);
    writeView.setUint8(1, this.currentNPC.spriteId);
    writeView.setUint8(2, pendingChange.bytesBefore[2]); // unknown
    writeView.setUint8(3, pendingChange.bytesBefore[3]); // unknown
    writeView.setUint16(4, this.currentNPC.xPosition, true);
    writeView.setUint16(6, this.currentNPC.yPosition, true);
    writeView.setUint8(8, pendingChange.bytesBefore[8]); // unknown
    writeView.setUint8(9, this.currentNPC.movementType);
    writeView.setUint8(10, this.currentNPC.movementParam);
    writeView.setUint8(11, pendingChange.bytesBefore[11]); // unknown
    writeView.setUint8(12, this.currentNPC.isTrainer ? 1 : 0);
    writeView.setUint8(13, pendingChange.bytesBefore[13]); // unknown
    writeView.setUint16(14, this.currentNPC.viewRadius, true);
    writeView.setUint32(16, this.currentNPC.scriptAddress > 0 ? this.gbaService.toPointer(this.currentNPC.scriptAddress) : 0, true);
    writeView.setUint16(20, this.currentNPC.personId, true);
    writeView.setUint8(22, pendingChange.bytesBefore[22]); // unknown
    writeView.setUint8(23, pendingChange.bytesBefore[23]); // unknown

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.gbaService.queueChange(pendingChange);
  }

  public signChanged() {
    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentSign.address + '-changed';
    pendingChange.changeReason = this.currentMap.label + ' Sign Data Changed';
    pendingChange.address = this.currentSign.address;
    pendingChange.bytesBefore = this.currentSign.data;

    let writeBuffer = new ArrayBuffer(12);
    let writeView = new DataView(writeBuffer);

    // write bytes in little endian
    writeView.setUint16(0, this.currentSign.xPosition, true);
    writeView.setUint16(2, this.currentSign.yPosition, true);
    writeView.setUint8(4, this.currentSign.movementLayer);
    writeView.setUint8(5, this.currentSign.signType);
    writeView.setUint8(6, pendingChange.bytesBefore[6]); // unknown
    writeView.setUint8(7, pendingChange.bytesBefore[7]); // unknown
    if (!(this.currentSign.signType == 5 || this.currentSign.signType == 6 || this.currentSign.signType == 7)) {
      writeView.setUint32(8, this.gbaService.toPointer(this.currentSign.scriptAddress), true);
    } else {
      writeView.setUint16(8, this.currentSign.hiddenItemId, true);
      writeView.setUint8(9, this.currentSign.globalHiddenIndex);
      writeView.setUint8(10, this.currentSign.hiddenItemAmount);
    }

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.gbaService.queueChange(pendingChange);
  }

  public warpChanged() {
    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentWarp.address + '-changed';
    pendingChange.changeReason = this.currentMap.label + ' Warp Data Changed';
    pendingChange.address = this.currentWarp.address;
    pendingChange.bytesBefore = this.currentWarp.data;

    let writeBuffer = new ArrayBuffer(8);
    let writeView = new DataView(writeBuffer);

    // write bytes in little endian
    writeView.setUint16(0, this.currentWarp.xPosition, true);
    writeView.setUint16(2, this.currentWarp.yPosition, true);
    writeView.setUint8(4, pendingChange.bytesBefore[4]); // unknown
    writeView.setUint8(5, this.currentWarp.destinationWarp);
    writeView.setUint8(6, this.currentWarp.destinationMap);
    writeView.setUint8(7, this.currentWarp.destinationBank);

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.gbaService.queueChange(pendingChange);
  }

  public scriptChanged() {
    let pendingChange: PendingChange = new PendingChange();
    pendingChange.key = this.currentScript.address + '-changed';
    pendingChange.changeReason = this.currentMap.label + ' Script Data Changed';
    pendingChange.address = this.currentScript.address;
    pendingChange.bytesBefore = this.currentScript.data;

    let writeBuffer = new ArrayBuffer(16);
    let writeView = new DataView(writeBuffer);

    // write bytes in little endian
    writeView.setUint16(0, this.currentScript.xPosition, true);
    writeView.setUint16(2, this.currentScript.yPosition, true);
    writeView.setUint8(4, pendingChange.bytesBefore[4]); // unknown
    writeView.setUint8(5, pendingChange.bytesBefore[5]); // unknown
    writeView.setUint16(6, this.currentScript.varNumber, true);
    writeView.setUint16(8, this.currentScript.varValue, true);
    writeView.setUint8(10, pendingChange.bytesBefore[10]); // unknown
    writeView.setUint8(11, pendingChange.bytesBefore[11]); // unknown
    writeView.setUint32(12, this.gbaService.toPointer(this.currentScript.scriptAddress), true);

    pendingChange.bytesToWrite = new Uint8Array(writeBuffer);
    this.gbaService.queueChange(pendingChange);
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

  public goToTrainer(trainerId: number) {
    this.gbaService.toolSwitched.emit({tool: 'trainerTool' });
    this.trainerService.trainerIndexChanged.emit(trainerId);
  }

  public editScript() {
    switch (this.currentEntityType) {
      case 'NPC':
        this.dialog.open(ScriptEditorDialogComponent, { data: { address: this.currentNPC.scriptAddress } });
        break;
      case 'SIGN':
        this.dialog.open(ScriptEditorDialogComponent, { data: { address: this.currentSign.scriptAddress } });
        break;
      case 'SCRIPT':
        this.dialog.open(ScriptEditorDialogComponent, { data: { address: this.currentScript.scriptAddress } });
        break;
    }
  }

  public setCurrentEntity(id: number, type: string) {
    this.currentEntityId = id;
    this.currentEntityType = type;
    
    this.entitySelected.emit({ id: id, type: type });
  }

  public setEntityForward() {
    switch (this.currentEntityType) {
      case 'NPC':
        if (this.currentNPC.uid + 1 >= (this.currentMap.entityData.npcs.length))
          return;
        this.setCurrentEntity(this.currentNPC.uid + 1, 'NPC');
        break;
      case 'SIGN':
        if (this.currentSign.uid + 1 >= (this.currentMap.entityData.signs.length))
          return;
        this.setCurrentEntity(this.currentSign.uid + 1, 'SIGN');
        break;
      case 'WARP':
        if (this.currentWarp.uid + 1 >= (this.currentMap.entityData.warps.length))
          return;
        this.setCurrentEntity(this.currentWarp.uid + 1, 'WARP');
        break;
      case 'SCRIPT':
        if (this.currentScript.uid + 1 >= (this.currentMap.entityData.scripts.length))
        return;
        this.setCurrentEntity(this.currentScript.uid + 1, 'SCRIPT');
        break;
    }
  }

  public setEntityBackward() {
    switch (this.currentEntityType) {
      case 'NPC':
        if (this.currentNPC.uid - 1 < 0)
          return;
        this.setCurrentEntity(this.currentNPC.uid - 1, 'NPC');
        break;
      case 'SIGN':
        if (this.currentSign.uid - 1 < 0)
          return;
        this.setCurrentEntity(this.currentSign.uid - 1, 'SIGN');
        break;
      case 'WARP':
        if (this.currentWarp.uid - 1 < 0)
          return;
        this.setCurrentEntity(this.currentWarp.uid - 1, 'WARP');
        break;
      case 'SCRIPT':
        if (this.currentScript.uid - 1 < 0)
        return;
        this.setCurrentEntity(this.currentScript.uid - 1, 'SCRIPT');
        break;
    }
  }

  public movementTypes: string[] = ['No Movement', 'Look around', 'Walk around', 'Walk up and down', 'Walk up and down', 'Walk left and right', 'Walk left and right', 'Look up', 'Look down', 'Look left', 'Look right', 'Look down', 'Hidden', 'Look up and down', 'Look left and right', 'Look up and left', 'Look up and right', 'Look down and left', 'Look down and right', 'Look up, down and left', 'Look up, down and right', 'Look up, left and right', 'Look down, left and right', 'Look around counterclockwise', 'Look around clockwise', 'Run up and down', 'Run up and down', 'Run left and right', 'Run left and right', 'Run up, right, left and down', 'Run right, left, down and up', 'Run down, up, right and left', 'Run left, down, up and right', 'Run up, left, right and down', 'Run left, right, down and up', 'Run down, up, left and right', 'Run right, down, up and left', 'Run left, up, down and right', 'Run up, down, right and left', 'Run right, left, up and down', 'Run down, right, left and up', 'Run right, up, down and left', 'Run up, down, left and right', 'Run left, right, up and down', 'Run down, left, right and up', 'Run around counterclockwise', 'Run around counterclockwise', 'Run around counterclockwise', 'Run around counterclockwise', 'Run around counterclockwise', 'Run around clockwise', 'Run around clockwise', 'Run around clockwise', 'Copy Player', 'Mirror Player', 'Mirror Player', 'Mirror Player', 'Tree wall disguise', 'Rock wall disguise', 'Mirror player (standing)', 'Copy player (standing)', 'Mirror player (standing)', 'Mirror player (standing)', 'Hidden', 'Walk on the spot (Down)', 'Walk on the spot (Up)', 'Walk on the spot (Left)', 'Walk on the spot (Right)', 'Jog on the spot (Down)', 'Jog on the spot (Up)', 'Jog on the spot (Left)', 'Jog on the spot (Right)', 'Run on the spot (Down)', 'Run on the spot (Up)', 'Run on the spot (Left)', 'Run on the spot (Right)', 'Hidden', 'Walk on the spot (Down)', 'Walk on the spot (Up)', 'Walk on the spot (Left)', 'Walk on the spot (Right)'];

}

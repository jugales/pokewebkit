import { Injectable } from '@angular/core';
import { CharacterSetService } from './character-set.service';
import { PorkyScriptCommandTemplate, PorkyScriptConstants } from './porky-script-constants';
import { GbaService } from './rom.service';
import * as _ from 'lodash-es';


/**
 * Bringing the best of PokeScript and Poryscript into one place for ROM hacking.
 * It won't be easy but it is worth the funny name.
 */
@Injectable({
  providedIn: 'root'
})
export class PorkyScriptService {

  public constants: PorkyScriptConstants = new PorkyScriptConstants();

  constructor(private gbaService: GbaService, private characterSetService: CharacterSetService) { }


  public decompile(dataAddress: number, existingSecondaryScriptAddresses?: number[]): PorkyScript {
    
    let script: PorkyScript = new PorkyScript();
    script.address = dataAddress;

    let isCompletelyDone: boolean = false;
    let currentAddress: number = dataAddress - 1;

    script.secondaryScriptAddresses = [];
    script.textAddresses = [];
    script.movementAddresses = [];

    while (!isCompletelyDone) {
      currentAddress++;

      let commandValue = this.gbaService.getByteAt(currentAddress);
      let commandTemplate: PorkyScriptCommandTemplate = _.cloneDeep(this.constants.commands.get(commandValue));
      let command: PorkyScriptCommand = new PorkyScriptCommand(commandTemplate);

      if (!commandTemplate)
        break;

      let paramOffset: number = 1;
      let paramCount: number = commandTemplate.paramCount;

      for (let i = 0; i < paramCount; i++) {
        let paramLength = commandTemplate.paramLengths[i];
        switch (paramLength) {
          case 1:
            this.gbaService.goTo(currentAddress + paramOffset);
            let byteValue: number = this.gbaService.getByte();

            if (commandTemplate.label == 'trainerbattle') {
              if (byteValue == 0 || byteValue == 5) {
                commandTemplate.paramLengths.splice(commandTemplate.paramLengths.length - 1, 1);
                commandTemplate.commandLength -= 4;
              }
            }

            command.paramValues.push(byteValue);
            paramOffset += 1;
            break;
          case 2:
            this.gbaService.goTo(currentAddress + paramOffset);
            let shortValue: number = this.gbaService.getShort();

            command.paramValues.push(shortValue);
            paramOffset += 2;
            break;
          case 4:
            this.gbaService.goTo(currentAddress + paramOffset);
            let addressValue = this.gbaService.getPointer();
            
            if (!existingSecondaryScriptAddresses)
              existingSecondaryScriptAddresses = [];

            // secondary script call
            if (!script.secondaryScriptAddresses.includes(addressValue) && (!existingSecondaryScriptAddresses.includes(addressValue)) && ((commandTemplate.label == 'call' || commandTemplate.label == 'goto' 
                || commandTemplate.label == 'if1' || commandTemplate.label == 'if2') && !script.secondaryScriptAddresses.includes(addressValue)
                || commandTemplate.label == 'trainerbattle'))
                script.secondaryScriptAddresses.push(addressValue);

            // text call
            if (!script.textAddresses.includes(addressValue) && ((commandTemplate.label == 'loadpointer' 
              && this.gbaService.getByte() == this.getCommand('callstd').index || commandTemplate.label == 'preparemsg') && !script.textAddresses.includes(addressValue)))
              script.textAddresses.push(addressValue);

            // movement call
            if (!script.movementAddresses.includes(addressValue) && (commandTemplate.label == 'applymovement' && !script.textAddresses.includes(addressValue)))
            script.movementAddresses.push(addressValue);

            command.paramValues.push(addressValue);
            paramOffset += 4;
            break;
          default:
            break;
        }
      }

      if (commandTemplate.commandLength > 0) {
        currentAddress += commandTemplate.commandLength - 1;
        dataAddress += commandTemplate.commandLength - 1;
      }
      dataAddress++;

      if (commandTemplate.label == 'end' || commandTemplate.label == 'return' || commandTemplate.label == 'goto') {
        isCompletelyDone = true;
      }

      if (command && command.template)
        script.commands.push(command);
    }

    if (!existingSecondaryScriptAddresses)
      existingSecondaryScriptAddresses = script.secondaryScriptAddresses.slice(0);
    for (let i = 0; i < script.secondaryScriptAddresses.length; i++) {
      try { 
        let secondaryScript: PorkyScript = this.decompile(script.secondaryScriptAddresses[i]);
        existingSecondaryScriptAddresses.push.apply(secondaryScript.secondaryScriptAddresses);
        script.secondaryScripts.push(secondaryScript);
      } catch (e: any) { 
        break;
      }
    }
    for (let i = 0; i < script.textAddresses.length; i++) {
      this.gbaService.goTo(script.textAddresses[i]);
      let scriptText: PorkyScriptText = new PorkyScriptText(script.textAddresses[i], this.gbaService.getGameStringAutoList(1)[0])
      script.texts.push(scriptText);
    }
    for (let i = 0; i < script.movementAddresses.length; i++) {
      this.gbaService.goTo(script.movementAddresses[i]);
      let movements: number[] = [];
      while (movements[movements.length - 1] !== 0xFE) { // 0xFE is sentinel for end of movements
        movements.push(this.gbaService.getByte());
      }

      let scriptMovement: PorkyScriptMovement = new PorkyScriptMovement(script.movementAddresses[i], movements)
      script.movements.push(scriptMovement);
    }

    return script;
  }

  public getCommand(label: string) {
    for (let value of this.constants.commands.values()) {
      if (label == value.label) {
        return value;
      }
    }
    return new PorkyScriptCommandTemplate(-1, 'unknown', 1, 0, [], 'Unknown command');
  }

  public toXSE(script: PorkyScript): string {
    console.log('Converting to XSE: ' + script.address.toString(16).toUpperCase());
    let result = this.toXSEScript(script);
    result += '\n';

    let hasTexts: boolean = this.hasXSETexts(script);
    if (hasTexts) {
      result += '\n';
      result += '\'---------\n';
      result += '\' Strings\n';
      result += '\'---------\n';
    }
    result += this.toXSEText(script);
    if (hasTexts)
      result += '\n';

    if (this.hasXSEMovements(script)) {
      result += '\'-----------\n';
      result += '\' Movements\n';
      result += '\'-----------\n';
    }
    result += this.toXSEMovement(script);

    return result.trim();
  }

  private hasXSEMovements(script: PorkyScript) {
    if (script.movements.length > 0)
      return true;

    for (let i = 0; i < script.secondaryScripts.length; i++) {
      if (script.secondaryScripts[i].movements.length > 0)
        return true;
    }
    return false;
  }

  private hasXSETexts(script: PorkyScript) {
    if (script.texts.length > 0)
      return true;

    for (let i = 0; i < script.secondaryScripts.length; i++) {
      if (script.secondaryScripts[i].texts.length > 0)
        return true;
    }
    return false;
  }

  private toXSEText(script: PorkyScript, existingResult?: string) {
    if (!existingResult)
      existingResult = '';
    
    let result = '';
    for (let i = 0; i < script.texts.length; i++) {
      let sectionKey: string = '#org 0x' + script.texts[i].address.toString(16).toUpperCase() + '\n';
      if (result.indexOf(sectionKey) !== -1 || existingResult.indexOf(sectionKey) !== -1)
        continue;
      result += sectionKey;
      result += '= ' + script.texts[i].text.split('\n').join('\\n').replace('|FD|À', '[player]').replace('|FD|É', '[rival]') + '\n\n';
    }

    existingResult += result;
    for (let i = 0; i < script.secondaryScripts.length; i++) {
      result += this.toXSEText(script.secondaryScripts[i], existingResult);
    }
    return result;
  }

  private toXSEMovement(script: PorkyScript, existingResult?: string) {
    if (!existingResult)
      existingResult = '';

    let result = '';
    for (let i = 0; i < script.movements.length; i++) {
      let sectionKey: string = '#org 0x' + script.movements[i].address.toString(16).toUpperCase() + '\n';
      if (result.indexOf(sectionKey) !== -1 || existingResult.indexOf(sectionKey) !== -1)
        continue;

      result += sectionKey;
      for (let j = 0; j < script.movements[i].movements.length; j++) {
        let movementValue: number = script.movements[i].movements[j];
        result += '#raw 0x' + movementValue.toString(16).toUpperCase();
        if (this.constants.movementTypes.has(movementValue)) {}
          result += ' \'' + this.constants.movementTypes.get(movementValue);
        result += '\n';
      }
      result += '\n';
    }

    existingResult += result;
    for (let i = 0; i < script.secondaryScripts.length; i++) {
      result += this.toXSEMovement(script.secondaryScripts[i], existingResult);
    }

    return result;
  }

  private toXSEScript(script: PorkyScript, existingResult?: string) {
    if (!existingResult)
      existingResult = '';
    if (existingResult.includes('0x' + script.address.toString(16)) ) {
      return '';
    }
    let result = '\n\'---------------\n';
    result += '#org 0x' + script.address.toString(16).toUpperCase() + '\n';
    for (let i = 0; script.commands.length; i++) {
      let command: PorkyScriptCommand = script.commands[i];
      if (!command)
        break;

      let commandText = this.toXSECommand(script, command, i);
      
      // check if two commands in one (e.g. msgbox) and skip if needed
      if (commandText.startsWith('msgbox') || commandText.startsWith('giveitem2'))
        i++;
      if (commandText.startsWith('giveitem'))
        i += 2;

      result += commandText + '\n';
    }

    // replace globals
    result = result.replace(/0x800C/g, 'PLAYERFACING');
    result = result.replace(/0x800D/g, 'LASTRESULT');
    result = result.replace(/0x800F/g, 'LASTTALKED');

    existingResult += result;
    for (let i = 0; i < script.secondaryScripts.length; i++) {
      if (existingResult.indexOf('0x' + script.secondaryScripts[i].address.toString(16).toUpperCase()))
        result += this.toXSEScript(script.secondaryScripts[i], existingResult);
    }
    

    return result;
  }

  private toXSECommand(script: PorkyScript, command: PorkyScriptCommand, index: number) {
    let commandText: string = '';

    if (command && command.template) {
      switch (command.template.label) {
        case 'loadpointer':
          if (script.commands.length > (index + 1) && script.commands[index + 1].template.label == 'callstd') {
            commandText = 'msgbox 0x8' + command.paramValues[1].toString(16).toUpperCase() 
              + ' ' + this.constants.messageTypes.get(script.commands[index + 1].paramValues[0]);
            let commandComment = this.getTextAt(script, command.paramValues[1]).split('\n').join('\\n')
              .replace('|FD|À', '[player]').replace('|FD|É', '[rival]');
            let shouldEllipse: boolean = commandComment && commandComment.length > 35;
            commandText += commandComment ? (' \'"' + commandComment.substring(0, 34) + (shouldEllipse ? '...' : '') + '"') : '';
          } else {
            commandText = command.template.label;
            for (let i = 0; i < command.paramValues.length; i++) {
              if (command.paramValues[i].toString(16).length <= 4)
                commandText += ' 0x' + command.paramValues[i].toString(16).toUpperCase();
              else
                commandText += ' 0x8' + command.paramValues[i].toString(16).toUpperCase();
            }
          }
          break;
        case 'preparemsg':
          commandText = command.template.label;
          for (let i = 0; i < command.paramValues.length; i++) {
            if (command.paramValues[i].toString(16).length <= 4)
              commandText += ' 0x' + command.paramValues[i].toString(16).toUpperCase();
            else
              commandText += ' 0x8' + command.paramValues[i].toString(16).toUpperCase();
          }

          let commandComment = this.getTextAt(script, command.paramValues[0]).split('\n').join('\\n')
            .replace('|FD|À', '[player]').replace('|FD|É', '[rival]');
          let shouldEllipse: boolean = commandComment && commandComment.length > 35;
          if (commandComment) {
            commandText += commandComment ? (' \'"' + commandComment.substring(0, 34) + (shouldEllipse ? '...' : '') + '"') : '';
          }
          break;
        case 'copyvarifnotzero':
          if (script.commands.length > (index + 3) && script.commands[index].template.label == 'copyvarifnotzero' 
            && script.commands[index + 1].template.label == 'copyvarifnotzero' && script.commands[index + 2].template.label == 'copyvarifnotzero'
            && script.commands[index + 3].template.label == 'callstd') {
            let itemId: number = script.commands[index].paramValues[1];
            let quantity: number = script.commands[index + 1].paramValues[1];
            let song: number = script.commands[index + 2].paramValues[1];
          
            commandText = 'giveitem2'
              + ' 0x' + itemId.toString(16).toUpperCase() 
              + ' 0x' + quantity.toString(16).toUpperCase() 
              + ' 0x' + song.toString(16).toUpperCase();
          } else 
          if (script.commands.length > (index + 3) && script.commands[index].template.label == 'copyvarifnotzero' 
            && script.commands[index + 1].template.label == 'copyvarifnotzero' && script.commands[index + 2].template.label == 'callstd') {
              let itemId: number = script.commands[index].paramValues[1];
              let quantity: number = script.commands[index + 1].paramValues[1];
              let messageType: number = script.commands[index + 2].paramValues[0];
            
              commandText = 'giveitem'
                + ' 0x' + itemId.toString(16).toUpperCase() 
                + ' 0x' + quantity.toString(16).toUpperCase() 
                + ' ' + this.constants.messageTypes.get(messageType);
          } else {
            commandText = command.template.label;
            for (let i = 0; i < command.paramValues.length; i++) {
              if (command.paramValues[i].toString(16).length <= 4)
                commandText += ' 0x' + command.paramValues[i].toString(16).toUpperCase();
              else
                commandText += ' 0x8' + command.paramValues[i].toString(16).toUpperCase();
            }
          }
          break;
        case 'if1':
          commandText = 'if 0x' + command.paramValues[0].toString(16).toUpperCase() + ' goto 0x8' + command.paramValues[1].toString(16).toUpperCase();
          break;
        case 'if2':
          commandText = 'if 0x' + command.paramValues[0].toString(16).toUpperCase() + ' call 0x8' + command.paramValues[1].toString(16).toUpperCase();
          break;
        default:
          commandText = command.template.label;
          for (let i = 0; i < command.paramValues.length; i++) {
            if (command.paramValues[i].toString(16).length <= 4)
              commandText += ' 0x' + command.paramValues[i].toString(16).toUpperCase();
            else
              commandText += ' 0x8' + command.paramValues[i].toString(16).toUpperCase();
          }

          break;
      }
    }

    // replace globals
    commandText = commandText.replace('applymovement 0xFF', 'applymovement MOVE_PLAYER');

    return commandText;
  }

  private getTextAt(script: PorkyScript, address: number) {
    for (let i = 0; i < script.texts.length; i++) {
      if (script.texts[i].address == address) {
        return script.texts[i].text;
      }
    }
    return undefined;
  }


}
export class PokeScriptParam {

  constructor(

  ) { }
}
export class PorkyScript {

  constructor(
    public address?: number,
    public commands: PorkyScriptCommand[] = [],
    public secondaryScripts: PorkyScript[] = [],
    public texts: PorkyScriptText[] = [],
    public movements: PorkyScriptMovement[] = [],

    public secondaryScriptAddresses: number[] = [],
    public textAddresses: number[] = [],
    public movementAddresses: number[] = []
  ) { }
}
// command instance in script
export class PorkyScriptCommand {

  constructor(
    public template: PorkyScriptCommandTemplate,
    public paramValues: number[] = []
  ) { }
}
// command template

export class PorkyScriptMovement {

  constructor(
    public address: number, 
    public movements: number[] = []
  ) { }
}
export class PorkyScriptText {

  constructor(
    public address: number, 
    public text: string
  ) { }
}

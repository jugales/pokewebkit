/* It was getting a little too fluffy in the porky-script.ts file, so 
   separating logic and static data should help the brain ache
*/
export class PorkyScriptConstants {

    public commands: Map<Number, PorkyScriptCommandTemplate> = new Map<Number, PorkyScriptCommandTemplate>();;
    public commandTemplates: Map<Number, PorkyScriptCommandTemplate> = new Map<Number, PorkyScriptCommandTemplate>();
    public messageTypes: Map<Number, String> = new Map<Number, String>();
    public movementTypes: Map<Number, String> = new Map<Number, String>();

    constructor() { 
        this.loadCommandTemplates();
    }

    private loadCommandTemplates() {
        let commands: string[][] = [
          ["","nop","0","Does nothing at all.","1","0"],
          ["3","nop1","1","Does nothing at all.","5","1"],
          ["","end","2","Terminates execution of the script","1","0"],
          ["","return","3","Pops back to the last calling command used","1","0"],
          ["3","call","4","Continues script execution from another point. Can be returned to.","5","1"],
          ["3","goto","5","Continues script execution from another point.","5","1"],
          ["13","if1","6","In the last comparison returned a value, jumps to another script","6","2"],
          ["13","if2","7","Calling version of if command","6","2"],
          ["1","gotostd","8","Jumps to a built-in function","2","1"],
          ["1","callstd","9","Calls a built-in function","2","1"],
          ["11","gotostdif","10","Jumps to a built-in function, conditional","3","2"],
          ["11","callstdif","11","Jump to a built-in function, conditional","3","2"],
          ["","jumpram","12","Jumps to a default RAM location, executing the script stored there.","1","0"],
          ["","killscript","13","Kills the script and resets the script RAM.","1","0"],
          ["1","setbyte","14","Sets a predefined address to the specified byte value.","2","1"],
          ["13","loadpointer","15","Loads a pointer into the script RAM so other commands can use it.","6","2"],
          ["11","setbyte2","16","Sets a memory bank to the specified byte.","3","2"],
          ["13","writebytetooffset","17","Sets the byte at the specified offset to a certain value.","6","2"],
          ["13","loadbytefrompointer","18","Loads the byte found at the pointer into the script RAM so other commands can use it.","6","2"],
          ["13","setfarbyte","19","Sets the byte into a specified pointer.","6","2"],
          ["11","copyscriptbanks","20","Copies one script bank to another.","3","2"],
          ["33","copybyte","21","Copies a byte value from one place to another.","9","2"],
          ["22","setvar","22","Sets variable A to any value.","5","2"],
          ["22","addvar","23","Adds any value to variable A.","5","2"],
          ["22","subvar","24","Subtracts any value from variable A.","5","2"],
          ["22","copyvar","25","Copies variable B to A.","5","2"],
          ["22","copyvarifnotzero","26","Sets variable B to A, but only if B is higher than zero.","5","2"],
          ["22","comparebanks","27","Compares two banks.","5","2"],
          ["11","comparebanktobyte","28","Compares a variable stored in a buffer to a byte value.","3","2"],
          ["13","comparebanktofarbyte","29","Compares a bank with a byte at some location","6","2"],
          ["31","comparefarbytetobank","30","Compares a byte at some location to a buffered variable. The reverse of comparebanktofatbyte","6","2"],
          ["31","comparefarbytetobyte","31","Compares a byte at some location to a byte value.","6","2"],
          ["33","comparefarbytes","32","Compares a byte at some location to a byte at another location","9","2"],
          ["22","compare","33","Compares variable A to a value","5","2"],
          ["22","comparevars","34","Compares two variables","5","2"],
          ["3","callasm","35","Calls a custom ASM routine","5","1"],
          ["3","cmd24","36","Unknown Command","5","1"],
          ["2","special","37","Calls a special event (ASM)","3","1"],
          ["22","special2","38","Calls a special event and returns a value (ASM)","5","2"],
          ["","waitstate","39","Sets the script to a wait state, useful for some specials and commands.","1","0"],
          ["2","pause","40","Pauses script execution for a short amount of time.","3","1"],
          ["2","setflag","41","Sets a flag for later use.","3","1"],
          ["2","clearflag","42","Clears the value of a flag.","3","1"],
          ["2","checkflag","43","Checks the value of a flag.","3","1"],
          ["22","cmd2c","44","Unknown Command","5","2"],
          ["","checkdailyflags","45","Checks the daily flags to see if any of them have been set already, but only if they were set previously. Then it clears those flags. R/S/E only.","1","0"],
          ["","resetvars","46","Resets the value of variables 0x8000, 0x8001, and 0x8002.","1","0"],
          ["2","sound","47","Plays a sound.","3","1"],
          ["","checksound","48","Checks if a sound/fanfare/song is currently being played.","1","0"],
          ["2","fanfare","49","Plays a Sappy song as a fanfare.","3","1"],
          ["","waitfanfare","50","Waits for a fanfare to finish.","1","0"],
          ["21","playsong","51","Switches to another Sappy song.","4","2"],
          ["2","playsong2","52","Switches to another Sappy song","3","1"],
          ["","fadedefault","53","Gently fades the current music back to the map's default song.","1","0"],
          ["2","fadesong","54","Gently fades into another Sappy song.","3","1"],
          ["1","fadeout","55","Fades you the currently playing Sappy song.","2","1"],
          ["1","fadein","56","Fades the currently playing Sappy song back in.","2","1"],
          ["11122","warp","57","Warps the player to another map.","8","5"],
          ["11122","warpmuted","58","Warps the player to another map. No sound effect","8","5"],
          ["11122","warpwalk","59","Warps the player to another map. Walking effect.","8","5"],
          ["11","warphole","60","Warps the player to another map. Hole effect.","3","2"],
          ["11122","warpteleport","61","Warps the player to another map. Teleport effect","8","5"],
          ["11122","warp3","62","Warps the player to another map.","8","5"],
          ["11122","setwarpplace","63","Sets the place a warp that lead to warp 127 of map 127. 127 warps the player. (It's confusing...)","8","5"],
          ["11122","warp4","64","Warps the player to another map.","8","5"],
          ["11122","warp5","65","Warps the player to another map.","8","5"],
          ["22","getplayerpos","66","Gets current position of the player on the map and stores it on specified variables.","5","2"],
          ["","countpokemon","67","Counts the number of Pokemon in your party and stores the result in LASTRESULT","1","0"],
          ["22","additem","68","Adds the quantity of the specified item.","5","2"],
          ["22","removeitem","69","Removes the quantity of the specified item.","5","2"],
          ["22","checkitemroom","70","Checks to see if the player has enough room in the bag for the specified item.","5","2"],
          ["22","checkitem","71","Checks if the player is carrying the specified item.","5","2"],
          ["2","checkitemtype","72","Checks the item type for the specified item and stores the result in LASTRESULT.","3","1"],
          ["22","addpcitem","73","Adds the quantity of the specified item to player's PC.","5","2"],
          ["2","adddecoration","75","Adds a decoration to player's PC.","3","1"],
          ["2","removedecoration","76","Removes a decoration from player's PC.","3","1"],
          ["2","testdecoration","77","Tests a specific decoration to see if there's enough room to store it.","3","1"],
          ["2","checkdecoration","78","Checks if a specific decoration is present in player's PC","3","1"],
          ["23","applymovement","79","Applies the movement data found at the specified pointer to a sprite.","7","2"],
          ["23","applymovementpos","80","Applies the movement data found at the specified pointer to a sprite. Then sets the specified X/Y coordinates.","7","2"],
          ["2","waitmovement","81","Waits for applymovement to finish","3","1"],
          ["2","hidesprite","83","Hides a sprite.","3","1"],
          ["211","hidespritepos","84","Hides a sprite, then sets the specified X/Y corrdinates.","5","3"],
          ["2","showsprite","85","Shows a previously vanished sprite.","3","1"],
          ["211","showspritepos","86","Shows a previously vanished sprite. Then sets the specified X/Y.","5","3"],
          ["222","movesprite","87","Moves a sprite to the specified location.","7","3"],
          ["211","spritevisible","88","Makes the sprite visible at selected bank and map.","5","3"],
          ["211","spriteinvisible","89","Makes the sprite invisible at selected bank and map.","5","3"],
          ["","faceplayer","90","Turns the caller towards the player.","1","0"],
          ["21","spriteface","91","Changes the facing of a sprite","4","2"],
          ["122333","trainerbattle","92","Starts a trainer battle. Depending on the kind of battle, last parameters may differ.","18","6"],
          ["","repeattrainerbattle","93","Repeats the last trainer battle started.","1","0"],
          ["","endtrainerbattle","94","Returns from the trainer battle screen without starting message.","1","0"],
          ["","endtrainerbattle2","95","Returns from the trainer battle screen without ending message.","1","0"],
          ["2","checktrainerflag","96","Checks it the specified trainer flag is already activated and store the result in LASTRESULT.","3","1"],
          ["2","cleartrainerflag","97","Deactivates the specified trainer flag.","3","1"],
          ["2","settrainerflag","98","Activates the specified trainer flag.","3","1"],
          ["222","movesprite2","99","Moves a sprite to the specified location. Permanent change.","7","3"],
          ["2","moveoffscreen","100","Changes the location of the specified sprite to a value which is exactly one tile above the top left corner of the screen.","3","1"],
          ["21","spritebehave","101","Changes the behaviour of a sprite.","4","2"],
          ["","waitmsg","102","Waits for preparemsg to finish.","1","0"],
          ["3","preparemsg","103","Prepares a pointer to dialogue text for being displayed.","5","1"],
          ["","closeonkeypress","104","Holds a msgbox open and closes it on keypress.","1","0"],
          ["","lockall","105","Locks down movement for all the people on the screen.","1","0"],
          ["","lock","106","Locks down movement for the caller.","1","0"],
          ["","releaseall","107","Resumes normal movement forall the people on the screen. Closes any previously opened msgboxes as well.","1","0"],
          ["","release","108","Resumes normal movement for the caller. Closes any previously opened msgboxes as well.","1","0"],
          ["","waitkeypress","109","Waits until a key is pressed.","1","0"],
          ["11","yesnobox","110","Displays a Yes/No box at specified coordinates.","3","2"],
          ["1111","multichoice","111","Puts up a list of choices for the player to make.","5","4"],
          ["11111","multichoice2","112","Puts up a list of choices for the player to make. A default choice can be set.","6","5"],
          ["11111","multichoice3","113","Puts up a list of choices for the player to make. The number of choices per row can be set.","6","5"],
          ["1111","showbox","114","Displays a box with the given dimensions.","5","4"],
          ["1111","hidebox","115","Hides a displayed box. Ruby/Sapphire only.","5","4"],
          ["1111","clearbox","116","Clears a part of a custom box.","5","4"],
          ["211","showpokepic","117","Displays a Pokemon in a picture box.","5","3"],
          ["","hidepokepic","118","Hides a Pokemon picture box previously shown.","1","0"],
          ["1","showcontestwinner","119","Shows the picture of the winner of set contest.","2","1"],
          ["3","braille","120","Displays a braille box.","5","1"],
          ["212331","givepokemon","121","Gives the player a Pokemon.","15","6"],
          ["2","giveegg","122","Gives the player an egg of the specified Pokemon.","3","1"],
          ["112","setpokemonpp","123","Sets a new amount of PP for the specified Pokemon in player's party.","5","3"],
          ["2","checkattack","124","Checks if at least one Pokemon in the party has a particular attack.","3","1"],
          ["12","bufferpokemon","125","Stores a Pokemon name within a specified buffer.","4","2"],
          ["1","bufferfirstpokemon","126","Stores the first Pokemon name in player's party within a specified buffer.","2","1"],
          ["12","bufferpartypokemon","127","Stores the selected Pokemon name in player's party within a specified buffer.","4","2"],
          ["12","bufferitem","128","Stores an item name within a specified buffer.","4","2"],
          ["12","bufferdecoration","129","Stores a decoration name within a specified buffer.","4","2"],
          ["12","bufferattack","130","Stores an attack name within a specified buffer.","4","2"],
          ["12","buffernumber","131","Variable version on buffernumber","4","2"],
          ["12","bufferstd","132","Stores a standard string within a specified buffer.","4","2"],
          ["13","bufferstring","133","Stores a string within a specified buffer.","6","2"],
          ["3","pokemart","134","Opens the Pokemart shop system with the item/price list found at the selected pointer.","5","1"],
          ["3","pokemart2","135","Opens the PokeMart shop system with the item/price list found at the selected pointer.","5","1"],
          ["3","pokemart3","136","Opens the PokeMart shop system with the item/price list found at the selected pointer.","5","1"],
          ["2","pokecasino","137","Opens the Casino system.","3","1"],
          ["111","cmd8a","138","Apparently does absolutely nothing.","4","3"],
          ["22","checkpcitem","74","Checks if the player has the specified item on his/her PC.","5","2"],
          ["211","waitmovementpos","82","Waits for applymovement to finish. Then sets the specified X/Y coordinates.","5","3"],
          ["","choosecontestpkmn","139","Opens up a menu for choosing a contest Pokemon.","1","0"],
          ["","startcontest","140","Start a Pokemon Contest.","1","0"],
          ["","showcontestresults","141","Shows Pokemon contest results.","1","0"],
          ["","contestlinktransfer","142","Establishes a connection using the wireless adapter. Emerald only.","1","0"],
          ["2","random","143","Generates a random number storing it into LASTRESULT.","3","1"],
          ["31","givemoney","144","Gives the player some money.","6","2"],
          ["31","paymoney","145","Takes some money from the player.","6","2"],
          ["31","checkmoney","146","Checks if the player has a specified amount of money.","6","2"],
          ["111","showmoney","147","Shows the money counter on set coordinates..","4","2"],
          ["11","hidemoney","148","Hides the money counter.","3","2"],
          ["11","updatemoney","149","Updates the amount of money displayed in the money counter.","3","2"],
          ["2","cmd96","150","Apparently does absolutely nothing.","3","1"],
          ["1","fadescreen","151","Fades the screen in or out.","2","1"],
          ["11","fadescreendelay","152","Fades the screen in or out, after some delay.","3","2"],
          ["2","darken","153","Calls flash animation that lightens the area. Must be called from a level script.","3","1"],
          ["1","lighten","154","Calls flash animation that lightens the area.","2","1"],
          ["3","preparemsg2","155","Unknown Command","5","1"],
          ["2","doanimation","156","Executes the specified move animation.","3","1"],
          ["12","setanimation","157","Sets the move animation.","4","2"],
          ["2","checkanimation","158","Checks whether an animation is currently being played or not. If so, it'll pause until the animation is done.","3","1"],
          ["2","sethealingplace","159","Sets the place where the player goes once he/she is out of usable Pokemon.","3","1"],
          ["","checkgender","160","Checks if the player is a boy or a girl and stores it in LASTRESULT.","1","0"],
          ["22","cry","161","Plays back the cry of a Pokemon.","5","2"],
          ["2222","setmaptile","162","Sets a tile on the map. You must somehow refresh that part.","9","4"],
          ["","resetweather","163","Prepares to fade the weather into the default type.","1","0"],
          ["2","setweather","164","Prepares to fade the weather into the type specified.","3","1"],
          ["","doweather","165","riggers the weather change set with setweather/resetweather.","1","0"],
          ["1","cmda6","166","Unknown Command.","2","1"],
          ["2","setmapfooter","167","Changes the current map footer loading the new one. The map must be refreshed afterwards in order to work fine.","3","1"],
          ["2111","spritelevelup","168","Makes the specified sprite go up one level at selected bank and map.","6","4"],
          ["211","restorespritelevel","169","Restores the original level, at selected bank and map, for the specified sprite.","5","3"],
          ["112211","createsprite","170","Creates a virtual sprite in the current map.","9","6"],
          ["11","spriteface2","171","Changes a facing of a virtual sprite.","3","2"],
          ["22","setdooropened","172","Prepares a door to be opened.","5","2"],
          ["22","setdoorclosed","173","Prepares a door to be closed.","5","2"],
          ["","doorchange","174","Changes the state of the selected door.","1","0"],
          ["22","setdooropened2","175","Prepares a door to be opened. No animation.","5","2"],
          ["22","setdoorclosed2","176","Prepares a door to be closed. No animation.","5","2"],
          ["1212","cmdb1","177","Unknown Command.","7","4"],
          ["","cmdb2","178","Unknown Command.","1","0"],
          ["2","checkcoins","179","Checks the actual amount of coins and stores it on a specified variable.","3","1"],
          ["2","givecoins","180","Gives the player a specified quantity of coins.","3","1"],
          ["2","removecoins","181","Removes a specified quantity of coins.","3","1"],
          ["212","setwildbattle","182","Prepares to start a battle with a specified Pokemon, level and item.","6","3"],
          ["","dowildbattle","183","Triggers the battle specified by setbattle.","1","0"],
          ["3","setvirtualaddress","184","Jumps to the specified value - value at 0x020375C4 in RAM, continuing execution from there.","5","1"],
          ["3","virtualgoto","185","Jumps to a custom function.","5","1"],
          ["3","virtualcall","186","Calls a custom function.","5","1"],
          ["13","virtualgotoif","187","Jumps to a custom function, conditional version.","6","2"],
          ["13","virtualcallif","188","Calls a custom function, conditional version.","6","2"],
          ["3","virtualmsgbox","189","Prepares a pointer to dialogue text for use.","5","1"],
          ["3","virtualloadpointer","190","Prepares a pointer to dialogue text for use.","5","1"],
          ["13","virtualbuffer","191","Stores a custom string within a buffer.","6","2"],
          ["11","showcoins","192","Shows the coin counter on set coordinates.","3","2"],
          ["11","hidecoins","193","Hides the coin counter.","3","2"],
          ["","updatecoins","194","Updates the amount of coins displayed in the coin counter.","1","0"],
          ["1","cmdc3","195","Uknown Command.","2","1"],
          ["11122","warp6","196","Warps the player to another map.","8","5"],
          ["","waitcry","197","Waits for cry to finish.","1","0"],
          ["12","bufferboxname","198","Stores the name of a PC box within a specified buffer.","4","2"],
          ["1","textcolor","199","Changes the text color used. FR/LG only.","2","1"],
          ["","cmdc8","200","Unknown Command.","1","0"],
          ["","cmdc9","201","Unknown Command.","1","0"],
          ["","signmsg","202","Changes the graphics used by msgboxes in order to make them look like signs. FR/LG only.","1","0"],
          ["","normalmsg","203","Clears the effect of the msgboxsign command. FR/LG only.","1","0"],
          ["13","comparehiddenvar","204","Compares the value of a chosen hidden variable. FR/LG only.","6","2"],
          ["2","setobedience","205","Sets the specified Pokemon in player's party as obedient.","3","1"],
          ["2","checkobedience","206","Checks if the specified Pokemon in player's party is obedient or not. The result is stored in LASTRESULT.","3","1"],
          ["","executeram","207","Calculates the current location of the RAM script area and passes the execution to that offset.","1","0"],
          ["2","setworldmap","208","Sets the flag used to allow the player to fly to a specific place. FR/LG only.","3","1"],
          ["11122","warpteleport2","209","Warps the player to another map. Teleport effect.","8","5"],
          ["21","setcatchlocation","210","Changes the catch location for a specified Pokemon in player's party.","4","2"],
          ["3","braille2","211","Unknown Command.","5","1"],
          ["122","bufferitems","212","Stores a plural item name within a specified buffer. FR/LG only.","6","3"],
          ["2","cmdd5","213","Unknown Command.","3","1"],
          ["","cmdd6","214","Unknown Command.","1","0"],
          ["11122","warp7","215","Unknown Command.","8","5"],
          ["","cmdd8","216","Unknown Command.","1","0"],
          ["","cmdd9","217","Unknown Command.","1","0"],
          ["","hidebox2","218","Unknown Command.","1","0"],
          ["3","preparemsg3","219","Unknown Command.","5","1"],
          ["1","fadescreen3","220","Fades the screen in or out. Emerald only.","2","1"],
          ["12","buffertrainerclass","221","Stores the name of the selected trainer class within a specified buffer. Emerald only.","4","2"],
          ["12","buffertrainername","222","Stores the name of the selected trainer within a specified buffer. Emerald only.","4","2"],
          ["11122","warp8","223","Unknown Command.","8","5"],
          ["12","buffercontestype","224","Stores the name of the selected contest type within a specified buffer. Emerald only.","4","2"],
          ["122","bufferitems2","225","Stores a plural item name within a specified buffer. Emerald only.","6","3"],
          ["30","msgbox","-2","Prints text to a messagebox.","8","2"],
          ["003","if","-3","Compares the value stored in LASTRESULT to argument 1, then goes to pointer.","7","003"],
          ["","giveitem","-4","Gives a specified item and displays the aftermath.","12","3"],
          ["","giveitem2","-6","Gives a specified item and displays the aftermath. Plays a fanfare.","12","3"],
          ["22","checkpcitem","74","Checks amount of items in PC from first variable in the quantity contained in the second variable.","5","2"],
        ];
    
        for (let i = 0; i < commands.length; i++) {
          let commandData: string[] = commands[i];
          let label: string = commandData[1];
          let index: number = parseInt(commandData[2]);
          let description: string = commandData[3];
          let commandLength: number = parseInt(commandData[4]);
          let paramCount: number = parseInt(commandData[5]);
          let paramLengths: number[] = [];
    
          let paramLengthMap: string = commandData[0];
          for (let i = 0; i < paramCount && i < paramLengthMap.length; i++) {
            let paramLengthText: string = paramLengthMap.charAt(i);
            let paramLengthValue = parseInt(paramLengthText);
    
            // pointers are actually 4 long, not 3 ... easier to update here than many commands
            if (paramLengthValue == 3)
              paramLengthValue++;
    
            paramLengths.push(paramLengthValue); 
          }
    
          let command: PorkyScriptCommandTemplate = new PorkyScriptCommandTemplate(index, label, commandLength, paramCount, paramLengths, description);
          this.commands.set(command.index, command);
        }
    
        this.messageTypes.set(0x0, 'MSG_OBTAIN');
        this.messageTypes.set(0x1, 'MSG_FIND');
        this.messageTypes.set(0x2, 'MSG_FACE');
        this.messageTypes.set(0x3, 'MSG_SIGN');
        this.messageTypes.set(0x4, 'MSG_KEEPOPEN');
        this.messageTypes.set(0x5, 'MSG_YESNO');
        this.messageTypes.set(0x6, 'MSG_NORMAL');
        this.messageTypes.set(0xA, 'MSG_POKENAV');
        
        this.movementTypes.set(0x0, "Face Down");
        this.movementTypes.set(0x1, "Face Up");
        this.movementTypes.set(0x2, "Face Left");
        this.movementTypes.set(0x3, "Face Right");
        this.movementTypes.set(0x4, "Face Down (Faster)");
        this.movementTypes.set(0x5, "Face Up (Faster)");
        this.movementTypes.set(0x6, "Face Left (Faster)");
        this.movementTypes.set(0x7, "Face Right (Faster)");
        this.movementTypes.set(0x8, "Step Down (Very Slow)");
        this.movementTypes.set(0x9, "Step Up (Very Slow)");
        this.movementTypes.set(0xA, "Step Left (Very Slow)");
        this.movementTypes.set(0xB, "Step Right (Very Slow)");
        this.movementTypes.set(0xC, "Step Down (Slow)");
        this.movementTypes.set(0xD, "Step Up (Slow)");
        this.movementTypes.set(0xE, "Step Left (Slow)");
        this.movementTypes.set(0xF, "Step Right (Slow)");
        this.movementTypes.set(0x10, "Step Down (Normal)");
        this.movementTypes.set(0x11, "Step Up (Normal)");
        this.movementTypes.set(0x12, "Step Left (Normal)");
        this.movementTypes.set(0x13, "Step Right (Normal)");
        this.movementTypes.set(0x14, "Jump2 Down");
        this.movementTypes.set(0x15, "Jump2 Up");
        this.movementTypes.set(0x16, "Jump2 Left");
        this.movementTypes.set(0x17, "Jump2 Right");
        this.movementTypes.set(0x18, "Delay1");
        this.movementTypes.set(0x19, "Delay2");
        this.movementTypes.set(0x1A, "Delay3");
        this.movementTypes.set(0x1B, "Delay4");
        this.movementTypes.set(0x1C, "Delay5");
        this.movementTypes.set(0x1D, "Step Down (Fast)");
        this.movementTypes.set(0x1E, "Step Up (Fast)");
        this.movementTypes.set(0x1F, "Step Left (Fast)");
        this.movementTypes.set(0x20, "Step Right (Fast)");
        this.movementTypes.set(0x21, "Step on the Spot Down (Normal)");
        this.movementTypes.set(0x22, "Step on the Spot Up (Normal)");
        this.movementTypes.set(0x23, "Step on the Spot Left (Normal)");
        this.movementTypes.set(0x24, "Step on the Spot Right (Normal)");
        this.movementTypes.set(0x25, "Step on the Spot Down (Faster)");
        this.movementTypes.set(0x26, "Step on the Spot Up (Faster)");
        this.movementTypes.set(0x27, "Step on the Spot Left (Faster)");
        this.movementTypes.set(0x28, "Step on the Spot Right (Faster)");
        this.movementTypes.set(0x29, "Step on the Spot Down (Fastest)");
        this.movementTypes.set(0x2A, "Step on the Spot Up (Fastest)");
        this.movementTypes.set(0x2B, "Step on the Spot Left (Fastest)");
        this.movementTypes.set(0x2C, "Step on the Spot Right (Fastest)");
        this.movementTypes.set(0x2D, "Face Down (Delayed)");
        this.movementTypes.set(0x2E, "Face Up (Delayed)");
        this.movementTypes.set(0x2F, "Face Left (Delayed)");
        this.movementTypes.set(0x30, "Face Right (Delayed)");
        this.movementTypes.set(0x31, "Slide Down (Slow)");
        this.movementTypes.set(0x32, "Slide Up (Slow)");
        this.movementTypes.set(0x33, "Slide Left (Slow)");
        this.movementTypes.set(0x34, "Slide Right (Slow)");
        this.movementTypes.set(0x35, "Slide Down (Normal)");
        this.movementTypes.set(0x36, "Slide Up (Normal)");
        this.movementTypes.set(0x37, "Slide Left (Normal)");
        this.movementTypes.set(0x38, "Slide Right (Normal)");
        this.movementTypes.set(0x39, "Slide Down (Fast)");
        this.movementTypes.set(0x3A, "Slide Up (Fast)");
        this.movementTypes.set(0x3B, "Slide Left (Fast)");
        this.movementTypes.set(0x3C, "Slide Right (Fast)");
        this.movementTypes.set(0x3D, "Slide Running on Right Foot (Down)");
        this.movementTypes.set(0x3E, "Slide Running on Right Foot (Up)");
        this.movementTypes.set(0x3F, "Slide Running on Right Foot (Left)");
        this.movementTypes.set(0x40, "Slide Running on Right Foot (Right)");
        this.movementTypes.set(0x41, "Slide Running on Left Foot (Down)");
        this.movementTypes.set(0x42, "Slide Running on Left Foot (Up)");
        this.movementTypes.set(0x43, "Slide Running on Left Foot (Left)");
        this.movementTypes.set(0x44, "Slide Running on Left Foot (Right)");
        this.movementTypes.set(0x46, "Jump Facing Left (Down)");
        this.movementTypes.set(0x47, "Jump Facing Down (Up)");
        this.movementTypes.set(0x48, "Jump Facing Up (Left)");
        this.movementTypes.set(0x49, "Jump Facing Left (Right)");
        this.movementTypes.set(0x4A, "Face Player");
        this.movementTypes.set(0x4B, "Face Against Player");
        this.movementTypes.set(0x4E, "Jump Down");
        this.movementTypes.set(0x4F, "Jump Up");
        this.movementTypes.set(0x50, "Jump Left");
        this.movementTypes.set(0x51, "Jump Right");
        this.movementTypes.set(0x52, "Jump in Place (Facing Down)");
        this.movementTypes.set(0x53, "Jump in Place (Facing Up)");
        this.movementTypes.set(0x54, "Jump in Place (Facing Left)");
        this.movementTypes.set(0x55, "Jump in Place (Facing Right)");
        this.movementTypes.set(0x56, "Jump in Place (Facing Down/Up)");
        this.movementTypes.set(0x57, "Jump in Place (Facing Up/Down)");
        this.movementTypes.set(0x58, "Jump in Place (Facing Left/Right)");
        this.movementTypes.set(0x59, "Jump in Place (Facing Right/Left)");
        this.movementTypes.set(0x60, "Hide");
        this.movementTypes.set(0x61, "Show");
        this.movementTypes.set(0x62, "Exclamation Mark (!)");
        this.movementTypes.set(0x63, "Question Mark (?)");
        this.movementTypes.set(0x64, "Cross (X)");
        this.movementTypes.set(0x65, "Double Exclamation Mark (!!)");
        this.movementTypes.set(0x66, "Happy (^_^)");
            
        this.movementTypes.set(0xFE, "End of Movements");
            
        this.movementTypes.set(0x100, this.movementTypes.get(0x0));
        this.movementTypes.set(0x101, this.movementTypes.get(0x1));
        this.movementTypes.set(0x102, this.movementTypes.get(0x2));
        this.movementTypes.set(0x103, this.movementTypes.get(0x3));
        this.movementTypes.set(0x104, "Step Down (Slow)");
        this.movementTypes.set(0x105, "Step Up (Slow)");
        this.movementTypes.set(0x106, "Step Left (Slow)");
        this.movementTypes.set(0x107, "Step Right (Slow)");
        this.movementTypes.set(0x108, "Step Down (Normal)");
        this.movementTypes.set(0x109, "Step Up (Normal)");
        this.movementTypes.set(0x10A, "Step Left (Normal)");
        this.movementTypes.set(0x10B, "Step Right (Normal)");
        this.movementTypes.set(0x10C, "Jump2 Down");
        this.movementTypes.set(0x10D, "Jump2 Up");
        this.movementTypes.set(0x10E, "Jump2 Left");
        this.movementTypes.set(0x10F, "Jump2 Right");
        this.movementTypes.set(0x110, this.movementTypes.get(0x18));
        this.movementTypes.set(0x111, this.movementTypes.get(0x19));
        this.movementTypes.set(0x112, this.movementTypes.get(0x1A));
        this.movementTypes.set(0x113, this.movementTypes.get(0x1B));
        this.movementTypes.set(0x114, this.movementTypes.get(0x1C));
        this.movementTypes.set(0x115, "Slide Down");
        this.movementTypes.set(0x116, "Slide Up");
        this.movementTypes.set(0x117, "Slide Left");
        this.movementTypes.set(0x118, "Slide Right");
        this.movementTypes.set(0x119, "Step on the Spot Down (Slow)");
        this.movementTypes.set(0x11A, "Step on the Spot Up (Slow)");
        this.movementTypes.set(0x11B, "Step on the Spot Left (Slow)");
        this.movementTypes.set(0x11C, "Step on the Spot Right (Slow)");
        this.movementTypes.set(0x11D, "Step on the Spot Down (Normal)");
        this.movementTypes.set(0x11E, "Step on the Spot Up (Normal)");
        this.movementTypes.set(0x11F, "Step on the Spot Left (Normal)");
        this.movementTypes.set(0x120, "Step on the Spot Right (Normal)");
        this.movementTypes.set(0x121, "Step on the Spot Down (Faster)");
        this.movementTypes.set(0x122, "Step on the Spot Up (Faster)");
        this.movementTypes.set(0x123, "Step on the Spot Left (Faster)");
        this.movementTypes.set(0x124, "Step on the Spot Right (Faster)");
        this.movementTypes.set(0x125, "Step on the Spot Down (Fastest)");
        this.movementTypes.set(0x126, "Step on the Spot Up (Fastest)");
        this.movementTypes.set(0x127, "Step on the Spot Left (Fastest)");
        this.movementTypes.set(0x128, "Step on the Spot Right (Fastest)");
        this.movementTypes.set(0x129, "Slide Down");
        this.movementTypes.set(0x12A, "Slide Up");
        this.movementTypes.set(0x12B, "Slide Left");
        this.movementTypes.set(0x12C, "Slide Right");
        this.movementTypes.set(0x12D, "Slide Down");
        this.movementTypes.set(0x12E, "Slide Up");
        this.movementTypes.set(0x12F, "Slide Left");
        this.movementTypes.set(0x130, "Slide Right");
        this.movementTypes.set(0x131, "Slide Down");
        this.movementTypes.set(0x132, "Slide Up");
        this.movementTypes.set(0x133, "Slide Left");
        this.movementTypes.set(0x134, "Slide Right");
        this.movementTypes.set(0x135, "Slide Running Down");
        this.movementTypes.set(0x136, "Slide Running Up");
        this.movementTypes.set(0x137, "Slide Running Left");
        this.movementTypes.set(0x138, "Slide Running Right");
        this.movementTypes.set(0x13A, "Jump Facing Left (Down)");
        this.movementTypes.set(0x13B, "Jump Facing Down (Up)");
        this.movementTypes.set(0x13C, "Jump Facing Up (Left)");
        this.movementTypes.set(0x13D, "Jump Facing Left (Right)");
        this.movementTypes.set(0x13E, this.movementTypes.get(0x4A));
        this.movementTypes.set(0x13F, this.movementTypes.get(0x4B));
        this.movementTypes.set(0x142, this.movementTypes.get(0x4E));
        this.movementTypes.set(0x143, this.movementTypes.get(0x4F));
        this.movementTypes.set(0x144, this.movementTypes.get(0x50));
        this.movementTypes.set(0x145, this.movementTypes.get(0x51));
        this.movementTypes.set(0x146, this.movementTypes.get(0x52));
        this.movementTypes.set(0x147, this.movementTypes.get(0x53));
        this.movementTypes.set(0x148, this.movementTypes.get(0x54));
        this.movementTypes.set(0x149, this.movementTypes.get(0x55));
        this.movementTypes.set(0x14A, this.movementTypes.get(0x56));
        this.movementTypes.set(0x14B, this.movementTypes.get(0x57));
        this.movementTypes.set(0x14C, this.movementTypes.get(0x58));
        this.movementTypes.set(0x14D, this.movementTypes.get(0x59));
        this.movementTypes.set(0x14E, "Face Left");
        this.movementTypes.set(0x154, this.movementTypes.get(0x60));
        this.movementTypes.set(0x155, this.movementTypes.get(0x61));
        this.movementTypes.set(0x156, this.movementTypes.get(0x62));
        this.movementTypes.set(0x157, this.movementTypes.get(0x63));
        this.movementTypes.set(0x158, "Love (<3)");
        this.movementTypes.set(0x162, "Walk Down");
        this.movementTypes.set(0x163, "Walk Down");
        this.movementTypes.set(0x164, this.movementTypes.get(0x2D));
        this.movementTypes.set(0x165, this.movementTypes.get(0x2E));
        this.movementTypes.set(0x166, this.movementTypes.get(0x2F));
        this.movementTypes.set(0x167, this.movementTypes.get(0x30));
        this.movementTypes.set(0x170, this.movementTypes.get(0x52));
        this.movementTypes.set(0x171, this.movementTypes.get(0x53));
        this.movementTypes.set(0x172, this.movementTypes.get(0x54));
        this.movementTypes.set(0x173, this.movementTypes.get(0x55));
        this.movementTypes.set(0x174, "Jump Down Running");
        this.movementTypes.set(0x175, "Jump Up Running");
        this.movementTypes.set(0x176, "Jump Left Running");
        this.movementTypes.set(0x177, "Jump Right Running");
        this.movementTypes.set(0x178, "Jump2 Down Running");
        this.movementTypes.set(0x179, "Jump2 Up Running");
        this.movementTypes.set(0x17A, "Jump2 Left Running");
        this.movementTypes.set(0x17B, "Jump2 Right Running");
        this.movementTypes.set(0x17C, "Walk on the Spot (Down)");
        this.movementTypes.set(0x17D, "Walk on the Spot (Up)");
        this.movementTypes.set(0x17E, "Walk on the Spot (Lef)");
        this.movementTypes.set(0x17F, "Walk on the Spot (Right)");
        this.movementTypes.set(0x180, "Slide Down Running");
        this.movementTypes.set(0x181, "Slide Up Running");
        this.movementTypes.set(0x182, "Slide Left Running");
        this.movementTypes.set(0x183, "Slide Right Running");
        this.movementTypes.set(0x184, "Slide Down");
        this.movementTypes.set(0x185, "Slide Up");
        this.movementTypes.set(0x186, "Slide Left");
        this.movementTypes.set(0x187, "Slide Right");
        this.movementTypes.set(0x188, "Slide Down on Left Foot");
        this.movementTypes.set(0x189, "Slide Up on Left Foot");
        this.movementTypes.set(0x18A, "Slide Left on Left Foot ");
        this.movementTypes.set(0x18B, "Slide Right on Left Foot");
        this.movementTypes.set(0x18C, "Slide Left diagonally (Facing Up)");
        this.movementTypes.set(0x18D, "Slide Right diagonally (Facing Up)");
        this.movementTypes.set(0x18E, "Slide Left diagonally (Facing Down)");
        this.movementTypes.set(0x18F, "Slide Right diagonally (Facing Down)");
        this.movementTypes.set(0x190, "Slide2 Left diagonally (Facing Up)");
        this.movementTypes.set(0x191, "Slide2 Right diagonally (Facing Up)");
        this.movementTypes.set(0x192, "Slide2 Left diagonally (Facing Down)");
        this.movementTypes.set(0x193, "Slide2 Right diagonally (Facing Down)");
        this.movementTypes.set(0x196, "Walk Left");
        this.movementTypes.set(0x197, "Walk Right");
        this.movementTypes.set(0x198, "Levitate");
        this.movementTypes.set(0x199, "Stop Levitating");
        this.movementTypes.set(0x19C, "Fly Up Vertically");
        this.movementTypes.set(0x19D, "Land");
      }
}
export class PorkyScriptCommandTemplate {

    constructor(
        public index: number,
        public label: string,
        public commandLength: number,
        public paramCount: number,
        public paramLengths: number[],
        public description: string
    ) { }
}

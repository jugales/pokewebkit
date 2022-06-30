import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-movement-minitool',
  templateUrl: './movement-minitool.component.html',
  styleUrls: ['./movement-minitool.component.css']
})
export class MovementMinitoolComponent implements OnInit {

  @Input() public currentMovementId: number = 0xC;
  @Output() public movementSelected: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  public setMovement(movement: any) {
    this.currentMovementId = movement.id;
    this.movementSelected.emit(this.currentMovementId);
  }

  public getMovement(id: number) {
    for (let i = 0; i < this.movements.length; i++) {
      if (this.movements[i].id == id)
        return this.movements[i];
    }
    return { id: id, title: '???', color: '#ccccccb3' };
  }

  public movements: any[] = [
    { id: 0x0, title: 'All Movement', color: '#0000ffb3', layer: 'Transition', type: 'allowed' },
    { id: 0x1, title: 'Obstacle', color: '#ff0000b3', layer: 'All Layers', type: 'restricted' },
    { id: 0x4, title: 'Surf Only', color: '#ff00ffb3', layer: 'Surfing', type: 'allowed' },
    { id: 0x5, title: 'Obstacle', color: '#ffff00b3', layer: 'Layer 0', type: 'restricted' },
    { id: 0x8, title: 'All Movement', color: '#808000b3', layer: 'Layer 1', type: 'allowed' },
    { id: 0x9, title: 'Obstacle', color: '#008000b3', layer: 'Layer 1', type: 'restricted' },
    { id: 0xC, title: 'All Movement', color: '#800080b3', layer: 'Layer 2 (default)', type: 'allowed' },
    { id: 0xD, title: 'Obstacle', color: '#ff0080b3', layer: 'Layer 2 (default)', type: 'restricted' },
    { id: 0x10, title: 'All Movement', color: '#4aa22db3', layer: 'Layer 3', type: 'allowed' },
    { id: 0x11, title: 'Obstacle', color: '#1ae64db3', layer: 'Layer 3', type: 'restricted' },
    { id: 0x14, title: 'All Movement', color: '#005300b3', layer: 'Layer 4', type: 'allowed' },
    { id: 0x15, title: 'Obstacle', color: '#7da6bdb3', layer: 'Layer 4', type: 'restricted' },
    { id: 0x18, title: 'All Movement', color: '#156a62b3', layer: 'Layer 5', type: 'allowed' },
    { id: 0x19, title: 'Obstacle', color: '#ab2951b3', layer: 'Layer 5', type: 'restricted' },
    { id: 0x1C, title: 'All Movement', color: '#7035bfb3', layer: 'Layer 6', type: 'allowed' },
    { id: 0x1D, title: 'Obstacle', color: '#6175d6b3', layer: 'Layer 6', type: 'restricted' },
    { id: 0x20, title: 'All Movement', color: '#ffff00b3', layer: 'Layer 7', type: 'allowed' },
    { id: 0x21, title: 'Obstacle', color: '#658040b3', layer: 'Layer 7', type: 'restricted' },
    { id: 0x24, title: 'All Movement', color: '#4e70f8b3', layer: 'Layer 8', type: 'allowed' },
    { id: 0x25, title: 'Obstacle', color: '#3159a4b3', layer: 'Layer 8', type: 'restricted' },
    { id: 0x28, title: 'All Movement', color: '#b4de21b3', layer: 'Layer 9', type: 'allowed' },
    { id: 0x29, title: 'Obstacle', color: '#f54b50b3', layer: 'Layer 9', type: 'restricted' },
    { id: 0x2C, title: 'All Movement', color: '#1eac68b3', layer: 'Layer 10', type: 'allowed' },
    { id: 0x2D, title: 'Obstacle', color: '#be7641b3', layer: 'Layer 10', type: 'restricted' },
    { id: 0x30, title: 'All Movement', color: '#14eba5b3', layer: 'Layer 11', type: 'allowed' },
    { id: 0x31, title: 'Obstacle', color: '#804040b3', layer: 'Layer 11', type: 'restricted' },
    { id: 0x34, title: 'All Movement', color: '#c8ab37b3', layer: 'Layer 12', type: 'allowed' },
    { id: 0x35, title: 'Obstacle', color: '#3ec165b3', layer: 'Layer 12', type: 'restricted' },
    { id: 0x38, title: 'All Movement', color: '#00ffffb3', layer: 'Layer 13', type: 'allowed' },
    { id: 0x39, title: 'Obstacle', color: '#bc0ac0b3', layer: 'Layer 13', type: 'restricted' },
    { id: 0x3C, title: 'Depends on Surrounding Blocks', color: '#5355acb3', layer: 'Layer Varies', type: 'wildcard' }
  ];

}

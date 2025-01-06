import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() isVisible: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();


  onConfirm(): void {
    this.confirm.emit();
    this.isVisible = false;
  }

  onClose() {
    this.close.emit();
    this.isVisible = false;
  }
}

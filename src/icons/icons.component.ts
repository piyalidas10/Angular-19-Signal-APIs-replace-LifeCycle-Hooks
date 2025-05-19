import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  afterNextRender,
  Component,
  contentChild,
  input,
} from '@angular/core';
import { IconDirective } from './icon.directive';
@Component({
  selector: 'app-icons',
  standalone: true,
  templateUrl: './icons.component.html',
  styleUrl: './icons.component.scss',
  imports: [CommonModule],
})
export class IconsComponent {
  readonly options = input.required<string[]>();
  readonly templateDirective = contentChild(IconDirective);

  constructor() {
    // will get undefined
    console.log('constructor ContentChild => ', this.templateDirective());
    afterNextRender(() => {
      console.log('afterNextRender ContentChild => ', this.templateDirective());
    });
  }

  // ngAfterContentInit() {
  //   console.log('AfterContentInit ContentChild => ', this.templateDirective());
  // }
}

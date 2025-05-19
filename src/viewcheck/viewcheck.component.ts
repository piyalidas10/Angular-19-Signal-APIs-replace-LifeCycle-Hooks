import {
  Component,
  computed,
  DoCheck,
  effect,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-viewcheck',
  standalone: true,
  templateUrl: './viewcheck.component.html',
  styleUrl: './viewcheck.component.scss',
})
export class ViewcheckComponent {
  counter = 0;
  increase() {
    this.counter++;
  }
}

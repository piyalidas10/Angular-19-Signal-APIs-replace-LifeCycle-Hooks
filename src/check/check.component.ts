import {
  Component,
  computed,
  DoCheck,
  effect,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-check',
  standalone: true,
  templateUrl: './check.component.html',
  styleUrl: './check.component.scss',
})
export class CheckComponent {
  readonly rate = input.required<number>();
  oldRate = 0;
  diff = computed(() => this.rate() - this.oldRate);

  constructor() {
    effect(() => {
      console.log('Effect replace DoCheck => ', this.diff());
    });
  }
}

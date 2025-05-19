import {
  afterRender,
  AfterViewChecked,
  Component,
  ElementRef,
  viewChild,
} from '@angular/core';
import { DestroyComponent } from './destroy/destroy.component';
import { AfterComponent } from './after/after.component';
import { IconsComponent } from './icons/icons.component';
import { IconDirective } from './icons/icon.directive';
import { CheckComponent } from './check/check.component';
import { ViewcheckComponent } from './viewcheck/viewcheck.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [
    DestroyComponent,
    AfterComponent,
    IconsComponent,
    IconDirective,
    CheckComponent,
    ViewcheckComponent,
  ],
})
export class AppComponent {
  currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];
  rate: number = 0;
  readonly viewcheckComp = viewChild.required<ViewcheckComponent>('child');

  constructor() {
    afterRender(() => {
      console.log('afterRender Counter => ', this.viewcheckComp().counter);
    });
  }

  updateRates() {
    this.rate = this.rate + 1;
  }
  noupdateRates() {
    this.rate = this.rate;
  }

  // ngAfterViewChecked() {
  //   console.log('ngAfterViewChecked Counter => ', this.viewcheckComp().counter);
  // }
}

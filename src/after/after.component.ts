import {
  afterNextRender,
  AfterViewInit,
  Component,
  effect,
  viewChild,
  viewChildren,
  ViewContainerRef,
} from '@angular/core';
import { DestroyComponent } from 'src/destroy/destroy.component';
@Component({
  selector: 'app-after',
  standalone: true,
  templateUrl: './after.component.html',
  styleUrl: './after.component.scss',
  imports: [DestroyComponent],
})
export class AfterComponent {
  destroyComp = viewChild.required(DestroyComponent);
  destroyComps = viewChildren(DestroyComponent);
  myRefDiv = viewChild.required('myRef', { read: ViewContainerRef });

  constructor() {
    // afterNextRender is a one-time event
    afterNextRender(() => {
      // run once after the app rendered
      console.log('afterNextRender viewChild => ', this.destroyComp());
      console.log('afterNextRender viewChildren => ', this.destroyComps());
    });

    // effect is triggered repeatedly. So the console.log will run every time, this.destroyComp & this.destroyComps are marked as dirty.
    // effect(() => {
    //   console.log('effect viewChild => ', this.destroyComp());
    //   console.log('effect viewChildren => ', this.destroyComps());
    // });
  }

  // Runs ones on creation
  // ngAfterViewInit() {
  //   console.log('afterViewInit viewChild => ', this.destroyComp());
  //   console.log('afterViewInit viewChildren => ', this.destroyComps());
  // }

  // Runs on every CD
  // ngAfterViewChecked() {
  // }
}

# Angular 19 Signal APIs replace LifeCycle Hooks

No, There is no deprecation, but it is true that new Signal APIs might be a better fit than the lifecycle hooks.

- ngOnInit / ngOnChanges / ngDoCheck→ effect(): Handles signal based reactivity and other state.
- ngOnDestroy → DestroyRef.onDestroy(): Manages allows you to set callbacks for cleanup or destruction tasks.
- ngAfterViewInit / ngAfterContentInit → afterNextRender():run once after the app rendered.
- ngAfterViewChecked / ngAfterContentChecked→ afterRender():Run everytime the app is rendered.

## ngOnInit / ngOnChanges

The ngOnInit is to initialize the component after Angular has set the input properties. The ngOnChanges is primarily used to be notified when any inputs or have changed.

The effect / afterRenderEffectfunction, introduced with signals, can replace certain lifecycle hooks, particularly ngOnChanges.

Effect is only executed after all the lifecycle hooks. Effect is used for managing state, fetching data, or triggering updates based on signal changes.

#### Without Effect

```
import { Component, input, OnChanges} from '@angular/core';
import { User } from './user';

@Component({
selector: 'app-input-output',
imports: [],
standalone: true,
templateUrl: './input-output.component.html',
styleUrl: './input-output.component.scss',
})
export class InputOutputComponent implements OnChanges {
users = input.required<User[]>();
constructor() {}

ngOnChanges() {
console.log('NgOnChanges => ', this.users());
}
}
```

If you directly write console.log(this.users()); inside constructor, you will get the following error :

```
constructor() {
console.log('users => ', this.users());
}
```

#### With Effect

```
import { Component, effect, input, output } from '@angular/core';
import { User } from './user';

@Component({
selector: 'app-input-output',
imports: [],
standalone: true,
templateUrl: './input-output.component.html',
styleUrl: './input-output.component.scss',
})
export class InputOutputComponent {
users = input.required<User[]>();
constructor() {
effect(() => {
console.log(this.users());
});
}
}
```

## ngOnDestroy

A lifecycle hook that is called when a directive, pipe, or service is destroyed. Use for any custom cleanup that needs to occur when the instance is destroyed.

DestroyRef.onDestroy allows for cleanup logic when a component is destroyed. The DestroyRef can be injected anywhere within an injection context like component, directive, service or a pipe.

```
import {
ChangeDetectorRef,
Component,
DestroyRef,
inject,
signal,
ViewRef,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from 'src/api.service';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/user';

const onDestroy = () => {
const destroy$ = new Subject<void>();
const viewRef = inject(ChangeDetectorRef) as ViewRef;

viewRef.onDestroy(() => {
destroy$.next();
    destroy$.complete();
});

return destroy$;
};

@Component({
selector: 'app-destroy',
standalone: true,
templateUrl: './destroy.component.html',
styleUrl: './destroy.component.scss',
providers: [ApiService],
})
export class DestroyComponent {
private destroyRef = inject(DestroyRef);
private intervalSubscription: Subscription;

apiService = inject(ApiService);
users = signal<User[]>([]);
destroy$ = onDestroy();

constructor() {
this.intervalSubscription = interval(1000)
.pipe(takeUntilDestroyed())
.subscribe(() => {
console.log('Interval tick');
});

    this.destroyRef.onDestroy(() => {
      console.log('Component is destroyed, cleaning up resources');
      this.intervalSubscription.unsubscribe(); // Redundant due to takeUntilDestroyed, but good practice
    });

    this.apiService
      .getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.users.set(data.users);
          console.log('Users: ' + this.users());
        },
        error: (err) => {
          console.error('Error: ' + err);
        },
      });

}
}
```

## ngAfterViewInit

These hook are used mostly to be notified when the component is rendered.

```
export class AfterComponent implements AfterViewInit {
destroyComp = viewChild.required(DestroyComponent);
destroyComps = viewChildren(DestroyComponent);
myRefDiv = viewChild.required('myRef', { read: ViewContainerRef });

// Runs ones on creation
ngAfterViewInit() {
console.log('afterViewInit viewChild => ', this.destroyComp());
console.log('afterViewInit viewChildren => ', this.destroyComps());
}

// Runs on every CD
ngAfterViewChecked() {
......
}
}
```

The effect / afterNextRenderfunction, introduced with signals, can replace ngOnChanges. But we will prefer afterNextRenderfunction.

#### Why will prefer afterNextRender function ?

Here we only need to get the values of this.destroyComp & this.destroyComps after rendering the component. afterNextRender is a one-time event, while effect is triggered repeatedly. So the console.log will run every time, this.destroyComp & this.destroyComps are marked as dirty.

afterNextRender() will run once, after the first rendering. afterNextRender is good for initializing third-party libraries that require the DOM to be ready, or for observing DOM changes.

```
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
```

## ngAfterContentInit

Let’s create a child component to display currency icons which is included in app component. We have a icon directive.

```
import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
selector: '[appIcon]',
standalone: true,
})
export class IconDirective {
readonly template = inject(TemplateRef<string>);
}
```

We are looking the existence of the icon directive instance. We’re going to say read only template directive equals content child of the icon directive class.

readonly templateDirective = contentChild(IconDirective);

```
app.component.html

<app-icons [options]="currencies">
<span \*appIcon="let currency" class="currency-option">
<img
[src]="'/icons/' + currency + '.svg'"
alt="{{ currency }}"
class="currency-icon"
/>
{{ currency }}
</span>
</app-icons>
```

The effect / afterNextRenderfunction, introduced with signals, can replace ngAfterContentInit. But we will prefer afterNextRenderfunction.

#### without afterNextRender

```
export class IconsComponent implements AfterContentInit {
  readonly options = input.required<string[]>();
  readonly templateDirective = contentChild(IconDirective);

  constructor() {
    // will get undefined
    console.log('constructor ContentChild => ', this.templateDirective());
  }

  ngAfterContentInit() {
    // will get value
    console.log('AfterContentInit ContentChild => ', this.templateDirective());
  }
}
```

#### With afterNextRender

```
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
}
```

## ngDoCheck

ngDoCheck is a lifecycle hook in Angular that is used to detect and respond to changes in the component’s input properties or any other changes that may affect the component’s state. It is called every time the change detection cycle runs, which can happen frequently, so it’s important to use this hook efficiently.

The ngDoCheck hook is probably used very rarely. We use normally custom change detection instead of ngDoCheck.

#### Without Effect

```
check.component.html
-----------------------------------------------------------------------
@if (diff) {
<span class="badge" [class.bg-success]="diff > 0" [class.bg-danger]="diff < 0">
  {{ diff }}
</span>
} @else {
<ng-template #noDiff><span class="badge"> No difference </span></ng-template>
}


check.component.ts
-----------------------------------------------------------------------
export class CheckComponent implements DoCheck {
  readonly rate = input.required<number>();
  oldRate = 0;
  diff?: number;

  ngDoCheck() {
    if (this.rate() !== this.oldRate) {
      this.diff = this.rate() - this.oldRate;
      this.oldRate = this.rate();
    }
  }
}
```

#### With Effect

Click on Update rates button number with black background will be updated and you can see number print in console log. But on click No Update rates button, nothing will happens.

```
check.component.html
-----------------------------------------------------------------------
@if (diff()) {
<span
  class="badge"
  [class.bg-success]="diff() > 0"
  [class.bg-danger]="diff() < 0"
>
  {{ diff() }}
</span>
} @else {
<ng-template #noDiff><span class="badge"> No difference </span></ng-template>
}


check.component.ts
-----------------------------------------------------------------------
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
```

## ngAfterViewChecked

Parent component will be called every time if there is a change in child component.

#### without afterRender

```
app.component.ts
------------------------------------------------------------------------
export class AppComponent implements AfterViewChecked {
  readonly viewcheckComp = viewChild.required<ViewcheckComponent>('child');

  ngAfterViewChecked() {
    console.log('ngAfterViewChecked Counter => ', this.viewcheckComp().counter);
  }
}

app.component.html
------------------------------------------------------------------------
<app-viewcheck #child></app-viewcheck>

viewcheck.component.ts
------------------------------------------------------------------------
export class ViewcheckComponent {
  counter = 0;
  increase() {
    this.counter++;
  }
}

viewcheck.component.html
------------------------------------------------------------------------
<button (click)="increase()">Increase COUNTER</button>
<p>{{ counter }}</p>
```

#### With afterRender

afterRender is perfect to update the DOM every time Angular detects a change like ngAfterViewChecked. We can’t use afterNextRender because it will be triggered at one time only.

```
app.component.ts
-------------------------------------------------------------------------
export class AppComponent {
  readonly viewcheckComp = viewChild.required<ViewcheckComponent>('child');

  constructor() {
    afterRender(() => {
      console.log('afterRender Counter => ', this.viewcheckComp().counter);
    });
  }

}

app.component.html
------------------------------------------------------------------------
<app-viewcheck #child></app-viewcheck>

viewcheck.component.ts
------------------------------------------------------------------------
export class ViewcheckComponent {
  counter = 0;
  increase() {
    this.counter++;
  }
}

viewcheck.component.html
------------------------------------------------------------------------
<button (click)="increase()">Increase COUNTER</button>
<p>{{ counter }}</p>
```

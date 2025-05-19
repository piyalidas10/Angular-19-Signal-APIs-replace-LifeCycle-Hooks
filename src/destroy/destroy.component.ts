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

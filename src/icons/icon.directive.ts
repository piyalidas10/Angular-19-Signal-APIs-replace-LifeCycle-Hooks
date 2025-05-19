import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appIcon]',
  standalone: true,
})
export class IconDirective {
  readonly template = inject(TemplateRef<string>);
}

import { Component, input } from '@angular/core';
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-ui-icon',
  imports: [FaIconComponent],
  template: `<fa-icon [icon]="icon()" />`,
})
export class IconUi {
  readonly icon = input.required<IconDefinition>();
}

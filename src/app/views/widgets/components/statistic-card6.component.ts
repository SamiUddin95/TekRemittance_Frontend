import {Component, Input} from '@angular/core';
import { StatisticCard6Type} from '@/app/views/widgets/types';
import {CountupComponent} from '../../../shared/components/countup/countup.component';
import {NgIcon} from '@ng-icons/core';

@Component({
  selector: 'app-statistic-card6',
    imports: [
        CountupComponent,
        NgIcon
    ],
  template: `
      <div class="card">
          <div class="card-body">
              <div class="avatar-xl mb-3">
          <span class="avatar-title bg-{{ item.variant }}-subtle text-{{ item.variant }} rounded-circle fs-24">
            <ng-icon [name]="item.icon" class="d-flex"/>
          </span>
              </div>
              <h3 class="mb-1">
                  {{ item.count.prefix || '' }}<app-countup
                  [endVal]="item.count.value"></app-countup>{{ item.count.suffix || '' }}
              </h3>
              <p class="mb-0 text-muted">{{ item.title }}</p>
          </div>
      </div>
  `,
})
export class StatisticCard6Component {
    @Input() item!: StatisticCard6Type;
}

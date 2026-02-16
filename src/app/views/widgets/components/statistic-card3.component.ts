import {Component, Input} from '@angular/core';
import {StatisticCard3Type} from '@/app/views/widgets/types';
import {NgIcon} from '@ng-icons/core';
import {CountupComponent} from '../../../shared/components/countup/countup.component';

@Component({
    selector: 'app-statistic-card3',
    imports: [
        NgIcon,
        CountupComponent
    ],
    template: `
        <div class="card">
            <div class="card-header d-flex border-dashed justify-content-between align-items-center">
                <h5 class="card-title">{{ item.title }}</h5>
                <span class="badge badge-soft-{{ item.variant }}">{{ item.label }}</span>
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="avatar fs-60 avatar-img-size flex-shrink-0">
                        <span class="avatar-title text-bg-dark rounded-circle fs-32">
                          <ng-icon [name]="item.icon" class="d-flex"/>
                        </span>
                    </div>
                    <div class="text-end">
                        <h3 class="mb-2 fw-normal">
                            {{ item.count.prefix || '' }}<app-countup [endVal]="item.count.value"></app-countup>{{ item.count.suffix || '' }}
                        </h3>
                        <p class="mb-0 text-muted">{{ item.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: ``
})
export class StatisticCard3Component {
    @Input() item!: StatisticCard3Type;
}

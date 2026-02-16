import {Component, Input} from '@angular/core';
import {StatisticCard4Type} from '@/app/views/widgets/types';
import {CountupComponent} from '../../../shared/components/countup/countup.component';
import {NgIcon} from '@ng-icons/core';

@Component({
    selector: 'app-statistic-card4',
    imports: [
        CountupComponent,
        NgIcon
    ],
    template: `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h3 class="mb-1">
                            {{ item.count.prefix || '' }}<app-countup
                            [endVal]="item.count.value"></app-countup>{{ item.count.suffix || '' }}
                        </h3>
                        <p class="mb-0 text-muted">{{ item.title }}</p>
                    </div>
                    <div class="avatar fs-60 avatar-img-size flex-shrink-0">
                        <span
                            class="avatar-title bg-{{ item.variant }}-subtle text-{{ item.variant }} rounded-circle fs-32">
                          <ng-icon [name]="item.icon" class="d-flex"/>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: ``
})
export class StatisticCard4Component {
    @Input() item!: StatisticCard4Type;
}

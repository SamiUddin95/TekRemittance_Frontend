import {Component, Input} from '@angular/core';
import {NgIcon} from '@ng-icons/core';
import {RouterLink} from '@angular/router';
import {StatisticWidget1Type} from '@/app/types';
import {CountupComponent} from '../../shared/components/countup/countup.component';

@Component({
    selector: 'app-statistic-widget1',
    imports: [
        NgIcon,
        RouterLink,
        CountupComponent
    ],
    template: `
        <div class="card {{cardClass}}">
            <div class="card-body">
                <a [routerLink]="[]" class="text-muted float-end mt-n1 fs-xl">
                    <ng-icon
                        name="tablerExternalLink"/>
                </a>
                <h5 title="Number of Tasks">{{ item.title }}</h5>
                <div class="d-flex align-items-center gap-2 my-3">
                    <div class="avatar-md flex-shrink-0">
                       <span class="avatar-title text-bg-{{isBgLight ? 'light' : item.variant}} rounded-circle fs-22">
                              <ng-icon [name]="item.icon" class="d-flex align-items-center"/>
                       </span>
                    </div>
                    <h3 class="mb-0">{{ item.count.prefix }}<app-countup
                        [endVal]="item.count.value"></app-countup>{{ item.count.suffix }}</h3>
                    <span class="badge badge-soft-{{item.variant}} fw-medium ms-2 fs-xs ms-auto">{{ item.label }}</span>
                </div>
                <p class="d-flex align-items-center gap-1 mb-0">
                    <ng-icon class="text-{{item.variant}}" name="tablerPointFill"/>
                    <span class="text-nowrap text-muted"> {{ item.description }}</span>
                    <span
                        class="ms-auto"><b>{{ item.totalCount.prefix }}{{ item.totalCount.value }}{{ item.totalCount.suffix }}</b></span>
                </p>
            </div>
        </div>
    `,
    styles: ``
})
export class StatisticWidget1Component {
    @Input() item!: StatisticWidget1Type
    @Input() cardClass?: string
    @Input() isBgLight?: boolean
}

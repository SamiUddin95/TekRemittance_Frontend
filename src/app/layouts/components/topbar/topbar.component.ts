import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgIcon} from '@ng-icons/core';
import {LayoutStoreService} from '@core/services/layout-store.service';
import {LucideAngularModule, Search} from 'lucide-angular';

import {ThemeTogglerComponent} from '@layouts/components/topbar/components/theme-toggler/theme-toggler.component';
import {
    CustomizerTogglerComponent
} from '@layouts/components/topbar/components/customizer-toggler/customizer-toggler.component';
import {UserProfileComponent} from '@layouts/components/topbar/components/user-profile/user-profile.component';

@Component({
    selector: 'app-topbar',
    imports: [
        NgIcon,
        RouterLink,
        LucideAngularModule,
        CustomizerTogglerComponent,
        ThemeTogglerComponent,
        UserProfileComponent,
    ],
    templateUrl: './topbar.component.html'
})
export class TopbarComponent {
    constructor(public layout: LayoutStoreService) {
    }

    toggleSidebar() {

        const html = document.documentElement;
        const currentSize = html.getAttribute('data-sidenav-size');
        const savedSize = this.layout.sidenavSize;

        if (currentSize === 'offcanvas') {
            html.classList.toggle('sidebar-enable')
            this.layout.showBackdrop()
        } else if (savedSize === 'compact') {
            this.layout.setSidenavSize(currentSize === 'compact' ? 'condensed' : 'compact', false);
        } else {
            this.layout.setSidenavSize(currentSize === 'condensed' ? 'default' : 'condensed');
        }
    }

    Search = Search;
}

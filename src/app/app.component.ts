import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import * as tablerIcons from '@ng-icons/tabler-icons';
import * as tablerIconsFill from '@ng-icons/tabler-icons/fill';
import {provideIcons} from '@ng-icons/core';
import {Title} from '@angular/platform-browser';
import { FaviconService } from './core/services/favicon.service';
import {filter, map, mergeMap} from 'rxjs/operators';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    viewProviders: [provideIcons({...tablerIcons, ...tablerIconsFill})]
})
export class AppComponent implements OnInit {
    private titleService = inject(Title)
    private router = inject(Router)
    private activatedRoute = inject(ActivatedRoute)
    private faviconService = inject(FaviconService)

    ngOnInit(): void {
        // Force favicon to TEK-REMIT icon to avoid browser fallback to /favicon.ico (public)
        this.faviconService.resetFavicon('/assets/images/favicon.icon');
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                map(() => {
                    let route = this.activatedRoute;
                    while (route.firstChild) {
                        route = route.firstChild;
                    }
                    return route;
                }),
                mergeMap(route => route.data)
            )
            .subscribe(data => {
                if (data['title']) {
                    this.titleService.setTitle(data['title'] +
                        ' | TEK-REMIT');
                }
            });
    }
}

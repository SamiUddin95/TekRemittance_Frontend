import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

interface SecurityGroup {
  id: string;
  name: string;
  description?: string;
  usersCount?: number;
}

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, NgbCollapseModule],
  templateUrl: './group-list.component.html'
})
export class GroupListComponent implements OnInit {
  groups: SecurityGroup[] = [];
  isLoading = false;
  

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.isLoading = true;
    // TODO: replace with API when available
    const mock: SecurityGroup[] = [
      { id: '1', name: 'Administrators', description: 'Full system access', usersCount: 4 },
      { id: '2', name: 'Operations', description: 'Daily operations team', usersCount: 10 },
    ];
    this.groups = mock;
    this.isLoading = false;
  }

  addNewGroup(): void {
    this.router.navigate(['/users/groups/add']);
  }

  editGroup(id: string): void {
    this.router.navigate(['/users/groups/edit', id]);
  }
}

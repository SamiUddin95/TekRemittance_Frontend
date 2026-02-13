import { Routes } from '@angular/router';
import { AmlListComponent } from './aml-list/aml-list.component';
import { AmlFormComponent } from './aml-form/aml-form.component';

export const AML_ROUTES: Routes = [
  {
    path: 'aml-list',
    component: AmlListComponent,
    data: {
      title: 'AML List',
      breadcrumb: 'AML Management / AML List'
    }
  },
  {
    path: 'aml-list/add',
    component: AmlFormComponent,
    data: {
      title: 'Add AML',
      breadcrumb: 'AML Management / Add AML'
    }
  },
  {
    path: 'aml-list/edit/:id',
    component: AmlFormComponent,
    data: {
      title: 'Edit AML',
      breadcrumb: 'AML Management / Edit AML'
    }
  }
];

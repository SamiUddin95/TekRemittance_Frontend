import { Routes } from '@angular/router';
import { BulkUploadTemplateListComponent } from './bulk-upload-template-list/bulk-upload-template-list.component';
import { BulkUploadTemplateFormComponent } from './bulk-upload-template-form/bulk-upload-template-form.component';


export const PROCESSING_MANAGEMENT_ROUTES: Routes = [
  {
    path: 'bulk-upload-template',
    component: BulkUploadTemplateListComponent,
    data: { title: 'Bulk Upload Template Management' },
  },
  {
    path: 'bulk-upload-template/add',
    component: BulkUploadTemplateFormComponent,
    data: { title: 'Add File Upload Template' },
  },
];

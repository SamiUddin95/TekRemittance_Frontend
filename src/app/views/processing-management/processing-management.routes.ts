import { Routes } from '@angular/router';
import { BulkUploadTemplateListComponent } from './bulk-upload-template-list/bulk-upload-template-list.component';
import { BulkUploadTemplateFormComponent } from './bulk-upload-template-form/bulk-upload-template-form.component';
import { BulkUploadComponent } from './bulk-upload/bulk-upload.component';
import { BulkUploadListComponent } from './bulk-upload-list/bulk-upload-list.component';

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
  {
    path: 'bulk-upload',
    component: BulkUploadListComponent,
    data: { title: 'Bulk Upload' },
  },
  {
    path: 'bulk-upload/add',
    component: BulkUploadComponent,
    data: { title: 'Add Acquisition Agent File' },
  },
];

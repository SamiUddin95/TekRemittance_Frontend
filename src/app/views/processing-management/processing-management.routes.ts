import { Routes } from '@angular/router';
import { BulkUploadTemplateListComponent } from './bulk-upload-template-list/bulk-upload-template-list.component';
import { BulkUploadTemplateFormComponent } from './bulk-upload-template-form/bulk-upload-template-form.component';
import { AgentFileUploadListComponent } from './agent-file-upload-list/agent-file-upload-list.component';
import { AgentFileUploadFormComponent } from './agent-file-upload-form/agent-file-upload-form.component';
import { RepairInstructionQueueComponent } from './repair-instruction-queue/repair-instruction-queue.component';
import { RepairQueueListComponent } from './repair-queue/repair-queue.component';


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
    path: 'agent-file-upload',
    component: AgentFileUploadListComponent,
    data: { title: 'Acquisition Agent File List' },
  },
  {
    path: 'agent-file-upload/add',
    component: AgentFileUploadFormComponent,
    data: { title: 'Add Acquisition Agent File' },
  },
  {
    path: 'repair-queue',
    component: RepairQueueListComponent,
    data: { title: 'Repair Queue Management' },
  },
  {
    path: 'repair-instruction',
    component: RepairInstructionQueueComponent,
    data: { title: 'Repair Instruction' },
  },
];

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { TemplateService } from '@/app/views/processing-management/services/template.service';
import { AgentService } from '@/app/views/acquisition-management/services/agent.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bulk-upload-template-form',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, ReactiveFormsModule, NgIcon],
  templateUrl: './bulk-upload-template-form.component.html'
})
export class BulkUploadTemplateFormComponent {
  form!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  // tabs state
  activeTab: 'template' | 'fields' = 'template';
  templateSaved = false;
  templateId?: string;

  agents: Array<{ id: string; name: string }> = [];

  // Fields tab state (static)
  fields: Array<{ id?: string; order: number; fieldName: string; fieldType: string; required: boolean; enable: boolean; startIndex: number; length: number }> = [];
  isFieldsLoading = false;

  // Edit state for a single field
  editingFieldId?: string;

  showAddFieldForm = false;
  fieldForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private templateService: TemplateService, private agentService: AgentService) {
    this.form = this.fb.nonNullable.group({
      agentId: ['', [Validators.required]],
      name: ['', [Validators.required]],
      sheetName: ['', [Validators.required]],
      format: ['.txt' as '.txt' | '.xls' | '.xlsx', [Validators.required]],
      fixLength: [false],
      fieldDelimiter: [false],
      delimiterText: ['']
    });

    this.fieldForm = this.fb.nonNullable.group({
      fieldTemplateName: [''],
      fieldOrder: [null as unknown as number, [Validators.required]],
      fieldName: ['', [Validators.required]],
      fieldType: ['', [Validators.required]],
      required: [false],
      enable: [false],
      startIndex: [0],
      length: [0],
    });
  }

  ngOnInit(): void {
    // Subscribe to template name changes to update field template name
    this.form.get('name')?.valueChanges.subscribe(name => {
      if (this.fieldForm) {
        this.fieldForm.patchValue({
          fieldTemplateName: name
        }, { emitEvent: false });
      }
    });

    this.agentService.getAgents(1, 1000).subscribe({
      next: (res) => {
        this.agents = res.items.map((a: any) => ({ id: a.id, name: a.name ?? a.agentName ?? a.code }));
      },
      error: () => {}
    });

    // Conditionally require length only when fieldType is 'TextBox' (String)
    const fieldTypeCtrl = this.fieldForm.get('fieldType');
    const lengthCtrl = this.fieldForm.get('length');
    fieldTypeCtrl?.valueChanges.subscribe((val) => {
      if (!lengthCtrl) return;
      if (val === 'TextBox') {
        lengthCtrl.setValidators([Validators.required, Validators.min(1)]);
      } else {
        lengthCtrl.clearValidators();
        lengthCtrl.setValue(0, { emitEvent: false });
      }
      lengthCtrl.updateValueAndValidity({ emitEvent: false });
    });

      const fixLengthCtrl = this.form.get('fixLength');
  const fieldDelimiterCtrl = this.form.get('fieldDelimiter');

  fixLengthCtrl?.valueChanges.subscribe(val => {
    if (val) {
      fieldDelimiterCtrl?.setValue(false, { emitEvent: false });
    }
  });

  fieldDelimiterCtrl?.valueChanges.subscribe(val => {
    if (val) {
      fixLengthCtrl?.setValue(false, { emitEvent: false });
    }
  });

    const state: any = history.state;
    if (state && state.template) {
      const t = state.template as {
        id: string;
        agentId?: string;
        name: string;
        sheetName: string;
        format: '.txt' | '.xls' | '.xlsx' | '.csv' | string;
        fixLength: boolean;
        fieldDelimiter: string;
      };
      this.templateId = t.id;
      this.templateSaved = true;
      this.form.patchValue({
        agentId: t.agentId ?? '',
        name: t.name ?? '',
        sheetName: t.sheetName ?? '',
        format: (t.format as any) ?? '.txt',
        fixLength: !!t.fixLength,
        fieldDelimiter: !!(t.fieldDelimiter && t.fieldDelimiter.length > 0),
        delimiterText: t.fieldDelimiter ?? ''
      });

      const fields = Array.isArray(state.fields) ? state.fields : [];
      this.fields = fields.map((f: any) => ({
        id: String(f.id ?? ''),
        order: Number(f.fieldOrder ?? f.order ?? 0),
        fieldName: String(f.fieldName ?? ''),
        fieldType: String(f.fieldType ?? ''),
        required: !!(f.required ?? false),
        enable: !!(f.enabled ?? f.enable ?? false),
        startIndex: Number(f.startIndex ?? 0),
        length: Number(f.length ?? 0),
      })).sort((a: { order: number }, b: { order: number }) => a.order - b.order);
    }


this.form.get('fixLength')?.valueChanges.subscribe(isFixed => {
  const fieldOrderCtrl = this.fieldForm.get('fieldOrder');
  const startIndexCtrl = this.fieldForm.get('startIndex');
  const lengthCtrl = this.fieldForm.get('length');

  if (isFixed) {
    fieldOrderCtrl?.clearValidators();
    fieldOrderCtrl?.setValue(null, { emitEvent: false });

    startIndexCtrl?.setValidators([Validators.required, Validators.min(0)]);
    lengthCtrl?.setValidators([Validators.required, Validators.min(1)]);
  } else {
    fieldOrderCtrl?.setValidators([Validators.required]);

    startIndexCtrl?.clearValidators();
    lengthCtrl?.clearValidators();
  }

  fieldOrderCtrl?.updateValueAndValidity({ emitEvent: false });
  startIndexCtrl?.updateValueAndValidity({ emitEvent: false });
  lengthCtrl?.updateValueAndValidity({ emitEvent: false });
});


  }

  get isFixLength(): boolean {
  return !!this.form.get('fixLength')?.value;
}


  save(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    this.errorMessage = null;
    const v = this.form.value as {
      agentId: string;
      name: string;
      sheetName: string;
      format: '.txt' | '.xls' | '.xlsx' | '.csv';
      fixLength: boolean;
      fieldDelimiter: boolean;
      delimiterText: string;
    };
    const formatMap: Record<string, string> = {
      '.txt': 'Txt',
      '.xls': 'Xls',
      '.xlsx': 'Xlsx',
      '.csv': 'Csv'
    };
    const payload = {
      agentId: v.agentId,
      name: v.name,
      sheetName: v.sheetName,
      format: formatMap[v.format] ?? 'Txt',
      isFixedLength: !!v.fixLength,
      delimiterEnabled: !!v.fieldDelimiter,
      delimiter: v.fieldDelimiter ? (v.delimiterText || ',') : '',
      isActive: true,
    };

    // If we have a templateId, treat as edit and call PUT endpoint
    if (this.templateId) {
      this.templateService.updateTemplate({ id: this.templateId, ...payload }).subscribe({
        next: (updated) => {
          // keep current templateId, stay on fields tab available
          this.templateSaved = true;
          this.isSubmitting = false;
          Swal.fire({ icon: 'success', title: 'Template updated', timer: 1200, showConfirmButton: false });
        },
        error: (err) => {
          const body = (err?.error ?? err) as any;
          this.errorMessage = body?.errorMessage
            ?? body?.message
            ?? err?.message
            ?? 'An error occurred while updating the template.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Add flow (POST)
      this.templateService.addTemplate(payload).subscribe({
        next: (created) => {
          this.templateId = created.id;
          this.templateSaved = true;
          this.activeTab = 'fields';
          this.loadFields();
          this.isSubmitting = false;
          Swal.fire({
            icon: 'success',
            title: 'Template saved',
            text: 'You can now configure the fields for this template.',
            confirmButtonText: 'OK'
          });
        },
        error: (err) => {
          // Try to extract backend error message from common shapes
          const body = (err?.error ?? err) as any;
          this.errorMessage = body?.errorMessage
            ?? body?.message
            ?? err?.message
            ?? 'An error occurred while saving the template.';
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/bulk-upload-template']);
  }

  get isDelimiterEnabled(): boolean {
    return !!this.form.get('fieldDelimiter')?.value;
  }

  switchTab(tab: 'template' | 'fields'): void {
    if (tab === 'fields' && !this.templateSaved) {
      // gate until saved
      this.activeTab = 'template';
      return;
    }
    this.activeTab = tab;
    if (this.activeTab === 'fields' && this.templateId) {
      this.loadFields();
    }
  }

  toggleAddField(): void {
    this.showAddFieldForm = !this.showAddFieldForm;
    if (!this.showAddFieldForm) {
      this.fieldForm.reset({ fieldTemplateName: '', fieldOrder: null, fieldName: '', fieldType: '', required: false, enable: false, startIndex: 0, length: 0 });
    }
  }

  saveField(): void {
    if (this.fieldForm.invalid || !this.templateId) return;
    const v = this.fieldForm.value as any;
    const toApiType = (uiType: string) => ({ 'TextBox': 'String' } as Record<string, string>)[uiType] ?? uiType;
    const base = {
      templateId: this.templateId,
      fieldOrder: Number(v.fieldOrder),
      fieldName: String(v.fieldName),
      fieldType: toApiType(String(v.fieldType)),
      required: !!v.required,
      enabled: !!v.enable,
      startIndex: Number(v.startIndex ?? 0),
      length: Number(v.length ?? 0),
    };
    debugger;
    if (this.editingFieldId) {
      this.templateService.updateTemplateField({ id: this.editingFieldId, ...base }).subscribe({
        next: (updated) => {
          const idx = this.fields.findIndex((x) => x.id === updated.id);
          const updatedRow = {
            id: updated.id,
            order: updated.fieldOrder,
            fieldName: updated.fieldName,
            fieldType: updated.fieldType,
            required: updated.required,
            enable: updated.enabled,
            startIndex: updated.startIndex,
            length: updated.length,
          } as typeof this.fields[number];
          if (idx >= 0) this.fields[idx] = updatedRow; else this.fields.push(updatedRow);
          this.fields.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
          this.editingFieldId = undefined;
          // Show success and reload list to reflect server state
          Swal.fire({ icon: 'success', title: 'Field updated', timer: 1200, showConfirmButton: false });
          this.loadFields();
          this.toggleAddField();
        },
        error: (err) => {
          const body = (err?.error ?? err) as any;
          const msg = body?.errorMessage ?? body?.message ?? err?.message ?? 'Failed to update field.';
          Swal.fire({ icon: 'error', title: 'Update failed', text: msg });
        }
      });
    } else {
      this.templateService.addTemplateField(base).subscribe({
        next: (created) => {
          this.fields.push({
            id: created.id,
            order: created.fieldOrder,
            fieldName: created.fieldName,
            fieldType: created.fieldType,
            required: created.required,
            enable: created.enabled,
            startIndex: created.startIndex,
            length: created.length,
          });
          this.fields.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
          this.toggleAddField();
        },
        error: (err) => {
          const body = (err?.error ?? err) as any;
          const msg = body?.errorMessage ?? body?.message ?? err?.message ?? 'Failed to add field.';
          Swal.fire({ icon: 'error', title: 'Save failed', text: msg });
        }
      });
    }
  }

  onEditField(f: any) {
    console.log('onEditField',f);
    // Convert API type back to UI
    const toUiType = (apiType: string) => ({ 'String': 'TextBox' } as Record<string, string>)[apiType] ?? apiType;
    this.editingFieldId = f.id;
    if (!this.showAddFieldForm) this.showAddFieldForm = true;
    this.fieldForm.patchValue({
      fieldTemplateName: f.templateName,
      fieldOrder: f.order,
      fieldName: f.fieldName,
      fieldType: toUiType(f.fieldType),
      required: f.required,
      enable: f.enable,
      startIndex: f.startIndex,
      length: f.length,
    });
    // Ensure validators reflect the current fieldType after patch
    const lengthCtrl2 = this.fieldForm.get('length');
    if (this.fieldForm.get('fieldType')?.value === 'TextBox') {
      lengthCtrl2?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      lengthCtrl2?.clearValidators();
    }
    lengthCtrl2?.updateValueAndValidity({ emitEvent: false });
  }

  onDeleteField(f: { id?: string }): void {
    if (!f.id) return;
    Swal.fire({
      icon: 'warning',
      title: 'Delete field?',
      text: 'This action cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((res) => {
      if (!res.isConfirmed) return;
      this.templateService.deleteTemplateField(f.id!).subscribe({
        next: () => {
          this.fields = this.fields.filter((x) => x.id !== f.id);
          // Show success and reload list to reflect server state
          Swal.fire({ icon: 'success', title: 'Field deleted', timer: 1200, showConfirmButton: false });
          this.loadFields();
        },
        error: (err) => {
          const body = (err?.error ?? err) as any;
          const msg = body?.errorMessage ?? body?.message ?? err?.message ?? 'Failed to delete field.';
          Swal.fire({ icon: 'error', title: 'Delete failed', text: msg });
        }
      });
    });
  }

  private loadFields(): void {
    if (!this.templateId) return;
    this.isFieldsLoading = true;
    this.templateService.getTemplateFields(this.templateId).subscribe({
      next: (items) => {
        console.log( '1',items);
        this.fields = items.map((f) => ({
          id: f.id,
          order: f.fieldOrder,
          fieldName: f.fieldName,
          fieldType: f.fieldType,
          required: f.required,
          enable: f.enabled,
          startIndex: f.startIndex,
          length: f.length,
          templateName: f.templateName
        }));
        console.log('2',this.fields);
        
        this.fields.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
        this.isFieldsLoading = false;
      },
      error: () => { this.isFieldsLoading = false; }
    });
  }
}

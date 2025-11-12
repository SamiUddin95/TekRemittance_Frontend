import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface AmlScreeningData {
  id: string;
  accountNumber: string;
  accountTitle: string;
  bankName: string;
  branchCode: string;
  status: 'Pending' | 'Pass' | 'Fail' | 'Review';
  screeningDate: string;
  hitCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  remarks: string;
  agentId: string;
  dataJson?: string;
  createdOn: string;
  error?: string;
}

export interface AmlScreeningResponse {
  status: string;
  items: AmlScreeningData[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AmlScreeningService {
  
  constructor() { }

  getDataByAgent(agentId: string, pageNumber: number, pageSize: number): Observable<AmlScreeningResponse> {
    // Mock implementation - replace with actual API call
    const mockData: AmlScreeningData[] = [
      {
        id: '1',
        accountNumber: '0001002716133936',
        accountTitle: 'MUHAMMAD AHSAN GUL',
        bankName: 'Habib Bank Limited',
        branchCode: '0726',
        status: 'Pass',
        screeningDate: '2024-11-12',
        hitCount: 0,
        riskLevel: 'Low',
        remarks: 'No matches found',
        agentId: agentId,
        dataJson: JSON.stringify({
          'Account Number': '0001002716133936',
          'Account Title': 'MUHAMMAD AHSAN GUL',
          'Bank Name': 'Habib Bank Limited',
          'Branch Code': '0726',
          'Status': 'Pass',
          'Screening Date': '2024-11-12',
          'Hit Count': 0,
          'Risk Level': 'Low',
          'Remarks': 'No matches found'
        }),
        createdOn: new Date().toISOString()
      },
      {
        id: '2',
        accountNumber: '0001002716133937',
        accountTitle: 'AHMED RAZA',
        bankName: 'Habib Bank Limited',
        branchCode: '0726',
        status: 'Review',
        screeningDate: '2024-11-12',
        hitCount: 2,
        riskLevel: 'Medium',
        remarks: 'Partial name match found - requires manual review',
        agentId: agentId,
        dataJson: JSON.stringify({
          'Account Number': '0001002716133937',
          'Account Title': 'AHMED RAZA',
          'Bank Name': 'Habib Bank Limited',
          'Branch Code': '0726',
          'Status': 'Review',
          'Screening Date': '2024-11-12',
          'Hit Count': 2,
          'Risk Level': 'Medium',
          'Remarks': 'Partial name match found - requires manual review'
        }),
        createdOn: new Date().toISOString()
      },
      {
        id: '3',
        accountNumber: '0001002716133938',
        accountTitle: 'SARA KHAN',
        bankName: 'Habib Bank Limited',
        branchCode: '0726',
        status: 'Fail',
        screeningDate: '2024-11-11',
        hitCount: 5,
        riskLevel: 'High',
        remarks: 'Multiple matches found with sanctioned entities',
        agentId: agentId,
        dataJson: JSON.stringify({
          'Account Number': '0001002716133938',
          'Account Title': 'SARA KHAN',
          'Bank Name': 'Habib Bank Limited',
          'Branch Code': '0726',
          'Status': 'Fail',
          'Screening Date': '2024-11-11',
          'Hit Count': 5,
          'Risk Level': 'High',
          'Remarks': 'Multiple matches found with sanctioned entities'
        }),
        createdOn: new Date().toISOString()
      },
      {
        id: '4',
        accountNumber: '0001002716133939',
        accountTitle: 'ALI HASSAN',
        bankName: 'Habib Bank Limited',
        branchCode: '0726',
        status: 'Pass',
        screeningDate: '2024-11-10',
        hitCount: 0,
        riskLevel: 'Low',
        remarks: 'No matches found',
        agentId: agentId,
        dataJson: JSON.stringify({
          'Account Number': '0001002716133939',
          'Account Title': 'ALI HASSAN',
          'Bank Name': 'Habib Bank Limited',
          'Branch Code': '0726',
          'Status': 'Pass',
          'Screening Date': '2024-11-10',
          'Hit Count': 0,
          'Risk Level': 'Low',
          'Remarks': 'No matches found'
        }),
        createdOn: new Date().toISOString()
      }
    ];

    const response: AmlScreeningResponse = {
      status: 'success',
      items: mockData,
      totalCount: mockData.length
    };

    return of(response);
  }

  approveScreening(screeningId: string): Observable<{status: string, message: string}> {
    // Mock implementation - replace with actual API call
    return of({
      status: 'success',
      message: 'AML screening approved successfully'
    });
  }

  rejectScreening(screeningId: string): Observable<{status: string, message: string}> {
    // Mock implementation - replace with actual API call
    return of({
      status: 'success',
      message: 'AML screening rejected successfully'
    });
  }
}

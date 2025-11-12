import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface FetchAccountsData {
  id: string;
  accountNumber: string;
  accountTitle: string;
  bankName: string;
  branchCode: string;
  status: 'Pending' | 'Verified' | 'Failed';
  verificationDate: string;
  agentId: string;
  dataJson?: string;
  createdOn: string;
  error?: string;
}

export interface FetchAccountsResponse {
  status: string;
  items: FetchAccountsData[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FetchAccountsService {
  
  constructor() { }

  getDataByAgent(agentId: string, pageNumber: number, pageSize: number): Observable<FetchAccountsResponse> {
    // Mock implementation - replace with actual API call
    const mockData: FetchAccountsData[] = [
      {
        id: '1',
        accountNumber: '0001002716133936',
        accountTitle: 'MUHAMMAD AHSAN GUL',
        bankName: 'Habib Bank Limited',
        branchCode: '0726',
        status: 'Verified',
        verificationDate: '2024-11-12',
        agentId: agentId,
        dataJson: JSON.stringify({
          'Account Number': '0001002716133936',
          'Account Title': 'MUHAMMAD AHSAN GUL',
          'Bank Name': 'Habib Bank Limited',
          'Branch Code': '0726',
          'Status': 'Verified',
          'Verification Date': '2024-11-12'
        }),
        createdOn: new Date().toISOString()
      },
      {
        id: '2',
        accountNumber: '0001002716133937',
        accountTitle: 'AHMED RAZA',
        bankName: 'Habib Bank Limited',
        branchCode: '0726',
        status: 'Pending',
        verificationDate: '-',
        agentId: agentId,
        dataJson: JSON.stringify({
          'Account Number': '0001002716133937',
          'Account Title': 'AHMED RAZA',
          'Bank Name': 'Habib Bank Limited',
          'Branch Code': '0726',
          'Status': 'Pending',
          'Verification Date': '-'
        }),
        createdOn: new Date().toISOString()
      },
      {
        id: '3',
        accountNumber: '0001002716133938',
        accountTitle: 'SARA KHAN',
        bankName: 'Habib Bank Limited',
        branchCode: '0726',
        status: 'Failed',
        verificationDate: '2024-11-11',
        agentId: agentId,
        dataJson: JSON.stringify({
          'Account Number': '0001002716133938',
          'Account Title': 'SARA KHAN',
          'Bank Name': 'Habib Bank Limited',
          'Branch Code': '0726',
          'Status': 'Failed',
          'Verification Date': '2024-11-11'
        }),
        createdOn: new Date().toISOString()
      }
    ];

    const response: FetchAccountsResponse = {
      status: 'success',
      items: mockData,
      totalCount: mockData.length
    };

    return of(response);
  }

  verifyAccount(accountId: string): Observable<{status: string, message: string}> {
    // Mock implementation - replace with actual API call
    return of({
      status: 'success',
      message: 'Account verified successfully'
    });
  }

  rejectAccount(accountId: string): Observable<{status: string, message: string}> {
    // Mock implementation - replace with actual API call
    return of({
      status: 'success',
      message: 'Account rejected successfully'
    });
  }
}

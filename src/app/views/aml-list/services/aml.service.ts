import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Aml, AmlFilter, ApiResponse, AmlListResponse, CreateAmlRequest } from '../models/aml.model';

@Injectable({
  providedIn: 'root'
})
export class AmlService {
  private baseUrl = 'https://localhost:44367/api/BasicSetup';

  constructor(private http: HttpClient) { }

  // GET: /api/BasicSetup/AmlData?pageNumber=1&pageSize=10
  getAmlList(pageNumber: number = 1, pageSize: number = 10, filters?: AmlFilter): Observable<ApiResponse<AmlListResponse>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    // Add filters if provided
    if (filters) {
      if (filters.cnic) params = params.set('cnic', filters.cnic);
      if (filters.accountName) params = params.set('accountName', filters.accountName);
      if (filters.address) params = params.set('address', filters.address);
    }

    return this.http.get<ApiResponse<AmlListResponse>>(`${this.baseUrl}/AmlData`, { params });
  }

  // GET: /api/BasicSetup/AmlbyId/{id}
  getAmlById(id: string): Observable<ApiResponse<Aml>> {
    return this.http.get<ApiResponse<Aml>>(`${this.baseUrl}/AmlbyId/${id}`);
  }

  // POST: /api/BasicSetup/CreateAml
  createAml(aml: Partial<Aml>): Observable<ApiResponse<Aml>> {
    const createRequest: CreateAmlRequest = {
      id: this.generateUUID(),
      cnic: aml.cnic || '',
      accountName: aml.accountName || '',
      address: aml.address || '',
      createdBy: 'current-user', // This should come from authentication service
      createdOn: new Date().toISOString(),
      updatedBy: 'current-user',
      updatedOn: new Date().toISOString()
    };

    return this.http.post<ApiResponse<Aml>>(`${this.baseUrl}/CreateAml`, createRequest);
  }

  // PUT: /api/BasicSetup/UpdateAml
  updateAml(aml: Aml): Observable<ApiResponse<Aml>> {
    const updateRequest = {
      ...aml,
      updatedBy: 'current-user',
      updatedOn: new Date().toISOString()
    };

    return this.http.put<ApiResponse<Aml>>(`${this.baseUrl}/UpdateAml`, updateRequest);
  }

  // DELETE: /api/BasicSetup/AmlbyId/{id}
  deleteAml(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/AmlbyId/${id}`);
  }

  // Helper method to generate UUID for new records
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Error handling helper
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}

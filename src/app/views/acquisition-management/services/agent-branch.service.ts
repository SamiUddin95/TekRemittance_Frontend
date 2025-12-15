import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../src/environments/environment';
import { Observable, catchError, throwError, map } from 'rxjs';

export interface Branch {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  contactPerson: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgentBranchService {
  private apiUrl = `${environment.apiUrl}/Branches`;
  // Provided list endpoint
  // private listApiUrl = `https://localhost:44367/api/Branches`;

  constructor(private http: HttpClient) {}


  getBranches(pageNumber: number = 1, pageSize: number = 10, filters: any = {}): Observable<any> {
  let url = `${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  if (filters.code)
    url += `&code=${filters.code}`;

  if (filters.agentname)
    url += `&agentName=${filters.agentname}`;

  if (filters.agentbranchname)
    url += `&agentBranchName=${filters.agentbranchname}`;

  return this.http.get<any>(url).pipe(
    map((res) => {
      const d = res?.data ?? res ?? {};

      const items: Branch[] = (d.items ?? []).map((x: any) => ({
        id: x.id,
        code: String(x.code ?? ''),
        name: String(x.agentBranchName ?? x.name ?? ''),
        agentId: String(x.agentId ?? ''),
        agentName: String(x.agentName ?? ''),
        contactPerson: String(x.contactPerson ?? ''),
        phone: String(x.phone1 ?? x.phone ?? ''),
        address: String(x.address ?? ''),
        isActive: !!x.isActive,
        createdAt: String(x.createdOn ?? ''),
        updatedAt: String(x.updatedOn ?? ''),
        approvalStatus: !!x.approvalStatus
      }));

      return {
        items,
        totalCount: Number(d.totalCount ?? 0),
        pageNumber: Number(d.pageNumber ?? pageNumber),
        pageSize: Number(d.pageSize ?? pageSize),
        totalPages: Number(d.totalPages ?? 1),
        statusCode: Number(res?.statusCode ?? 200),
        status: String(res?.status ?? 'success')
      };
    })
  );
}


  getBranchById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => {
        const d = res?.data ?? res;
        if (!d) return d;
        return {
          id: d.id,
          agentId: d.agentId,
          countryId: d.countryId,
          provinceId: d.provinceId,
          cityId: d.cityId,
          code: d.code,
          name: d.agentBranchName ?? d.name,
          contactPerson: d.contactPerson,
          phone1: d.phone1,
          phone2: d.phone2,
          fax: d.fax,
          email: d.email,
          address: d.address,
          acquisitionModes: d.acquisitionModes,
          disbursementModes: d.disbursementModes,
          // booleans (optional downstream)
          isOnlineAllow: String(d.acquisitionModes || '').toLowerCase().includes('isonlineallow'.toLowerCase()),
          isFileUploadAllow: String(d.acquisitionModes || '').toLowerCase().includes('isfileuploadallow'.toLowerCase()),
          isFtpAllow: String(d.acquisitionModes || '').toLowerCase().includes('isftpallow'.toLowerCase()),
          isEmailUploadAllow: String(d.acquisitionModes || '').toLowerCase().includes('isemailuploadallow'.toLowerCase()),
          isWebServiceAllow: String(d.acquisitionModes || '').toLowerCase().includes('iswebserviceallow'.toLowerCase()),
          isBeneficiarySmsAllow: String(d.acquisitionModes || '').toLowerCase().includes('isbeneficiarysmsallow'.toLowerCase()),
          isActive: String(d.acquisitionModes || '').toLowerCase().includes('isActive'.toLowerCase()),
          isOtcAllow: String(d.disbursementModes || '').toLowerCase().includes('isotcallow'.toLowerCase()),
          isDirectCreditAllow: String(d.disbursementModes || '').toLowerCase().includes('isdirectcreditallow'.toLowerCase()),
          isOtherCreditAllow: String(d.disbursementModes || '').toLowerCase().includes('isothercreditallow'.toLowerCase()),
          isRemitterSmsAllow: String(d.disbursementModes || '').toLowerCase().includes('isremittersmsallow'.toLowerCase()),
        };
      }),
      catchError(this.handleError)
    );
  }

createBranch(branch: Omit<Branch, 'createdAt' | 'updatedAt'> & { id: string, dto: any }): Observable<Branch> {
  const branchWithIdAndDto = {
    ...branch,
    id: '00000000-0000-0000-0000-000000000000'
  };

  return this.http.post<Branch>(this.apiUrl, branchWithIdAndDto)
    .pipe(
      catchError(this.handleError)
    );
}


  updateBranch(id: string, branch: Partial<Branch>): Observable<Branch> {
    debugger;
    return this.http.put<Branch>(`${this.apiUrl}/${id}`, branch)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}

import { Group } from './../models/group.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/user.model';
import { map } from 'rxjs/operators';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })

export class GroupService{
private apiUrl = `${environment.apiUrl}/Groups`;


  constructor(private http: HttpClient) {}

addGroup(group: any): Observable<any> {
  const body = {
    name: group.name,
    description: group.description,
    isActive: group.isActive,
    makerAndChecker: group.makerAndChecker ?? 'maker'
  };

  return this.http.post<any>(`${environment.apiUrl}/Groups`, body);
}


updateGroup(id: string, group: any): Observable<any> {
  const body = {
    id: group.id,
    name: group.name,
    description: group.description,
    isActive: group.isActive,
    makerAndChecker: group.makerAndChecker ?? 'maker'
  };

  return this.http.put<any>(`${environment.apiUrl}/Groups/${id}`, body);
}

getGroups(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<any>> {

  const params = {
    pageNumber: page.toString(),
    pageSize: pageSize.toString()
  } as const;

  return this.http.get<any>(this.apiUrl, { params }).pipe(
    map((resp: any) => {
      console.log('Full backend response:', resp); // Backend response dekhne ke liye

      const d = resp?.data ?? {};

      const itemsRaw = Array.isArray(d?.items) ? d.items : [];
      console.log('Raw items from backend:', itemsRaw); // Raw items check karne ke liye

      const items = itemsRaw.map((it: any) => ({
        id: String(it.id),
        name: String(it.name ?? ''),
        description: String(it.description ?? ''),
        isActive: it.isActive,
        createdAt: String(it.createdOn ?? ''),
        updatedAt: String(it.updatedOn ?? ''),
        makerAndChecker: String(it.makerAndChecker ?? 'maker')
      }));

      console.log('Mapped items (with boolean isActive):', items); // Mapped items check

      return {
        items,
        totalCount: d.totalCount ?? items.length,
        page: d.pageNumber ?? page,
        pageSize: d.pageSize ?? pageSize,
        totalPages: d.totalPages ?? 0
      } as PaginatedResponse<any>;
    }),
    catchError((err) => {
      console.error('Error in getGroups:', err);
      return this.handleError(err);
    })
  );
}


getGroupById(id: string): Observable<Group> {
  return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
    map(res => {
      const d = res?.data ?? res;
      return {
        id: String(d.id),
        name: String(d.name ?? ''),
        description: String(d.description ?? ''),
        isActive: Boolean(d.isActive ?? true),
        createdAt: d.createdOn ? new Date(d.createdOn) : undefined,
        updatedAt: d.updatedOn ? new Date(d.updatedOn) : undefined,
        makerAndChecker: String(d.makerAndChecker ?? 'maker')
      };
    }),
    catchError(this.handleError)
  );
}

deleteGroup(id: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`)
    .pipe(
      catchError(this.handleError)
    );
}

assignUsersToGroup(id: string, selectedUserIds: string[]): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/${id}/users`, selectedUserIds)
  .pipe(
    catchError(this.handleError)
  );
}

getAssignedUsers(groupId: string): Observable<User[]> {
  return this.http.get<any>(`${this.apiUrl}/${groupId}/users`).pipe(
    map(res => res.data || []),
    catchError(this.handleError)
  );
}

getPermissions(pageNumber: number = 1, pageSize: number = 1000): Observable<any> {
  const params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());
  
  return this.http.get<any>(`${environment.apiUrl}/Permissions`, { params }).pipe(
    map(res => res?.data || {}),
    catchError(this.handleError)
  );
}

getGroupPermissions(groupId: string): Observable<string[]> {
  return this.http.get<any>(`${this.apiUrl}/${groupId}/permissions`).pipe(
    map(res => res?.data || []),
    catchError(this.handleError)
  );
}

assignPermissionsToGroup(groupId: string, permissionIds: string[]): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/${groupId}/permissions`, permissionIds)
    .pipe(
      catchError(this.handleError)
    );
}

deleteUserFromGroup(groupId: string, userId: string): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/${groupId}/userGroup`, {
    body: userId
  })
    .pipe(
      catchError(this.handleError)
    );
}

    handleError(error: any) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }

}

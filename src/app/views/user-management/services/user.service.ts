import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/user.model';
import { environment } from '@env/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private users: User[] = [
    { id: crypto?.randomUUID ? crypto.randomUUID() : '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', employeeId: 'EMP001', limitType: 1000, loginName: 'johnd', isActive: true, isApproved: true },
  ];

  private usersSubject = new BehaviorSubject<User[]>(this.users);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUsers(page: number = 1, rowsPerPage: number = 100000, params?: { [key: string]: any }): Observable<{
    items: User[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }> {
    let httpParams = new HttpParams({ fromObject: params ?? {} })
      .set('pageNumber', String(page))
      .set('pageSize', String(rowsPerPage));
    return this.http
      .get<any>(`${environment.apiUrl}/Users`, { params: httpParams })
      .pipe(
        map((resp) => {
          const payload = resp?.data ?? resp;
          const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
          const users = (itemsRaw as any[]).map((r) => <User>{
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            employeeId: r.employeeId,
            limitType: r.limit ?? r.limitType ?? 0,
            loginName: r.loginName,
            isActive: r.isActive,
            isApproved: r.isApproved ?? false,
            isSupervise: r.isSupervise,
            createdAt: r.createdOn ? new Date(r.createdOn) : (r.createdAt ? new Date(r.createdAt) : undefined),
            updatedAt: r.updatedOn ? new Date(r.updatedOn) : (r.updatedAt ? new Date(r.updatedAt) : undefined),
          });
          return {
            items: users,
            totalCount: payload?.totalCount ?? users.length,
            pageNumber: payload?.pageNumber ?? page,
            pageSize: payload?.pageSize ?? rowsPerPage,
            totalPages: payload?.totalPages ?? 1,
          };
        })
      );
  }

  getUnAuthorizedUsers(page: number = 1, rowsPerPage: number = 10, params?: { [key: string]: any }): Observable<{
    items: User[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }> {
    let httpParams = new HttpParams({ fromObject: params ?? {} })
      .set('pageNumber', String(page))
      .set('pageSize', String(rowsPerPage));

    return this.http
      .get<any>(`${environment.apiUrl}/Users/UnAuthorizeUsers`, { params: httpParams })
      .pipe(
        map((resp) => {
          const payload = resp?.data ?? resp;
          const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
          const users = (itemsRaw as any[]).map((r) => <User>{
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            employeeId: r.employeeId,
            limitType: r.limit ?? r.limitType ?? 0,
            loginName: r.loginName,
            isActive: r.isActive,
            isApproved: r.isApproved ?? false,
            isSupervise: r.isSupervise,
            createdAt: r.createdOn ? new Date(r.createdOn) : (r.createdAt ? new Date(r.createdAt) : undefined),
            updatedAt: r.updatedOn ? new Date(r.updatedOn) : (r.updatedAt ? new Date(r.updatedAt) : undefined),
          });
          return {
            items: users,
            totalCount: payload?.totalCount ?? users.length,
            pageNumber: payload?.pageNumber ?? page,
            pageSize: payload?.pageSize ?? rowsPerPage,
            totalPages: payload?.totalPages ?? 1,
          };
        })
      );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<any>(`${environment.apiUrl}/Users/${id}`).pipe(
      map((resp) => {
        const r = Array.isArray(resp) ? resp[0] : (resp?.data ?? resp);
        return <User>{
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          employeeId: r.employeeId,
          limitType: r.limit ?? r.limitType ?? 0,
          loginName: r.loginName,
          isActive: r.isActive,
          isApproved: r.isApproved ?? false,
          isSupervise: r.isSupervise,
          createdAt: r.createdOn ? new Date(r.createdOn) : (r.createdAt ? new Date(r.createdAt) : undefined),
          updatedAt: r.updatedOn ? new Date(r.updatedOn) : (r.updatedAt ? new Date(r.updatedAt) : undefined),
        };
      })
    );
  }

  addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Observable<any> {
    const body: any = {
      user: {
        // id omitted for create; backend can assign
        name: user.name,
        email: user.email,
        phone: user.phone,
        employeeId: user.employeeId,
        limit: (user as any).limitType ?? 0,
        loginName: user.loginName,
        isActive: user.isActive,
        isSupervise: (user as any).isSupervise ?? false,
      },
      password: (user as any).password,
    };
    return this.http.post<any>(`${environment.apiUrl}/Users`, body);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    const body: any = {
      id: id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      employeeId: user.employeeId,
      limit: (user as any).limitType ?? 0,
      loginName: user.loginName,
      isActive: user.isActive,
      isSupervise: (user as any).isSupervise ?? false,
    };
    if (user.password) {
      body.password = user.password;
    }
    return this.http.put<any>(`${environment.apiUrl}/Users`, body).pipe(
      map((r) => <User>{
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        employeeId: r.employeeId,
        limitType: r.limit ?? r.limitType ?? 0,
        loginName: r.loginName,
        isActive: r.isActive,
        isApproved: r.isApproved ?? false,
        isSupervise: r.isSupervise,
        createdAt: r.createdOn ? new Date(r.createdOn) : (r.createdAt ? new Date(r.createdAt) : undefined),
        updatedAt: r.updatedOn ? new Date(r.updatedOn) : (r.updatedAt ? new Date(r.updatedAt) : undefined),
      })
    );
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<any>(`${environment.apiUrl}/Users/${id}`).pipe(
      map((resp) => {
        const r = resp ?? {};
        if (typeof r === 'boolean') return r;
        if (typeof r?.statusCode === 'number') return r.statusCode === 200 || r.statusCode === 204;
        if (typeof r?.status === 'string') return r.status.toLowerCase() === 'success';
        return true;
      })
    );
  }

  superviseUser(id: string, isSupervise: boolean): Observable<any> {
    const url = `${environment.apiUrl}/Users/${id}/supervise`;
    const params = new HttpParams().set('isSupervise', String(isSupervise));
    return this.http.put<any>(url, null, { params });
  }

  updateUserNamePassword(id: string, name: string, password: string): Observable<User> {
    const url = `${environment.apiUrl}/Users/${id}/name-password`;
    const body = { name, password };
    return this.http.put<any>(url, body).pipe(
      map((r) => <User>{
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        employeeId: r.employeeId,
        limitType: r.limit ?? r.limitType ?? 0,
        loginName: r.loginName,
        isActive: r.isActive,
        isApproved: r.isApproved ?? false,
        isSupervise: r.isSupervise,
        createdAt: r.createdOn ? new Date(r.createdOn) : (r.createdAt ? new Date(r.createdAt) : undefined),
        updatedAt: r.updatedOn ? new Date(r.updatedOn) : (r.updatedAt ? new Date(r.updatedAt) : undefined),
      })
    );
  }
}

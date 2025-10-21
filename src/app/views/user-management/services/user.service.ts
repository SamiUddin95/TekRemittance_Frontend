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

  getUsers(params?: { [key: string]: any }): Observable<User[]> {
    const httpParams = new HttpParams({ fromObject: params ?? {} });
    return this.http
      .get<any>(`${environment.apiUrl}/Users`, { params: httpParams })
      .pipe(
        map((resp) => {
          const rows = Array.isArray(resp) ? resp : resp?.data ?? [];
          return (rows as any[]).map((r) => <User>{
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
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users.splice(idx, 1);
      this.usersSubject.next([...this.users]);
      return of(true);
    }
    return of(false);
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

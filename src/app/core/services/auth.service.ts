import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@/environments/environment';
import { Observable, finalize, tap } from 'rxjs';

export interface LoginPayload { loginName: string; password: string; }
export interface LoginResponse { status: string; data: { token: string; [k: string]: any }; statusCode: number; errorMessage: string | null }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly NAME_KEY = 'auth_name';

  constructor(private http: HttpClient, private router: Router) {}

  login(body: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/login`, body).pipe(
      tap(res => {
        const data: any = res?.data;
        const token = data?.token;
        if (token) this.setToken(token);
        const name = data?.['name'] || data?.['userName'] || data?.['loginName'];
        if (name) this.setName(name);
      })
    );
  }

  logout(callApi = true): Observable<any> | null {
    if (callApi) {
      return this.http.post(`${environment.apiUrl}/Auth/logout`, {}).pipe(
        finalize(() => {
          this.clearToken();
          this.clearName();
          this.router.navigate(['/sign-in']);
        })
      );
    } else {
      this.clearToken();
      this.clearName();
      this.router.navigate(['/sign-in']);
      return null;
    }
  }

  setToken(token: string) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  clearToken() {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  setName(name: string) {
    sessionStorage.setItem(this.NAME_KEY, name);
  }

  getName(): string | null {
    return sessionStorage.getItem(this.NAME_KEY);
  }

  clearName() {
    sessionStorage.removeItem(this.NAME_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

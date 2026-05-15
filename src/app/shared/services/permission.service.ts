import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissions: string[] = [];
  private permissionsSubject = new BehaviorSubject<string[]>([]);

  constructor() {
    this.loadPermissionsFromToken();
  }

  private loadPermissionsFromToken(): void {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = this.parseJwt(token);
        this.permissions = payload.permission || [];
        this.permissionsSubject.next(this.permissions);
        console.log('Permissions loaded:', this.permissions);
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        this.permissions = [];
        this.permissionsSubject.next([]);
      }
    } else {
      console.log('No token found in sessionStorage');
    }
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.permissions.includes(permission));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.permissions.includes(permission));
  }

  getPermissions(): Observable<string[]> {
    return this.permissionsSubject.asObservable();
  }

  getCurrentPermissions(): string[] {
    return [...this.permissions];
  }

  refreshPermissions(): void {
    this.loadPermissionsFromToken();
  }
}

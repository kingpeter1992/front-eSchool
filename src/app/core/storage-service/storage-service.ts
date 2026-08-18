import { Injectable } from '@angular/core';
import { AuthResponse, SchoolInfo, User } from '../models/User';


@Injectable({
  providedIn: 'root',
})
export class StorageService {

  private readonly TOKEN_KEY = 'eschool_access_token';
  private readonly REFRESH_TOKEN_KEY = 'eschool_refresh_token';
  private readonly USER_KEY = 'eschool_user';
  private readonly SCHOOL_KEY = 'eschool_school';

  saveAuth(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);

    if (response.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    }

    // On stocke toute la réponse (ou on structure l'objet utilisateur avec ses permissions)
    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(response)
    );

    if (response.school) {
      localStorage.setItem(
        this.SCHOOL_KEY,
        JSON.stringify(response.school)
      );
    }
  }

  // Retourne l'objet AuthResponse complet attendu par le Guard et le AuthStoreService
  getUser(): AuthResponse | null {
    const data = localStorage.getItem(this.USER_KEY);

    if (!data) {
      return null;
    }

    try {
      console.log('user',JSON.parse(data) as AuthResponse)
      return JSON.parse(data) as AuthResponse;

    } catch {
      return null;
    }
  }

  getSchool(): SchoolInfo | null {
    const data = localStorage.getItem(this.SCHOOL_KEY);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as SchoolInfo;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clean(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SCHOOL_KEY);
  }
}

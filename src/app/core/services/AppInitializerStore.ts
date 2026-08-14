import { Injectable, inject } from "@angular/core";
import { Observable, catchError, delay, forkJoin, tap, timer } from "rxjs";
import { SplashStore } from "./SplashStore";
import { SchoolStore } from "../../features/Schools/services/school.store";

@Injectable({
  providedIn: 'root'
})
export class AppInitializerStore {
  private readonly splash = inject(SplashStore);
  private readonly schoolStore = inject(SchoolStore);

  initialize(): Observable<any> {
    this.splash.show("Préparation de votre espace...");

    return forkJoin({
      // 1. Chargement des configurations système
      config: timer(300).pipe(
        tap(() => this.splash.update("Chargement des configurations...", 40))
      ),
      // 2. Pré-chargement des écoles dans le cache du SchoolStore
      schools: this.schoolStore.loadSchools(true).pipe(
        tap(() => this.splash.update("Chargement des établissements...", 80)),
        catchError((err) => {
          console.warn("⚠️ Impossible de pré-charger les écoles au démarrage :", err);
          return timer(0); // Continue sans bloquer le démarrage
        })
      )
    }).pipe(
      // 3. Finalisation du splash screen
      tap(() => this.splash.update("Bienvenue 👋", 100)),
      delay(300),
      tap(() => this.splash.hide())
    );
  }
}

import { Injectable, inject } from "@angular/core";
import { Observable, forkJoin, timer, tap, delay } from "rxjs";
import { SplashStore } from "./SplashStore";

@Injectable({
  providedIn: 'root'
})
export class AppInitializerStore {
  private readonly splash = inject(SplashStore);
  // Injectez votre service de données/écoles ici si nécessaire (ex: private schoolService: SchoolService)

  initialize(): Observable<any> {
    this.splash.show("Préparation de votre espace...");

    return forkJoin({
      // Exemple de chargement initial global
      config: timer(300).pipe(
        tap(() => this.splash.update("Chargement des configurations...", 50))
      )
    }).pipe(
      tap(() => this.splash.update("Bienvenue 👋", 100)),
      delay(300),
      tap(() => this.splash.hide())
    );
  }
}

import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class SplashStore {
  private readonly _visible = signal(false);
  private readonly _message = signal("Chargement...");
  private readonly _progress = signal(0);

  readonly visible = this._visible.asReadonly();
  readonly message = this._message.asReadonly();
  readonly progress = this._progress.asReadonly();

  show(message: string) {
    this._message.set(message);
    this._progress.set(0);
    this._visible.set(true);
  }

  update(message: string, progress: number) {
    this._message.set(message);
    this._progress.set(progress);
  }

  hide() {
    this._visible.set(false);
  }
}

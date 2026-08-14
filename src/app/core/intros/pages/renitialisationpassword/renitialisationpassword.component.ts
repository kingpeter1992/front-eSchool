import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from '../../../../shared/loader/loader-service';
import { Toast } from '../../../../shared/toaste/Toast';
import { AuthService } from '../../../services/auth-service';
import { AuthStoreService } from '../../../services/auth-store-service';
import { AsyncPipe, CommonModule } from '@angular/common'; // 1. Importer AsyncPipe ou CommonModule
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-renitialisationpassword',
  standalone: true,
  imports: [
    AsyncPipe, // 2. Ajouter AsyncPipe ici (ou CommonModule qui l'englobe)
    FormsModule,
    RouterLink,
  ],
  templateUrl: './renitialisationpassword.component.html',
  styleUrl: './renitialisationpassword.component.css',
})
export class RenitialisationpasswordComponent implements OnInit {
  password = '';
  token = '';
  loading$: Observable<boolean> | undefined;
  // 1. Déclarer la propriété email ici
  email: string = '';
  confirmPassword = '';
  showPassword = false;

  constructor(
    //private fb:FormBuilder,
    private loadingService: LoaderService,
    private router: Router,
    private store: AuthStoreService,
    private route: ActivatedRoute,
    private toastrService: Toast,
    private _dao: AuthService,
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    console.log("Token reçu depuis l'URL : ", this.token);
  }

  onSubmit() {
    this._dao.resetPassword(this.token, this.password).subscribe(() => {
      //   alert('Mot de passe changé avec succès');
      this.toastrService.success('Mot de passe changé avec succès');
      this.store.logout();
      this.router.navigate(['/login']);
    });
  }
}

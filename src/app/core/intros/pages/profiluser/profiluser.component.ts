import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Toast } from '../../../../shared/toaste/Toast';
import { AuthService } from '../../../services/auth-service';
import { StorageService } from '../../../storage-service/storage-service';


@Component({
  selector: 'app-profiluser',
  templateUrl: './profiluser.component.html',
  styleUrl: './profiluser.component.scss',
  standalone:false
})
export class ProfiluserComponent implements OnInit {

  code: any;
  user: any;
  result: any;

  constructor(private _dao:AuthService,
    private route:Router,
    private tokenStorage:StorageService,
    private activateRoute: ActivatedRoute,
    private toast:Toast){
  }
  ngOnInit(): void {
    this.detailLoarUser()
  }


  detailLoarUser() {
    this.user = this.tokenStorage.getUser()
    this._dao.getUser(this.user).subscribe((resp: any)=>{
      this.user = resp
      this.result = this.user.username.toUpperCase();

    })

  }


}

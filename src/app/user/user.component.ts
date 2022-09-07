import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { User } from 'firebase/auth';
import { fdb } from '../db.service';
import { setDoc, getDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Usuario } from '../interfaces';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {

  @Input() usuario: Usuario | null = null;
  adicionarCredito = new FormControl(null, Validators.min(0));

  constructor() { }

  ngOnChanges() { }

  ngAfterViewInit() { }

  ngOnInit(): void { }

  adicionaCredito(): void {
    if (this.adicionarCredito.value != null && this.usuario) {
      let v = this.usuario.cash + this.adicionarCredito.value;
      if (this.usuario) {
        updateDoc(doc(fdb, 'users/' + this.usuario.uid), { cash: v });
        this.adicionarCredito.setValue(null);
      }
    }
  }
}

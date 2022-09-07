import { Component, OnInit } from '@angular/core';
import { fdb, storage } from './db.service';
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  query,
  where,
  orderBy,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { ref } from 'firebase/storage';
import {
  getAuth,
  signInWithRedirect,
  GoogleAuthProvider,
  FacebookAuthProvider,
  User
} from 'firebase/auth';
import { CookieService } from 'ngx-cookie-service';
import { Ativo, Lote, Usuario, AcaoEmCarteira, OrdemDeCompra, OrdemDeVenda } from './interfaces';

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  ativosListados: Ativo[] = [];
  dictAtivosListados: { [key: string]: number } = {};
  ativoSelecionado: string = '';

  lotesListados: Lote[] = [];
  dictLotesListados: { [key: string]: number } = {};
  loteSelecionado: string | null = null;

  acoesEmCarteira: AcaoEmCarteira[] = [];
  dictAcoesEmCarteira: { [key: string]: number } = {};

  ordensDeVendaDoUsuario: OrdemDeVenda[] = [];
  dictOrdensVendaDoUsuario: { [key: string]: number } = {};

  ordensDeCompraDoUsuario: OrdemDeCompra[] = [];
  dictOrdensCompraDoUsuario: { [key: string]: number } = {};

  ordensDeCompra: { [key: string]: OrdemDeCompra[] } = {};
  ordensDeVenda: { [key: string]: OrdemDeVenda[] } = {};
  cacheVenda: string[] = [];

  biomaSelecionado: string = 'mata-atlantica';
  tabSelecionada: string = 'map';

  public auth = getAuth();
  usuario: Usuario | null = null;

  ngOnInit() {}

  constructor(private cookieService: CookieService) {
    this.tabSelecionada = this.cookieService.get('ultimaTab');
    this.conectaDB();
    this.conectaUsuario();
  }

  GoogleAuth() {
    signInWithRedirect(this.auth, googleProvider);
  }

  selecionaTab(tab: string) {
    this.tabSelecionada = tab;
    this.cookieService.set('ultimaTab', tab, 3);
  }

  selecionaLote(): boolean {
    let z = false;
    this.lotesListados.forEach((lote) => {
      if (lote.ativo == this.ativoSelecionado) {
        this.loteSelecionado = lote.codigo;
        z = true;
      }
    });
    if (!z) this.loteSelecionado = null;
    return z;
  }

  criaUsuario(user: User): void {
    let usuario: Usuario = {
      cash: 0,
      email: user.email,
      nome: user.displayName,
      uid: user.uid,
      imgurl: user.photoURL,
    };
    setDoc(doc(fdb, 'users/' + user.uid), usuario);
  }

  async conectaUsuario(): Promise<void> {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        getDoc(doc(fdb, 'users/' + user.uid)).then((dbuser) => {
          if (dbuser.exists()) {
            onSnapshot(doc(fdb, 'users/' + user.uid), (usuario) => {
              this.usuario = {
                cash: usuario.get('cash'),
                email: usuario.get('email'),
                nome: usuario.get('nome'),
                uid: usuario.get('uid'),
                imgurl: usuario.get('imgurl'),
              };
            });

            onSnapshot(
              query(
                collection(fdb, 'vendas'),
                where('user', '==', dbuser.get('uid')),
                where('status', '==', 'aberta')
              ),
              (coll) => {
                while (this.ordensDeVendaDoUsuario.length > 0)
                  this.ordensDeVendaDoUsuario.pop();
                coll.forEach((ordem) => {
                  this.ordensDeVendaDoUsuario.push({
                    ativo: ordem.get('ativo'),
                    corretagem: ordem.get('corretagem'),
                    data: ordem.get('data'),
                    key: ordem.get('key'),
                    keyAcao: ordem.get('keyAcao'),
                    lote: ordem.get('lote'),
                    preco: ordem.get('preco'),
                    quantidade: ordem.get('quantidade'),
                    user: ordem.get('user'),
                    qtdeExecutada: ordem.get('qtdeExecutada'),
                    status: ordem.get('status'),
                  });
                  this.dictOrdensVendaDoUsuario[ordem.get('key')] =
                    this.ordensDeVendaDoUsuario.length - 1;
                });
              }
            );

            onSnapshot(
              query(
                collection(fdb, 'compras'),
                where('user', '==', dbuser.get('uid')),
                where('status', '==', 'aberta')
              ),
              (coll) => {
                while (this.ordensDeCompraDoUsuario.length > 0)
                  this.ordensDeCompraDoUsuario.pop();
                coll.forEach((ordem) => {
                  this.ordensDeCompraDoUsuario.push({
                    ativo: ordem.get('ativo'),
                    corretagem: ordem.get('corretagem'),
                    data: ordem.get('data'),
                    key: ordem.get('key'),
                    preco: ordem.get('preco'),
                    qtdeExecutada: ordem.get('qtdeExecutada'),
                    quantidade: ordem.get('quantidade'),
                    status: ordem.get('status'),
                    user: ordem.get('user'),
                  });
                  this.dictOrdensCompraDoUsuario[ordem.get('key')] =
                    this.ordensDeCompraDoUsuario.length - 1;
                });
              }
            );

            onSnapshot(
              collection(fdb, 'users/' + dbuser.get('uid') + '/carteira'),
              (coll) => {
                while (this.acoesEmCarteira.length > 0)
                  this.acoesEmCarteira.pop();
                coll.forEach((acao) => {
                  this.acoesEmCarteira.push({
                    ativo: acao.get('ativo'),
                    key: acao.get('key'),
                    lote: acao.get('lote'),
                    quantidade: acao.get('quantidade'),
                    usuario: acao.get('usuario'),
                  });
                  this.dictAcoesEmCarteira[acao.get('key')] =
                    this.acoesEmCarteira.length - 1;
                });
              }
            );
          } else this.criaUsuario(user);
        });
      } else this.usuario = null;
    });
  }

  async conectaDB(): Promise<void> {
    let lotes = await getDocs(collection(fdb, 'lotes'));
    lotes.forEach((lote) => {
      this.lotesListados.push({
        area: lote.get('area'),
        ativo: lote.get('ativo'),
        bioma: lote.get('bioma'),
        codigo: lote.get('codigo'),
        data: lote.get('data'),
        dossie: lote.get('dossie'),
        gps: lote.get('gps'),
        gpsurl: lote.get('gpsurl'),
        imgs: lote.get('imgs'),
        manejo: lote.get('manejo'),
        projetoId: lote.get('projetoId'),
        quantidade: lote.get('quantidade'),
        zona: lote.get('zona'),
      });
      this.dictLotesListados[lote.get('codigo')] =
        this.lotesListados.length - 1;
    });

    let ativos = await getDocs(collection(fdb, 'ativos'));
    ativos.forEach((ativo) => {
      this.ativosListados.push({
        bioma: ativo.get('bioma'),
        codigo: ativo.id,
        manejo: ativo.get('manejo'),
        porcentagem: ativo.get('porcentagem'),
        titulo: ativo.get('titulo'),
        ultimoPreco: ativo.get('ultimoPreco'),
        zona: ativo.get('zona'),
      });
      this.dictAtivosListados[ativo.id] = this.ativosListados.length - 1;

      onSnapshot(doc(fdb, 'ativos', ativo.id), (doc) => {
        this.ativosListados[this.dictAtivosListados[ativo.id]] = {
          bioma: doc.get('bioma'),
          codigo: ativo.id,
          manejo: doc.get('manejo'),
          porcentagem: doc.get('porcentagem'),
          titulo: doc.get('titulo'),
          ultimoPreco: doc.get('ultimoPreco'),
          zona: doc.get('zona'),
        };
      });
    });

    this.ativosListados.forEach((ativo) => {
      this.ordensDeVenda[ativo.codigo] = [];
      this.ordensDeCompra[ativo.codigo] = [];
    });

    this.ativosListados.forEach((ativo) => {
      onSnapshot(
        query(
          collection(fdb, 'compras'),
          where('status', '==', 'aberta'),
          where('ativo', '==', ativo.codigo)
        ),
        (coll) => {
          while (this.ordensDeCompra[ativo.codigo].length > 0)
            this.ordensDeCompra[ativo.codigo].pop();
          coll.forEach((doc) => {
            this.ordensDeCompra[doc.get('ativo')].push({
              ativo: doc.get('ativo'),
              corretagem: doc.get('corretagem'),
              data: doc.get('data'),
              key: doc.get('key'),
              preco: doc.get('preco'),
              quantidade: doc.get('quantidade'),
              user: doc.get('user'),
              qtdeExecutada: doc.get('qtdeExecutada'),
              status: doc.get('status'),
            });
          });
          this.ordensDeCompra[ativo.codigo].sort((a, b) => {
            if (a.preco != b.preco) {
              if (1 * a.preco < 1 * b.preco) return 1;
              if (1 * a.preco > 1 * b.preco) return -1;
            } else {
              if (a.data > b.data) return 1;
              if (a.data < b.data) return -1;
            }
            return 0;
          });
        }
      );
      onSnapshot(
        query(
          collection(fdb, 'vendas'),
          where('status', '==', 'aberta'),
          where('ativo', '==', ativo.codigo)
        ),
        (coll) => {
          while (this.ordensDeVenda[ativo.codigo].length > 0)
            this.ordensDeVenda[ativo.codigo].pop();
          coll.forEach((doc) => {
            this.ordensDeVenda[doc.get('ativo')].push({
              ativo: doc.get('ativo'),
              corretagem: doc.get('corretagem'),
              data: doc.get('data'),
              key: doc.get('key'),
              keyAcao: doc.get('keyAcao'),
              lote: doc.get('lote'),
              preco: doc.get('preco'),
              quantidade: doc.get('quantidade'),
              user: doc.get('user'),
              qtdeExecutada: doc.get('qtdeExecutada'),
              status: doc.get('status'),
            });
          });
          this.ordensDeVenda[ativo.codigo].sort((a, b) => {
            if (a.preco != b.preco) {
              if (1 * a.preco < 1 * b.preco) return -1;
              if (1 * a.preco > 1 * b.preco) return 1;
            } else {
              if (a.data > b.data) return 1;
              if (a.data < b.data) return -1;
            }
            return 0;
          });
        }
      );
    });
  }
}

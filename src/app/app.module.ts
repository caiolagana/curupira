import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookComponent } from './book/book.component';
import { CarteiraComponent } from './carteira/carteira.component';
import { CompravendeComponent } from './compravende/compravende.component';
import { GraficoComponent } from './grafico/grafico.component';
import { LoteComponent } from './lote/lote.component';
import { MapComponent } from './map/map.component';
import { OrdensComponent } from './ordens/ordens.component';
import { PainelComponent } from './painel/painel.component';
import { UserComponent } from './user/user.component';

@NgModule({
  declarations: [
    AppComponent,
    BookComponent,
    CarteiraComponent,
    CompravendeComponent,
    GraficoComponent,
    LoteComponent,
    MapComponent,
    OrdensComponent,
    PainelComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

// GIT PAT
// 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
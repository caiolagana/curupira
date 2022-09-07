import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PainelComponent } from './painel/painel.component';
import { BookComponent } from './book/book.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CarteiraComponent } from './carteira/carteira.component';
import { LoteComponent } from './lote/lote.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { GraficoComponent } from './grafico/grafico.component';
import { CompravendeComponent } from './compravende/compravende.component';
import { OrdensComponent } from './ordens/ordens.component';
import { MatTabsModule } from '@angular/material/tabs';
import { UserComponent } from './user/user.component';
import { MapComponent } from './map/map.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [
    AppComponent,
    PainelComponent,
    BookComponent,
    CarteiraComponent,
    LoteComponent,
    GraficoComponent,
    CompravendeComponent,
    OrdensComponent,
    UserComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

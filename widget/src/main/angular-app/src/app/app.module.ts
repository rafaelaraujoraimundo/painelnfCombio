import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { PoModule, PoTableModule } from '@po-ui/ng-components';
import { HttpClientModule } from '@angular/common/http';
import { FluigService } from './services/fluig.service';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    PoModule,
    HttpClientModule,
    PoTableModule,
    ReactiveFormsModule
  ],
  providers: [FluigService],
  bootstrap: [AppComponent]
})
export class AppModule { }

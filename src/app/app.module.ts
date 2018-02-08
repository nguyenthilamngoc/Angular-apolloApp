import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';

import {GraphQLModule} from './apollo.config';
import { LinkItemComponent } from './link-item/link-item.component';
import { LinkListComponent } from './link-list/link-list.component';
import { CreateLinkComponent } from './create-link/create-link.component';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import {AppRoutingModule} from './app.routing';
import { LoginComponent } from './login/login.component';
import {AuthService} from './auth.service';
import { SearchComponent } from './search/search.component';
@NgModule({
  // here
  declarations: [
    AppComponent,
    LinkItemComponent,
    LinkListComponent,
    CreateLinkComponent,
    HeaderComponent,
    LoginComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    GraphQLModule,
    FormsModule, 
    AppRoutingModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
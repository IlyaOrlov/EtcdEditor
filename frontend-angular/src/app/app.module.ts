import { NgModule } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgJsonEditorModule } from 'ang-jsoneditor';

import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { AppApiService } from './app.service.api';
import { EditorComponent } from './components/editor/editor.component';
import { NodesTreeComponent } from './components/nodes-tree/nodes-tree.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MAT_RIPPLE_GLOBAL_OPTIONS} from "@angular/material/core";

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    NodesTreeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgJsonEditorModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  providers: [
    HttpClient,
    AppService,
    AppApiService,
    {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: {disabled: true}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

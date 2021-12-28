import {Component, Input, OnChanges, OnDestroy} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { ConfigNode } from 'src/app/app.types';
import {AppService} from "../../app.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnChanges, OnDestroy {
  @Input() node: ConfigNode

  destroy: Subject<unknown> = new Subject<unknown>();
  editorOptions: JsonEditorOptions;
  data: Object = {};
  form: FormGroup = new FormGroup({configNode: new FormControl(null)});

  constructor(private appService: AppService) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.modes = ['code', 'text', 'tree', 'view'];
  }

  ngOnChanges(): void {
    if (this.node) {
      this.data = JSON.parse(this.node?.value);
    }
  }

  canSave(): boolean {
    return this.node && this.form.dirty;
  }

  submit(): void {
    if (this.canSave()) {
      this.appService.saveNode(this.node.key, this.form.controls.configNode.value)
        .pipe(takeUntil(this.destroy))
        .subscribe();
    }
  }

  cancel(): void {
    this.data = this.node?.value;
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.complete();
  }

}

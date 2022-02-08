import React, { FC } from 'react';
import styled from 'styled-components'
import { ConfigNode } from '../../types';
// @ts-ignore
import { JsonEditor } from 'jsoneditor-react'

type EditorProps = {
  selected: any,
  nodes: ConfigNode[],
  updateData: any,
}

const editorOptions = {
  modes: ['code', 'text', 'tree', 'view']
}

export const Editor: FC<EditorProps> = ({ selected, nodes, updateData }) => {

  const [data, setData] = React.useState<string>('')
  const [canSave, setCanSave] = React.useState<boolean>(false)
  const jsonEditorRef = React.useRef<any>(null)

  React.useEffect(() => {
    setData(JSON.parse(nodes?.[selected]?.value || '{}'));
  }, [nodes])
  React.useEffect(() => {
    jsonEditorRef?.current?.set(JSON.parse(nodes?.[selected]?.value || '{}'));
  }, [selected])

  const setRef = (instance: any) => {
    if (instance) {
      jsonEditorRef.current = instance.jsonEditor;
    } else {
      jsonEditorRef.current = null;
    }
  };

  const saveConfig = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    updateData(JSON.stringify(data))
  }
  const cancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (jsonEditorRef.current !== null) {
      jsonEditorRef?.current?.set(JSON.parse(nodes?.[selected]?.value));
    }
  }

  const handleChange = (data: any) => {
    if (!canSave) {
      setCanSave(true)
    }
    setData(data)
  }

  return (
    <Form
      className="editor-form"
    >
      {
        data && (
          <JsonEditor
            ref={setRef}
            onChange={handleChange}
            value={data}
            schema={editorOptions}
          />
        )
      }
      <ActionContainer className="action-container">
        <button
          className={`button --warn ${!canSave ? "disabled" : ""}`}
          onClick={cancel}
        >
          Cancel
        </button>
        <button
          className={`button --primary ${!canSave ? "disabled" : ""}`}
          onClick={saveConfig}
        >
          Save config
        </button>
      </ActionContainer>
    </Form>
  );
};

const Form = styled.form`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  & > div:first-child {
    height: 100%;
    z-index: 1;
  }
`
const ActionContainer = styled.div`
  position: absolute;
  z-index: 2;
  display: flex;
  bottom: 46px;
  right: 20px;
  .button + .button {
    margin-left: 10px;
  }
`



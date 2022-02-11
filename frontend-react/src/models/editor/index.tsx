import React, { FC } from 'react';
import styled from 'styled-components'
import { ConfigNode } from '../../types';

// @ts-ignore
import JSONEditor from 'jsoneditor';

type EditorProps = {
  index: number,
  node: ConfigNode,
  updateData: any,
}

export const Editor: FC<EditorProps> = ({ index, node, updateData }) => {
  const modes = ['code', 'text', 'tree', 'view'];

  const [mode, setMode] = React.useState<Object | string>("tree")
  const [data, setData] = React.useState<Object | string>({})
  const [canSave, setCanSave] = React.useState<boolean>(false)
  const elRef = React.useRef<HTMLDivElement | null>(null);
  const editorRef = React.useRef<JSONEditor | null>(null);

  const unmountEditor = () => {
    editorRef.current?.destroy();
  }

  React.useEffect(() => {
    const container = elRef.current;
    const options = {
      mode: mode,
      modes: modes,
      onModeChange: handleModeChange,
      onChange: handleChange,
    };

    if (container) {
      const jsonEditor = new JSONEditor(container, options);
      jsonEditor.set(node?.value);
      editorRef.current = jsonEditor;
    }

    return unmountEditor;
  }, [node]);

  const saveConfig = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    updateData(index, data)
  }
  const cancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (editorRef.current !== null) {
      editorRef?.current?.set(node?.value || {});
    }
  }
  const handleModeChange = (prevMode: string, nextMode: string) => {
    setMode(nextMode)
  }
  const handleChange = () => {
    const data = editorRef.current.get()
    if (!canSave) {
      setCanSave(true)
    }
    if (!data) {
      setData('null')
    } else {
      setData(data)
    }
  }

  return (
    <Form
      className="editor-form"
    >
      {
        data && (
          <>
            <EditorTitle>
              {node?.key}
            </EditorTitle>
            <EditorContainer
              id={`jsoneditor_${index}`}
              ref={elRef}
              className="jsoneditor-react-container"
            />
          </>
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
  )
};

const Form = styled.form`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #fff;
  & > div:first-child {
    height: 100%;
    z-index: 1;
  }
`
const EditorTitle = styled.h3`
  height: 43px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  color: #ffffffbf;
  background-color: #3883fa;
`
const EditorContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  & > .jsoneditor {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-bottom: 126px;
  }
  & > .jsoneditor > .jsoneditor-outer {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    textarea,
    .ace-jsoneditor {
      flex-grow: 1;
    }
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



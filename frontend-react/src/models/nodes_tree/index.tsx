import React, { FC } from 'react';
import { ConfigNode } from '../../types';
import styled from 'styled-components';

type NodesTreeProps = {
  selected: any,
  updateSelected: any,
  nodes: ConfigNode[],
  updateNodes: any
}

export const NodesTree: FC<NodesTreeProps> = ({ selected, updateSelected, nodes, updateNodes }) => {

  const [isFormOpened, setIsFormOpened] = React.useState<boolean>(false);
  const [nodeName, setNodeName] = React.useState<string>('');

  const openForm = () => {
    setIsFormOpened(true)
  }

  const addNewNode = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    updateNodes([
      ...nodes,
      {
        createdIndex: nodes.length,
        key: nodeName,
        modifiedIndex: nodes.length,
        value: {},
      }
    ])
    setNodeName('')
    setIsFormOpened(false)
  }
  const cancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    setNodeName('')
    setIsFormOpened(false)
  }

  const onInputHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value)
  }

  const selectNode = (index: number)=> {
    updateSelected(index)
  }

  return (
    <>
      {
        nodes?.length > 0 && (
          <Nodes>
            {
              nodes?.map((node, i) => (
                <NodesItem
                  className="button"
                  key={node.key}
                  active={selected.has(i)}
                  onClick={() => selectNode(i)}
                >
                  {node.key}
                </NodesItem>
              ))
            }
          </Nodes>
        )
      }

      <AddForm>
        {
          !isFormOpened && (
            <button className="button" onClick={openForm}>
              Add item
            </button>
          )
        }
        {
          isFormOpened && (
            <form>
              <div className="input-box">
                <input
                  className="input-box__input"
                  onChange={onInputHandle}
                  id="node_name"
                  name="node_name"
                  value={nodeName}
                  placeholder=" "
                  autoComplete="off"
                />
                <label className="input-box__label">Key name</label>
              </div>
              <AddFormActions>
                <button
                  onClick={addNewNode}
                  className={`button save-button --primary ${nodeName.length < 2 ? "disabled" : "" }`}
                >
                  Save
                </button>
                <button onClick={cancel} className="button cancel-button --warn">
                  Cancel
                </button>
              </AddFormActions >
            </form >
          )
        }
      </AddForm >

    </>
  );
};

interface Props {
  key: string,
  active: boolean,
  onClick: any
}

const Nodes = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`
const NodesItem = styled.button<Props>`
  margin-bottom: 10px;
  background-color: ${props => props.active ? "#3883FA" : "#fff"};
  color: ${props => props.active ? "#fff" : "#000"};
  &:hover {
    background-color: ${props => props.active ? "#0f66f1" : "rgba(#000, 0.15)"};
  }
`
const AddForm = styled.div`
  margin-top: 15px;
`
const AddFormActions = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  .button + button {
    margin-left: 10px;
  }
`

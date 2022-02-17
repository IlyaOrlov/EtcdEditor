import React, { FC } from 'react';
import { ConfigNode } from '../../types';
import styled from 'styled-components';
import { Modal } from '../modal';
import { motion } from 'framer-motion'

type NodesTreeProps = {
  selected: any,
  updateSelected: any,
  nodes: ConfigNode[],
  updateNodes: any,
  reset: any,
  remove: any,
}

export const NodesTree: FC<NodesTreeProps> = ({ selected, updateSelected, nodes, updateNodes, reset, remove }) => {

  const [modal, setModal] = React.useState(false)
  const [deletebleIndex, setDeletebleIndex] = React.useState<number>(0)
  const [deletebleKey, setDeletebleKey] = React.useState<string>('')
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

  const selectNode = (key: string) => {
    updateSelected(key)
  }

  const removeHandle = (key: string, index: number) => {
    setDeletebleKey(key)
    setDeletebleIndex(index)
    setModal(true)
  }

  const deleteNodeHandle = () => {
    remove(deletebleKey, deletebleIndex)
    setModal(false)
  }

  return (
    <>
      <NodesWrapper>
        {
          selected.size > 1 && (
            <ResetBtn
              className="button"
              onClick={reset}
            >
              Reset Filters
            </ResetBtn>
          )
        }
        {
          nodes?.length > 0 && (
            <Nodes>
              {
                nodes?.map((node, i) => (
                  <NodesItemWrap
                    key={node.key}
                  >
                    <NodesItem
                      className="button"
                      active={selected.has(node.key)}
                      onClick={() => selectNode(node.key)}
                    >
                      {node.key}
                    </NodesItem>
                    <NodesItemBtn
                      onClick={() => removeHandle(node.key, i)}
                    />
                  </NodesItemWrap>
                ))
              }
            </Nodes>
          )
        }
      </NodesWrapper>

      <AddForm>
        {
          !isFormOpened && (
            <motion.button
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: '-10%' }}
              transition={{ duration: 0.15 }}
              className="button button-plus"
              onClick={openForm}
            >
              <span className="button-icon" />
              <span className="button-text">Add item</span>
            </motion.button>
          )
        }
        {
          isFormOpened && (
            <motion.form
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: '-10%' }}
            >
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
                  className={`button save-button --primary ${nodeName.length < 2 ? "disabled" : ""}`}
                >
                  <span className="button-text">Save</span>
                </button>
                <button onClick={cancel} className="button cancel-button --warn">
                  <span className="button-text">Cancel</span>
                </button>
              </AddFormActions >
            </motion.form >
          )
        }
      </AddForm >
      <Modal
        isShown={modal}
        keyName={deletebleKey}
        titleText="Delete host"
        hideModal={() => setModal(false)}
      >
        <ModalText>
          Are you sure to delete {deletebleKey}
        </ModalText>

        <div className="pp__content-btns">
          <button
            onClick={deleteNodeHandle}
            type="button"
            className="button --warn"
          >
            Delete
          </button>
          <button
            onClick={() => setModal(false)}
            type="button"
            className="button --primary"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
};

interface Props {
  active: boolean,
  onClick: any
}

const NodesWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`
const Nodes = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
`
const ResetBtn = styled.button`
  padding: 5px 10px;
  min-width: initial;
  position: absolute;
  right: 0;
  top: 0;
  color: grey;
  border: none;
  background: none;
  &.button:hover {
    background: none;
    color: #4c4b4b;
  }
`
const NodesItemWrap = styled.div`
  position: relative;
  width: 100%;
  padding-right: 25px;
  margin-bottom: 10px;
`
const NodesItem = styled.button<Props>`
  width: 100%;
  background-color: ${props => props.active ? "#3883FA" : "#fff"};
  color: ${props => props.active ? "#fff" : "#000"};
  &:hover {
    background-color: ${props => props.active ? "#0f66f1" : "rgba(#000, 0.15)"};
  }
`
const NodesItemBtn = styled.span`
  width: 18px;
  height: 18px;
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  transition: .3s;
  cursor:  pointer;
  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%) rotate(-45deg);
    width: 100%;
    height: 2px;
    background-color: lightgrey;
    transition: .3s;
  }
  &::after {
    transform: translate(-50%,-50%) rotate(45deg);
  }
  &:hover {
    transform: translateY(-50%) scale(1.2);
  }
  &:hover::before,
  &:hover::after {
    background-color: #9b9797;
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
const ModalText = styled.div`
  margin-bottom: 35px;
  text-align: center;
`

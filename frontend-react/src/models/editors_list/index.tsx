import React, { FC } from 'react';
import styled from 'styled-components';
import { ConfigNode } from '../../types';
import { Editor } from '../editor';

type EditorListProps = {
  selected: Set<number>,
  nodes: ConfigNode[],
  updateData: any,
}

export const EditorsList: FC<EditorListProps> = ({ selected, nodes, updateData }) => {
  const arr = [...selected]
  return (
    <List
      length={arr.length}
    >
      {
        arr.length > 0 && arr?.map(index => (
          <Editor
            key={nodes[index].key}
            index={index}
            node={nodes[index]}
            updateData={updateData}
          />
        ))
      }
    </List>
  )
};


interface Props {
  length: number,
}

const List = styled.div<Props>`
  height: 100%;
  display: ${(props) => props.length > 1 ? 'grid' : 'block'};
  grid-template-columns: 1fr 1fr;
  & > form {
    width: 100%;
  }
`

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

  React.useEffect(() => {

    function watchscroll() {

    }
    // setTimeout(() => {

    // }, 3000)
    // const editorTrees = document.getElementsByClassName('jsoneditor-tree');

    // console.log(editorTrees)

    // .addEventListener('scroll', function(e: any) {
    //   console.log(e?.target?.scrollTop);
    //   const top = e?.target?.scrollTop;
    // })

    return () => {

    }
  }, [])

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
  grid-template-rows: ${(props) => props.length > 2 ? 'minmax(50vh, 50vh)' : '1fr'} ;
`

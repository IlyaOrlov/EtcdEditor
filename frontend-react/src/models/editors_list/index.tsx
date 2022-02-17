import React, { FC } from 'react';
import styled from 'styled-components';
import { ConfigNode } from '../../types';
import { Editor } from '../editor';

type EditorListProps = {
  selected: Set<string>,
  nodes: ConfigNode[],
  updateData: any,
}

export const EditorsList: FC<EditorListProps> = ({ selected, nodes, updateData }) => {
  const arr = nodes.filter(node => selected.has(node.key))

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
        arr.length > 0 && arr?.map((node, index) => (
          <Editor
            key={node?.key}
            index={nodes.findIndex(item => item.key === node?.key)}
            node={node}
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
  display: flex;
  align-items: flex-start;
  flex-wrap: nowrap;
`

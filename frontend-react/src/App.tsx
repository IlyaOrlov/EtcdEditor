import React from 'react';
import styled from 'styled-components';

import './models/init'

import { NodesTree } from '../src/models/nodes_tree'
import { Editor } from '../src/models/editor'
import { ConfigNode } from './types';

const mock: ConfigNode[] = [
  {
    createdIndex: 0,
    key: "/test",
    modifiedIndex: 0,
    value: "{\"test_1\":1111,\"test_obj\":{\"key_1\":[\"apples\",\"bananas\",\"grapes\"]}}",
  },
  {
    createdIndex: 1,
    key: "/test_2",
    modifiedIndex: 1,
    value: "{\"test_2\":2222,\"test_array\":[\"apples\",\"bananas\",\"grapes\"]}",
  },
  {
    createdIndex: 2,
    key: "/test_3",
    modifiedIndex: 2,
    value: "{\"test_3\":3333}",
  },
]

export function App() {
  const [nodes, setNodes] = React.useState<ConfigNode[]>([]);
  const [selectedNode, setSelectedNode] = React.useState(0);

  React.useEffect(() => {
    setNodes(mock)
  }, [])

  const updateNodes = (newNodes: ConfigNode[]) => {
    setNodes(newNodes)
  }

  const updateSelected = (index: number) => {
    setSelectedNode(index)
  }

  const updateData = (value: string) => {
    const newNodes = [...nodes];
    newNodes[selectedNode].value = value;
    setNodes(newNodes)
  }

  return (
    <Container>
      <Sidebar>
        <SidebarHeader>Config Editor</SidebarHeader>
        <SidebarContent>
          <NodesTree
            selected={selectedNode}
            updateSelected={updateSelected}
            nodes={nodes}
            updateNodes={updateNodes}
          />
        </SidebarContent>
      </Sidebar>
      <Main>
        {
          nodes?.length > 0 && (
            <Editor
              selected={selectedNode}
              nodes={nodes}
              updateData={updateData}
            />
          )
        }
      </Main>
    </Container >
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-areas: "sidebar main";
  grid-template-columns: 300px auto;
`
const Sidebar = styled.div`
  grid-area: sidebar;
  background-color: #fff;
  border: 1px solid #3883fa;
  border-right-width: 0px;
`
const SidebarHeader = styled.div`
  padding: 0 10px;
  height: 35px;
  display: flex;
  align-items: center;
  background-color: #3883fa;
  font-size: 14px;
  color: #ffffffbf;
`
const SidebarContent = styled.div`
  padding: 10px;
`
const Main = styled.main`
  grid-area: main;
  height: 100%;
  background-color: gray;
`

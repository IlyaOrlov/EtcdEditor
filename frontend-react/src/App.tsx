import React from 'react';
import styled from 'styled-components';

import './models/init'

import { NodesTree } from '../src/models/nodes_tree'
import { Editor } from '../src/models/editor'
import { ConfigNode } from './types';
import { getNodes, saveNode } from './services/API';
import { EditorsList } from './models/editors_list';

export function App() {
  const [nodes, setNodes] = React.useState<ConfigNode[]>([]);
  const [selectedNodes, setSelectedNodes] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    fetchNodes()
  }, [])

  async function fetchNodes() {
    const { response } = await getNodes()
    const result = response.node.nodes.map((node: ConfigNode) => ({ ...node, value: JSON.parse(node.value) }));
    setNodes(result)
  }

  const updateNodes = (newNodes: ConfigNode[]) => {
    setNodes(newNodes)
  }

  const updateSelected = (index: number) => {
    const newSelectedNodes = new Set(selectedNodes)
    if(newSelectedNodes.has(index)) {
      newSelectedNodes.delete(index)
    } else {
      if(newSelectedNodes.size < 4) {
        newSelectedNodes.add(index)
      }
    }
    setSelectedNodes(newSelectedNodes)
  }

  const updateData = async (index: number, value: any) => {
    const newNodes = [...nodes];
    newNodes[index].value = value;
    const res = await saveNode(newNodes[index].key, newNodes[index])
    setNodes(newNodes)
  }

  return (
    <Container>
      <Sidebar>
        <SidebarHeader>Config Editor</SidebarHeader>
        <SidebarContent>
          <NodesTree
            selected={selectedNodes}
            updateSelected={updateSelected}
            nodes={nodes}
            updateNodes={updateNodes}
          />
        </SidebarContent>
      </Sidebar>
      <Main>
        <EditorsList
          selected={selectedNodes}
          nodes={nodes}
          updateData={updateData}
        />
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

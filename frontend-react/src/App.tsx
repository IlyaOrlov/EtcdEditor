import React from 'react';
import styled from 'styled-components';

import { NodesTree } from '../src/models/nodes_tree'
import { ConfigNode } from './types';
import { deleteNode, getNodes, saveNode } from './services/API';
import { EditorsList } from './models/editors_list';
import { Loader } from './models/loader';

export function App() {
  const [load, setLoad] = React.useState(false)
  const [nodes, setNodes] = React.useState<ConfigNode[]>([]);
  const [selectedNodes, setSelectedNodes] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    fetchNodes()
  }, [])

  async function fetchNodes() {
    try {
      setLoad(true)
      const { response } = await getNodes()
      const result = response?.node?.nodes?.map((node: ConfigNode) => ({ ...node, value: JSON.parse(node?.value) }));
      setNodes(result)
    } catch (error: any) {
      console.log(error?.message)
    } finally {
      setLoad(false)
    }
  }

  const updateNodes = (newNodes: ConfigNode[]) => {
    setNodes(newNodes)
  }

  const updateSelected = (key: string) => {
    const newSelectedNodes = new Set(selectedNodes)
    if (newSelectedNodes.has(key)) {
      newSelectedNodes.delete(key)
    } else {
      if (newSelectedNodes.size < 4) {
        newSelectedNodes.add(key)
      }
    }
    setSelectedNodes(newSelectedNodes)
  }

  const updateData = async (index: number, value: any) => {
    const { notifyMain, notifyError } = await import('./services/Pnotify.js')
    setLoad(true)
    const newNodes = [...nodes];
    newNodes[index].value = value;
    try {
      const res = await saveNode(newNodes?.[index]?.key, newNodes?.[index])
      setNodes(newNodes);
      notifyMain('successfully updated')
    } catch (error: any) {
      console.log(error?.messagge)
      notifyError('updating error')
    } finally {
      setLoad(false)
    }
  }

  const resetHandle = () => {
    setSelectedNodes(new Set())
  }
  const removeHandle = async (key: string) => {
    const { notifyMain, notifyError } = await import('./services/Pnotify.js')
    try {
      setLoad(true)
      const res = await deleteNode(key);
      const newNodes = nodes?.filter(node => node?.key !== key)
      setNodes(newNodes)
      notifyMain('successfully deleted')
      if (selectedNodes.has(key)) {
        const newSelected = new Set([...selectedNodes]);
        newSelected.delete(key);
        setSelectedNodes(newSelected)
      }
    } catch (error: any) {
      console.log(error?.message)
      notifyError('deletion error')
    } finally {
      setLoad(false)
    }
  }

  return (
    <>
      <Container>
        <Sidebar>
          <SidebarHeader>Config Editor</SidebarHeader>
          <SidebarContent>
            <NodesTree
              selected={selectedNodes}
              updateSelected={updateSelected}
              nodes={nodes}
              updateNodes={updateNodes}
              reset={resetHandle}
              remove={removeHandle}
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
      {
        load && (
          <Loader />
        )
      }
    </>
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
const SidebarHeader = styled.h3`
  padding: 10px;
  height: 78px;
  display: flex;
  align-items: center;
  background-color: #3883fa;
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

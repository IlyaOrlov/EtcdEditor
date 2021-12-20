export type ConfigNode = {
  createdIndex: number;
  key: string;
  modifiedIndex: number;
  value: string;
  nodes: ConfigNode[];
}

export type ConfigResponse = {
  action: string;
  node: ConfigNode;
}

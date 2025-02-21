export class Graph {
  public id: number
  public name: string

  public nodes: Set<number>
  public edges: Map<number, Set<number>>

  public constructor(
    id: number,
    name: string = '',
    nodes: Set<number> = new Set(),
    edges: Map<number, Set<number>> = new Map(),
  ) {
    this.id = id
    this.name = name == '' ? `Graph ${id}` : name
    this.nodes = nodes
    this.edges = edges
  }

  public addNode(id: number) {
    this.nodes.add(id)

    if (!this.edges.has(id)) this.edges.set(id, new Set())
  }

  public addEdge(a: number, b: number) {
    this.addNode(a)
    this.addNode(b)

    this.edges.get(a)!.add(b)
    this.edges.get(b)!.add(a)
  }

  public removeNode(nodeId: number) {
    this.nodes.delete(nodeId)
    this.edges.delete(nodeId)

    this.edges.forEach((edge) => edge.delete(nodeId))
  }

  public removeEdge(a: number, b: number) {
    this.edges.get(a)!.delete(b)
    this.edges.get(b)!.delete(a)

    if (this.edges.get(a)!.size === 0) this.edges.delete(a)
    if (this.edges.get(b)!.size === 0) this.edges.delete(b)
  }

  public serialize() {
    return {
      nodes: Array.from(this.nodes),
      edges: Array.from(this.edges).map((value) => [
        value[0],
        Array.from(value[1]),
      ]),
      id: this.id,
      name: this.name,
    }
  }
}

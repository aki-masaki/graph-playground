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
}

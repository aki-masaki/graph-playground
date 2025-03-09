export enum GraphType {
  Undirected,
  Directed,
}

export class Graph {
  public id: number
  public name: string

  public nodes: Set<number>
  public edges: Map<number, Set<number>>

  public edgeCount: number = 0

  public type: GraphType = GraphType.Directed

  public constructor(
    id: number,
    name: string = '',
    nodes: Set<number> = new Set(),
    edges: Map<number, Set<number>> = new Map(),
    type: GraphType = GraphType.Undirected,
  ) {
    this.id = id
    this.name = name == '' ? `Graph ${id}` : name
    this.nodes = nodes
    this.edges = edges

    this.edges.forEach((edge) => {
      this.edgeCount += edge.size
    })
  }

  public addNode(id: number) {
    this.nodes.add(id)

    if (!this.edges.has(id)) this.edges.set(id, new Set())
  }

  public addEdge(a: number, b: number) {
    this.addNode(a)
    this.addNode(b)

    this.edges.get(a)!.add(b)

    if (this.type === GraphType.Undirected) this.edges.get(b)!.add(a)

    this.edgeCount++
  }

  public removeNode(nodeId: number) {
    this.nodes.delete(nodeId)
    this.edges.delete(nodeId)

    if (this.type === GraphType.Undirected)
      this.edges.forEach((edge) => edge.delete(nodeId))
  }

  public removeEdge(a: number, b: number) {
    this.edges.get(a)!.delete(b)

    if (this.edges.get(a)!.size === 0) this.edges.delete(a)

    if (this.type === GraphType.Undirected) {
      this.edges.get(b)!.delete(a)

      if (this.edges.get(b)?.size === 0) this.edges.delete(b)
    }

    this.edgeCount--
  }

  public generateAdjacencyMatrix(): number[][] {
    const matrix: number[][] = []

    if (this.type === GraphType.Directed) {
      this.nodes.forEach((node) => {
        matrix.push(new Array(this.nodes.size).fill(0))

        this.edges.get(node)?.forEach((neighbour) => {
          matrix[node - 1][neighbour - 1] = 1
        })
      })
    }

    return matrix
  }

  public bfs(start: number): [number[], number[]] {
    const dist = new Array(this.nodes.size).fill(Infinity)
    const par = new Array(this.nodes.size).fill(-1)

    const q = []
    dist[start - 1] = 0;
    q.push(start - 1)

    while (q.length > 0) {
      const node = q.shift()!

      this.edges.get(node + 1)?.forEach(neighbour => {
        const neighbourIndex = neighbour - 1

        if (dist[neighbourIndex] === Infinity) {
          par[neighbourIndex] = node;
          dist[neighbourIndex] = dist[node] + 1;
          q.push(neighbourIndex)
        }
      })
    }

    return [dist, par]
  }

  public reconstructPath(end: number, parents: number[]) {
    const path = []
    let node = end - 1

    while (node !== -1) {
      path.push(node + 1)
      node = parents[node]
    }

    return path.reverse()
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
      type: this.type,
    }
  }
}

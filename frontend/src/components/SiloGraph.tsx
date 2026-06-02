import { useState } from 'react'
import type { DagNode, DagEdge } from '../data/accounts'

const NODE_W = 110
const NODE_H = 44

const TYPE_STYLES: Record<DagNode['type'], { fill: string; stroke: string; text: string }> = {
  blocker:    { fill: '#2d0f0f', stroke: '#ef4444', text: '#fca5a5' },
  risk:       { fill: '#2d1f0a', stroke: '#f59e0b', text: '#fcd34d' },
  dependency: { fill: '#0f1630', stroke: '#6366f1', text: '#a5b4fc' },
  outcome:    { fill: '#0a2010', stroke: '#22c55e', text: '#86efac' },
}

function wrap(text: string) {
  return text.split('\n')
}

interface Props {
  nodes: DagNode[]
  edges: DagEdge[]
}

export function SiloGraph({ nodes, edges }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  const isHighlighted = (id: string) => {
    if (!hovered) return true
    if (hovered === id) return true
    return edges.some(e => (e.from === hovered && e.to === id) || (e.to === hovered && e.from === id))
  }

  const isEdgeHighlighted = (e: DagEdge) => {
    if (!hovered) return true
    return e.from === hovered || e.to === hovered
  }

  // SVG canvas sizing
  const maxX = Math.max(...nodes.map(n => n.x)) + NODE_W + 30
  const maxY = Math.max(...nodes.map(n => n.y)) + NODE_H + 30

  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${maxX} ${maxY}`} style={{ minWidth: maxX }}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#4b5563" />
          </marker>
          <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodeMap[edge.from]
          const to = nodeMap[edge.to]
          if (!from || !to) return null

          const x1 = from.x + NODE_W
          const y1 = from.y + NODE_H / 2
          const x2 = to.x
          const y2 = to.y + NODE_H / 2
          const mx = (x1 + x2) / 2
          const active = isEdgeHighlighted(edge)

          return (
            <g key={i} opacity={active ? 1 : 0.2} style={{ transition: 'opacity 0.2s' }}>
              <path
                d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={active ? '#6366f1' : '#2d3148'}
                strokeWidth={active ? 1.5 : 1}
                markerEnd={active ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
              />
              {edge.label && (
                <text
                  x={mx}
                  y={(y1 + y2) / 2 - 4}
                  textAnchor="middle"
                  fill={active ? '#6b7280' : '#374151'}
                  fontSize={9}
                  style={{ transition: 'fill 0.2s' }}
                >
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const s = TYPE_STYLES[node.type]
          const active = isHighlighted(node.id)
          const lines = wrap(node.label)

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              opacity={active ? 1 : 0.25}
              style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={6}
                fill={s.fill}
                stroke={hovered === node.id ? '#fff' : s.stroke}
                strokeWidth={hovered === node.id ? 1.5 : 1}
              />
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={NODE_W / 2}
                  y={lines.length === 1 ? NODE_H / 2 + 4 : li === 0 ? 16 : 30}
                  textAnchor="middle"
                  fill={s.text}
                  fontSize={9}
                  fontWeight={600}
                >
                  {line}
                </text>
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

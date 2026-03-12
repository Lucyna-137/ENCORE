import React from 'react'

interface RankNode {
  num: number
  name: string
  emoji?: string
  active?: boolean
}

interface RankProgressProps {
  currentRank?: string
  nextTarget?: string
  nodes: RankNode[]
}

export default function RankProgress({ nodes }: RankProgressProps) {
  return (
    <div>
      <div className="flex items-center" style={{ padding: 20 }}>
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center" style={{ gap: 6, minWidth: 60 }}>
              <div
                className="flex items-center justify-center relative"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: node.active ? '#1B3C2D' : '#E8E5DF',
                  border: `2px solid ${node.active ? '#1B3C2D' : '#D8D4CD'}`,
                  fontSize: node.active ? 16 : 13,
                  transition: 'background 0.3s, border-color 0.3s',
                  color: node.active ? '#fff' : '#AEAAA3',
                }}
              >
                {node.active ? (node.emoji ?? node.num) : '?'}
              </div>
              <span
                style={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#AEAAA3',
                  textAlign: 'center',
                }}
              >
                {node.num}
              </span>
              <span
                style={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  color: node.active ? '#1B3C2D' : '#AEAAA3',
                  textAlign: 'center',
                }}
              >
                {node.name}
              </span>
            </div>
            {i < nodes.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: node.active ? '#1B3C2D' : '#D8D4CD',
                  minWidth: 16,
                  marginBottom: 44,
                  transition: 'background 0.3s',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

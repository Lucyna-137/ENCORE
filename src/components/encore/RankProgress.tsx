import React from 'react'
import * as ty from './typographyStyles'

interface RankNode {
  num: number
  name: string
  emoji?: string
  active?: boolean
}

interface RankProgressProps {
  nodes: RankNode[]
}

export default function RankProgress({ nodes }: RankProgressProps) {
  return (
    <div>
      <div className="flex items-start" style={{ padding: 20 }}>
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center" style={{ gap: 6, width: 64, flexShrink: 0 }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: node.active ? 'var(--color-encore-green)' : 'var(--color-encore-bg-section)',
                  border: `2px solid ${node.active ? 'var(--color-encore-green)' : 'var(--color-encore-border)'}`,
                  fontSize: node.active ? 16 : 13,
                  transition: 'background 0.3s, border-color 0.3s',
                  color: node.active ? 'var(--color-encore-white)' : 'var(--color-encore-text-muted)',
                  flexShrink: 0,
                }}
              >
                {node.active ? (node.emoji ?? node.num) : '?'}
              </div>
              <span
                style={{
                  ...ty.captionMuted,
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                {node.num}
              </span>
              <span
                style={{
                  ...ty.captionMuted,
                  color: node.active ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
                  textAlign: 'center',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
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
                  background: node.active ? 'var(--color-encore-green)' : 'var(--color-encore-border)',
                  marginTop: 21,
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

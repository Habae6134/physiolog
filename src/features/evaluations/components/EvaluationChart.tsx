'use client'

import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getMovementById } from '@/data/joints'
import { SIDE_LABEL } from '@/data/body-parts'
import { formatDateShort } from '@/lib/utils/date'
import type { Evaluation } from '@/features/evaluations/domain/types'
import type { GraphMetric } from '@/features/evaluations/domain/types'
import { parseRomNum } from '@/features/evaluations/lib/graph-options'

type Props = {
  evaluations: Evaluation[]
  metric: GraphMetric
}

type ChartPoint = {
  date: string
  label: string
  value: number | null
}

const COLOR = '#5C6BC0'

export function EvaluationChart({ evaluations, metric }: Props) {
  const { title, points, domain } = useMemo(() => {
    return buildChart(evaluations, metric)
  }, [evaluations, metric])

  if (points.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-slate-500">{title} — 데이터가 없습니다.</p>
        <p className="text-xs opacity-70">
          검사 입력 시 해당 항목을 기록하면 시간에 따른 점수 변화를 이곳에서 확인할 수 있습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <span className="text-xs text-muted-foreground">{points.length}회</span>
      </div>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="label" fontSize={11} tick={{ fill: 'currentColor' }} />
            <YAxis
              fontSize={11}
              tick={{ fill: 'currentColor' }}
              domain={domain}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid hsl(var(--border))',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: COLOR }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function buildChart(
  evaluations: Evaluation[],
  metric: GraphMetric,
): { title: string; points: ChartPoint[]; domain: [number | string, number | string] } {
  // 평가는 최신순 정렬되어 들어옴 — 차트는 시간순 정렬
  const sorted = [...evaluations].sort((a, b) => a.date.localeCompare(b.date))

  if (metric.kind === 'vas') {
    const points: ChartPoint[] = sorted.map((e) => ({
      date: e.date,
      label: formatDateShort(e.date),
      value: typeof e.vas === 'number' ? e.vas : null,
    }))
    return {
      title: 'VAS (통증 점수)',
      points: points.filter((p) => p.value !== null),
      domain: [0, 10],
    }
  }

  if (metric.kind === 'rom') {
    const movement = getMovementById(metric.jointId)
    const sideLabel = metric.side ? SIDE_LABEL[metric.side] : ''
    const title = `ROM ${sideLabel ? sideLabel + ' ' : ''}${
      movement?.movement.label ?? metric.jointId
    } (${metric.mode === 'active' ? '능동' : '수동'})`
    const points: ChartPoint[] = sorted.map((e) => {
      const rec = e.rom?.find(
        (r) =>
          r.jointId === metric.jointId &&
          (metric.side ? r.side === metric.side : true),
      )
      const raw = rec ? (metric.mode === 'active' ? rec.active : rec.passive) : undefined
      return {
        date: e.date,
        label: formatDateShort(e.date),
        value: parseRomNum(raw) ?? null,
      }
    })
    return {
      title,
      points: points.filter((p) => p.value !== null),
      domain: ['auto', 'auto'],
    }
  }

  if (metric.kind === 'mmt') {
    const movement = getMovementById(metric.jointId)
    const sideLabel = metric.side ? SIDE_LABEL[metric.side] : ''
    const points: ChartPoint[] = sorted.map((e) => {
      const rec = e.mmt?.find(
        (m) =>
          m.jointId === metric.jointId &&
          (metric.side ? m.side === metric.side : true),
      )
      return {
        date: e.date,
        label: formatDateShort(e.date),
        value: rec ? rec.grade : null,
      }
    })
    return {
      title: `MMT ${sideLabel ? sideLabel + ' ' : ''}${
        movement?.movement.label ?? metric.jointId
      }`,
      points: points.filter((p) => p.value !== null),
      domain: [0, 5],
    }
  }

  if (metric.kind === 'measurement') {
    const points: ChartPoint[] = sorted.map((e) => {
      const rec = e.bodyMeasurement?.find(
        (m) => m.type === metric.type && m.location === metric.location,
      )
      return {
        date: e.date,
        label: formatDateShort(e.date),
        value: rec ? rec.value : null,
      }
    })
    return {
      title: `계측 - ${metric.location}`,
      points: points.filter((p) => p.value !== null),
      domain: ['auto', 'auto'],
    }
  }

  // custom
  const points: ChartPoint[] = sorted.map((e) => {
    const rec = e.custom?.find((c) => c.name === metric.name)
    const num = rec ? Number(rec.value) : NaN
    return {
      date: e.date,
      label: formatDateShort(e.date),
      value: Number.isFinite(num) ? num : null,
    }
  })
  return {
    title: metric.name,
    points: points.filter((p) => p.value !== null),
    domain: ['auto', 'auto'],
  }
}

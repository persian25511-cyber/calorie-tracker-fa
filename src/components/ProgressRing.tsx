import { fa } from '../utils/format'

type Props = {
  consumed: number
  target: number
  size?: number
}

export default function ProgressRing({ consumed, target, size = 168 }: Props) {
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = target > 0 ? Math.min(consumed / target, 1) : 0
  const remaining = Math.max(target - consumed, 0)
  const over = consumed > target

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#26262A" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={over ? '#F472B6' : 'var(--cal)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          style={{ transition: 'stroke-dashoffset .5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-3xl font-extrabold leading-none">{fa(over ? consumed - target : remaining)}</span>
        <span className="mt-1 text-[11px] text-[var(--muted)]">{over ? 'کالری اضافه' : 'کالری باقی مانده'}</span>
        <span className="num mt-1 text-[11px] text-[#C8C8CE]">
          {fa(consumed)} / {fa(target)}
        </span>
      </div>
    </div>
  )
}

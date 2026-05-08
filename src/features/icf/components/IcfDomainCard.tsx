'use client'

import { motion } from 'framer-motion'
import { DOMAIN_META, type IcfDomainKey } from '@/features/icf/domain/types'

interface Props {
  domainKey: IcfDomainKey
  items: string[]
  index: number
}

export function IcfDomainCard({ domainKey, items, index }: Props) {
  const meta = DOMAIN_META[domainKey]
  const isEmpty = items.length === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={`rounded-lg border p-3 ${meta.bg} ${meta.border}`}
    >
      <p className={`mb-2 text-xs font-semibold ${meta.color}`}>{meta.label}</p>

      {isEmpty ? (
        <p className="text-xs text-muted-foreground italic">정보 미확인</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
              <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${meta.color.replace('text-', 'bg-')}`} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

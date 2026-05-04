import type { EntityDocument } from './extractEntities'
import type { TranscriptSegment } from './transcribeAudio'

export function mergeTranscriptSegments(
  prev: TranscriptSegment[],
  incoming: TranscriptSegment[]
): TranscriptSegment[] {
  if (!incoming.length) return prev
  return [...prev, ...incoming].sort((a, b) => a.start - b.start || a.id - b.id)
}

export function mergeEntityDocuments(
  prev: EntityDocument | null,
  incoming: EntityDocument
): EntityDocument {
  if (!prev) {
    return {
      ...incoming,
      source_label: incoming.source_label ?? 'live microphone',
    }
  }
  return {
    schema_version: prev.schema_version,
    extracted_at: incoming.extracted_at,
    backend: prev.backend,
    source_label: prev.source_label ?? incoming.source_label,
    chunks: [...prev.chunks, ...incoming.chunks],
    entities: [...prev.entities, ...incoming.entities],
  }
}

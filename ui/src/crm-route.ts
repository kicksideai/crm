// Marks a segment the CRM minted itself, whose body is base64url.
//
// The prefix is RESERVED, and that is load-bearing rather than incidental.
// recordRoute encodes EVERY id opaquely, including one that already begins with
// "r~", so a minted route for such a record round-trips through the reader
// unchanged. The cost is that a segment beginning with "r~" is read as opaque
// and as nothing else: a plain id starting with "r~" written into a URL by hand
// does not decode as base64url, and is answered as unresolvable rather than
// guessed at as plaintext. Guessing would make the encoding ambiguous, and an
// ambiguous encoding cannot round-trip at all.
const RECORD_SEGMENT_PREFIX = 'r~'

function encodeRecordId(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeRecordId(value: string): string | undefined {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return undefined
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
  try {
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return undefined
  }
}

export function recordRoute(objectType: string, recordId: string): string {
  return `${objectType}/${RECORD_SEGMENT_PREFIX}${encodeRecordId(recordId)}`
}

export function recordIdFromRoute(parts: string[]): string | undefined {
  if (parts.length !== 2 || !parts[1]?.startsWith(RECORD_SEGMENT_PREFIX)) return undefined
  const encoded = parts[1].slice(RECORD_SEGMENT_PREFIX.length)
  const recordId = decodeRecordId(encoded)
  return recordId !== undefined && encodeRecordId(recordId) === encoded ? recordId : undefined
}

// What the part of a route after the object type addresses.
//
// Three answers, not two. "No record" is the object's own list; a record the
// surface can name is that record; and a record segment it CANNOT name is
// neither -- the address asked for a record and the surface has to say it could
// not open that one. Collapsing the third into the first is what made every
// broken deep link land silently on the list.
export type RecordSegment =
  | { kind: 'none' }
  | { kind: 'record', recordId: string }
  | { kind: 'unresolvable', segment: string }

export function recordFromRoute(parts: string[]): RecordSegment {
  if (parts.length < 2) return { kind: 'none' }
  // An id carrying a path separator can only travel opaquely: unencoded it has
  // already been split across segments and cannot be put back together.
  if (parts.length > 2) return { kind: 'unresolvable', segment: parts.slice(1).join('/') }

  const segment = parts[1] ?? ''
  if (segment === '') return { kind: 'none' }

  if (segment.startsWith(RECORD_SEGMENT_PREFIX)) {
    const recordId = recordIdFromRoute(parts)
    return recordId === undefined ? { kind: 'unresolvable', segment } : { kind: 'record', recordId }
  }

  // A link minted outside the CRM names the record plainly, and arrives
  // percent-encoded. That is the shell's contract, not a guess: WcSurface slices
  // vue-router's route.path -- which the router leaves encoded, decoding params
  // and hash only -- and sets it on the element without decoding anything.
  //
  // So the segment is decoded exactly ONCE, and only here. Decoding it twice
  // would mangle a record id that legitimately contains a percent sequence: an
  // id of "a%41b" travels as "a%2541b" and must come back as "a%41b", not "aAb".
  // Not decoding at all would leave every id an outside link ever escaped
  // unmatchable. A segment carrying an escape that is not one names no address
  // this surface can read, so it is unresolvable rather than quietly the list.
  try {
    const recordId = decodeURIComponent(segment)
    return recordId === '' ? { kind: 'none' } : { kind: 'record', recordId }
  } catch {
    return { kind: 'unresolvable', segment }
  }
}

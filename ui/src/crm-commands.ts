import { referenceValues } from './crm-model'
import { CRM_EVENTS, type CrmAttribute, type CrmCommand, type CrmReference, type CrmValue } from './crm-types'

function identity(reference: CrmReference): string {
  return `${reference.kind}\u0000${reference.type}\u0000${reference.id}`
}

function wireReference(reference: CrmReference): CrmReference {
  return { kind: reference.kind, type: reference.type, id: reference.id }
}

function relationCommand(type: string, recordId: string, objectType: string, attribute: CrmAttribute, reference: CrmReference): CrmCommand {
  return {
    type,
    body: {
      record_id: recordId,
      object_type: objectType,
      attr: attribute.attr,
      reference: wireReference(reference),
      ...(attribute.config?.relation ? { relation: attribute.config.relation } : {}),
    },
  }
}

function splitValues(attributes: CrmAttribute[], values: Record<string, CrmValue>): { scalars: Record<string, CrmValue>; relations: Map<string, CrmReference[]> } {
  const relations = new Map<string, CrmReference[]>()
  const relationNames = new Set(attributes.filter((attribute) => attribute.data_type === 'relation').map((attribute) => attribute.attr))
  const scalars: Record<string, CrmValue> = {}
  for (const [attr, value] of Object.entries(values)) {
    if (relationNames.has(attr)) relations.set(attr, referenceValues(value))
    else scalars[attr] = value
  }
  for (const attr of relationNames) if (!relations.has(attr)) relations.set(attr, [])
  return { scalars, relations }
}

export function createRecordCommands(recordId: string, objectType: string, attributes: CrmAttribute[], values: Record<string, CrmValue>): CrmCommand[] {
  const split = splitValues(attributes, values)
  const commands: CrmCommand[] = [{ type: CRM_EVENTS.recordCreated, body: { record_id: recordId, object_type: objectType, values: split.scalars } }]
  for (const attribute of attributes) {
    if (attribute.data_type !== 'relation') continue
    for (const reference of split.relations.get(attribute.attr) || []) {
      commands.push(relationCommand(CRM_EVENTS.relationLinked, recordId, objectType, attribute, reference))
    }
  }
  return commands
}

export function updateRecordCommands(recordId: string, objectType: string, attributes: CrmAttribute[], before: Record<string, CrmValue>, after: Record<string, CrmValue>): CrmCommand[] {
  const prior = splitValues(attributes, before)
  const next = splitValues(attributes, after)
  const set: Record<string, CrmValue> = {}
  const unset: string[] = []
  const scalarNames = new Set([...Object.keys(prior.scalars), ...Object.keys(next.scalars)])
  for (const attr of scalarNames) {
    if (JSON.stringify(prior.scalars[attr]) === JSON.stringify(next.scalars[attr])) continue
    if (next.scalars[attr] === undefined) unset.push(attr)
    else set[attr] = next.scalars[attr]
  }

  const commands: CrmCommand[] = []
  if (Object.keys(set).length || unset.length) {
    commands.push({
      type: CRM_EVENTS.recordUpdated,
      body: { record_id: recordId, object_type: objectType, ...(Object.keys(set).length ? { set } : {}), ...(unset.length ? { unset } : {}) },
    })
  }
  for (const attribute of attributes) {
    if (attribute.data_type !== 'relation') continue
    const oldReferences = prior.relations.get(attribute.attr) || []
    const newReferences = next.relations.get(attribute.attr) || []
    const oldIds = new Set(oldReferences.map(identity))
    const newIds = new Set(newReferences.map(identity))
    for (const reference of oldReferences) {
      if (!newIds.has(identity(reference))) commands.push(relationCommand(CRM_EVENTS.relationUnlinked, recordId, objectType, attribute, reference))
    }
    for (const reference of newReferences) {
      if (!oldIds.has(identity(reference))) commands.push(relationCommand(CRM_EVENTS.relationLinked, recordId, objectType, attribute, reference))
    }
  }
  return commands
}

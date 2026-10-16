export type Scalar = string | number | boolean | null

export type CrmReferenceKind = 'record' | 'component' | 'principal'

/** Stored relation value. CRM writes and reads this shape without guessing from an id. */
export interface CrmReference {
  kind: CrmReferenceKind
  type: string
  id: string
  label?: string
}

export type CrmValue = Scalar | Scalar[] | CrmReference | CrmReference[] | Record<string, unknown> | Record<string, unknown>[]

export interface CrmObject {
  id?: string
  type: string
  label: string
  icon?: string
  columns?: string[]
  collection?: string
  role?: string
}

/** The seats the record page has. Hidden fields remain stored and queryable. */
export type CrmFieldSection = 'main' | 'collapsed' | 'hidden'

/**
 * What a schema declares as a field's placement. An imported configuration is
 * free to name a placement this surface has no seat for; fieldSection() resolves
 * every such name onto the collapsed seat rather than onto the front of the page.
 */
export type CrmFieldPlacement = CrmFieldSection | (string & {})

export interface CrmFieldUi {
  /** Record-detail placement. */
  section?: CrmFieldPlacement
  /** The deployment's own named section for this field on the record page;
   *  empty falls back to type-based grouping. */
  group?: string
  /** Whether the field participates in create/edit forms. */
  form?: boolean
  /** Whether the field is eligible for the default table view. */
  list?: boolean
  /** Semantic placement without relying on API field names. */
  role?: 'title' | 'subtitle'
  /** Responsive mosaic width in quarter-row units. */
  span?: 1 | 2 | 3 | 4
}

export interface CrmReferenceTarget {
  kind: CrmReferenceKind
  object_type?: string
  class?: string
  contract?: string
  kinds?: string[]
  route?: string
}

export interface AttributeConfig {
  required?: boolean
  unique?: boolean
  default?: unknown
  help?: string
  description?: string
  choices?: string[]
  target?: CrmReferenceTarget
  cardinality?: 'one' | 'many'
  relation?: string
  min?: number
  max?: number
  precision?: number
  min_length?: number
  max_length?: number
  pattern?: string
  currency_code?: string
  ui?: CrmFieldUi
  [key: string]: unknown
}

export interface CrmAttribute {
  id?: string
  object_type: string
  attr: string
  data_type: string
  label: string
  sort_order?: number
  system?: boolean
  config?: AttributeConfig
}

export interface PipelineStage {
  stage_id: string
  label: string
  order?: number
  terminal?: boolean
  won?: boolean
}

export interface CrmPipeline {
  collection_id: string
  object_type: string
  label: string
  stages: Array<PipelineStage | string>
}

export interface CrmView {
  view_id: string
  object_type: string
  name: string
  layout: 'table' | 'board' | 'timeline' | string
  collection_id?: string
  sort_order?: number
  spec?: { columns?: string[]; sort?: CrmSort; filters?: CrmFilter[]; [key: string]: unknown }
}

export interface AssociationEdge {
  attr: string
  source: CrmReference
  target: CrmReference
  ordinal?: number
  updated_at?: string
}
export interface AssociationSet { outgoing?: AssociationEdge[]; incoming?: AssociationEdge[] }
export interface CrmRecord {
  record_id: string
  object_type: string
  values: Record<string, CrmValue>
  associations?: AssociationSet
}

export interface CrmActivity {
  activity_id: string
  record_id?: string
  activity_type: string
  occurred_at?: string
  due_at?: string
  done?: boolean
  payload?: Record<string, unknown>
}

export interface CrmRecordPanel {
  tag: string
  title: string
  order: number
  object_types: string[]
}

export interface CrmFilter { attr: string; op: string; value: unknown }
export interface CrmSort { attr: string; dir: 'asc' | 'desc' }

export interface CrmBootstrap {
  success: boolean
  crm_id: string
  workspace_label: string
  can_write: boolean
  objects: CrmObject[]
  attributes: CrmAttribute[]
  pipelines: CrmPipeline[]
  views: CrmView[]
  error?: string
  code?: string
  candidates?: Array<{ crm_id: string; component_id: string; label: string }>
}

export interface CrmSchemaDeclaration {
  version?: string
  objects: CrmObject[]
  attributes: CrmAttribute[]
  pipelines: CrmPipeline[]
  views: CrmView[]
  policies?: Record<string, unknown>[]
  merge_config?: Record<string, unknown>
  remove?: {
    objects?: Array<string | { object_id: string }>
    attributes?: Array<{ object_id: string; field_id: string }>
    declarations?: Array<{ kind: 'pipeline' | 'view' | 'policy'; id: string }>
  }
}

export interface CrmSchemaState {
  revision: string
  declaration: CrmSchemaDeclaration
}

export interface CrmCommand { type: string; body: Record<string, unknown> }

export const CRM_EVENTS = {
  recordCreated: 'kickside.crm.events:record.created',
  recordUpdated: 'kickside.crm.events:record.updated',
  recordDeleted: 'kickside.crm.events:record.deleted',
  relationLinked: 'kickside.crm.events:relation.linked',
  relationUnlinked: 'kickside.crm.events:relation.unlinked',
  membershipSet: 'kickside.crm.events:membership.set',
  activityLogged: 'kickside.crm.events:activity.logged',
} as const

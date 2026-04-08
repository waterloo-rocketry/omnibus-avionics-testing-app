export interface BoardMessage<T extends Record<keyof T, string | number>> {
    boardTypeId: string
    boardInstId: string
    msgPriority: string
    msgType: string
    data: T | undefined | null
}

export interface Identifier {
    type_id: string
    inst_id: string
}

export const identifiers: Identifier[] = [
    { type_id: 'TYPE-1', inst_id: 'INST-1' },
    { type_id: 'TYPE-2', inst_id: 'INST-2' },
    { type_id: 'TYPE-3', inst_id: 'INST-3' },
    { type_id: 'TYPE-4', inst_id: 'INST-4' },
]

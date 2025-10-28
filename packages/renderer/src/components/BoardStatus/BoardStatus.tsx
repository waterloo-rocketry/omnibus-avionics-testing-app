import { Card } from '@/components/ui/card'
import { Table, TableBody } from '@/components/ui/table'

import BoardStatusRow from './BoardStatusRow'
import type { BoardMessage } from '@/components/types.ts'

function BoardStatus<T extends Record<keyof T, string | number>>({
    boardData,
    boardTitle,
    boardInstId,
    boardMsgPrio,
}: {
    boardData: BoardMessage<T>
    boardTitle: string
    boardInstId: string
    boardMsgPrio: string
}) {
    const data = boardData.data
    const boardFields = data ? (Object.entries(data) as Array<[keyof T, T[keyof T]]>) : []
    return (
        <Card className="w-90 p-5 bg-yellow-200">
            <h1 className="text-3xl font-bold text-center">{boardTitle}</h1>
            <h2 className="text-large font-bold text-center">{boardInstId}</h2>
            <Table>
                <TableBody>
                    <BoardStatusRow name="msg_prio" value={boardMsgPrio}></BoardStatusRow>
                    {boardFields.map(([key, value]) => (
                        <BoardStatusRow
                            key={String(key)}
                            name={String(key)}
                            value={value}
                        ></BoardStatusRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    )
}

export default BoardStatus

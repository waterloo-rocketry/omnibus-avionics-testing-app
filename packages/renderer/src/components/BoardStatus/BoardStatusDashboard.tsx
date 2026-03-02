import type { BoardMessage } from '@/components/types.ts'
import BoardStatus from './BoardStatus'

function BoardStatusDashboard<T extends Record<keyof T, string | number>>({
    boardInfoArray,
}: {
    boardInfoArray: BoardMessage<T>[]
}) {
    const dashboardFields = boardInfoArray.map((x) => (
        <BoardStatus
            key={`${x.boardTypeId}-${x.boardInstId}`}
            boardData={x}
            boardTitle={x.boardTypeId}
            boardInstId={x.boardInstId}
            boardMsgPrio={x.msgPriority}
        ></BoardStatus>
    ))
    return <>{dashboardFields}</>
}

export default BoardStatusDashboard

//import { useState } from 'react'

import './App.css'
//import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
//import { Card } from '@/components/BoardStatus/BoardStatus'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function App() {
    /*const [count, setCount] = useState(0)
    function handleClick() {
        setCount((count) => count + 1)
    }*/
    return (
        <>
            <Card className="mt-10 ml-10 mr-10 w-100 h-100 p-10">
                <h1 className="text-3xl font-bold text-center">Title</h1>
                <h2 className="test-large text-center">Instance Id</h2>

                <h1 className="text-large font-bold text-center">Data</h1>
                <Table>
                <TableCaption>Relevant Information</TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>40.523</TableCell>
                    </TableRow>
                    <TableRow>
                    <TableCell>IMU Id</TableCell>
                    <TableCell>IMU_PROC_ALTIMU10</TableCell>
                    </TableRow>
                    <TableRow>
                    <TableCell>Linear Acceleration</TableCell>
                    <TableCell>-0.2473</TableCell>
                    </TableRow>
                    <TableRow>
                    <TableCell>Angular Velocity</TableCell>
                    <TableCell>-0.2441</TableCell>
                    </TableRow>
                </TableBody>
                </Table>
            </Card>
        </>
    )
}

export default App

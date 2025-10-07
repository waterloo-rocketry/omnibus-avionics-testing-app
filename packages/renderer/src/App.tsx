import { useState } from 'react'

import './App.css'
import { Button } from '@/components/ui/button'
import { Card } from './components/ui/card'

function App() {
    const [count, setCount] = useState(0)
    function handleClick() {
        setCount((count) => count + 1)
    }
    return (
        <>
            <Button className=" hover:cursor-pointer">Hello World</Button>
            <Card className="mt-4 p-4">
                <p className="mb-4">Count is {count}</p>
                <Button onClick={handleClick}>Increment</Button>
            </Card>
        </>
    )
}

export default App

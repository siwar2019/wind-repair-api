import { Button } from './button'

export interface Tab {
    id: number
    parentId: number
    type: string
    name: string
    buttons: Button[]
}

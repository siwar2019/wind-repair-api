import { Tab } from './tab'

export interface SubMenu {
    id: number
    parentId: number
    type: string
    name: string
    tabs: Tab[]
}

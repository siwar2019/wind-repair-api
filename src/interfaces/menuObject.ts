import { SubMenu } from './subMenu'

export interface MenuObject {
    id: number
    nameModule: string
    type: string
    parentId: number | null
    subMenus: SubMenu[]
}

export interface IButton {
    id: number
    menuId: number
    name: string
    checked: boolean
    actionId: string
}

export interface IMenu {
    id: number
    name: string
    actionId: string
    buttons: IButton[]
}

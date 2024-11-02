export type IndexListDataItemData<T = any> = T & {
  star?: boolean
}

export interface IndexListDataItem<T = any> {
  title: string
  data: IndexListDataItemData<T>[]
}

const indexListKeys = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '#',
] as const
export type IndexListKeys = (typeof indexListKeys)[number]

export type IndexListData<T = any> = Partial<
  Record<IndexListKeys, IndexListDataItem<T>>
>

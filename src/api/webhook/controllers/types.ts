type MainMenu = 'command'
type Start = '/start'

export type Command = Start | MainMenu

export interface TGHook {
  update_id: number,
  message: {
    message_id: number,
    from: {
      id: number,
      is_bot: boolean,
      first_name: string,
      username: string,
      language_code: string
    },
    chat: {
      id: number,
      first_name: string,
      username: string,
      type: string
    },
    date: number,
    text: Command,
    entities: [ [Object] ]
  }
}
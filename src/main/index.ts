import { OpencodeUi } from './opencode-ui.js'

try {
  const opencodeUi = new OpencodeUi()
  opencodeUi.init().catch(console.error)
} catch (e) {
  console.error(e)
}

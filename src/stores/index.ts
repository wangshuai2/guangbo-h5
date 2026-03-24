import { createPinia } from 'pinia'
import type { App } from 'vue'

export const pinia = createPinia()

export const setupStore = (app: App) => {
  app.use(pinia)
}

export * from './user'
export * from './museum'
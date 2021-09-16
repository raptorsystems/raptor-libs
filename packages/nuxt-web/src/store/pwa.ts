import type { ActionTree, MutationTree } from 'vuex'

export const state = () => ({
  isUpdated: false,
})

type RootState = ReturnType<typeof state>

export const mutations: MutationTree<RootState> = {
  setUpdated(state, value: boolean) {
    state.isUpdated = value
  },
}

export const actions: ActionTree<RootState, RootState> = {
  updated({ commit }) {
    commit('setUpdated', true)
  },
  dismissUpdate({ commit }) {
    commit('setUpdated', false)
  },
}

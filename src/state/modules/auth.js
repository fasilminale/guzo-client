import axios from 'axios'

export const state = {
  currentUser: getSavedState('auth.currentUser'),
}

export const mutations = {
  SET_CURRENT_USER(state, newValue) {
    state.currentUser = newValue
    saveState('auth.currentUser', newValue)
    setDefaultAuthHeaders(state)
  },
}

export const getters = {
  // Whether the user is currently logged in.
  loggedIn(state) {
    return !!state.currentUser
  },
}

export const actions = {
  // This is automatically run in `src/state/store.js` when the app
  // starts, along with any other actions named `init` in other modules.
  init({ state, dispatch }) {
    setDefaultAuthHeaders(state)
    // dispatch('validate')
  },

  // Logs in the current user.
  logIn({ commit, dispatch, getters }, { username, password } = {}) {
    if (getters.loggedIn) return dispatch('validate')

    return axios
      .post('http://localhost:3000/api/Users/login?include=%5B%22User%22%5D', {
        username,
        password,
      })
      .then((response) => {
        const user = response.data
        console.log(user)
        commit('SET_CURRENT_USER', user)
        return user
      })
  },

  // Logs in the current user.
  signUp({ commit, dispatch, getters }, { username, email, password } = {}) {
    if (getters.loggedIn) return dispatch('validate')

    return axios
      .post('http://localhost:3000/api/Users', {
        username,
        email,
        password,
      })
      .then(() => {
        axios
          .post(
            'http://localhost:3000/api/Users/login?include=%5B%22User%22%5D',
            {
              username,
              password,
            }
          )
          .then((response) => {
            const user = response.data
            console.log(user)
            commit('SET_CURRENT_USER', user)
            return user
          })
      })
  },

  // Logs out the current user.
  logOut({ commit }) {
    commit('SET_CURRENT_USER', null)
  },

  // Validates the current user's token and refreshes it
  // with new data from the API.
  validate({ commit, state }) {
    if (!state.currentUser) return Promise.resolve(null)

    return state.currentUser
  },
}

// ===
// Private helpers
// ===

function getSavedState(key) {
  return JSON.parse(window.localStorage.getItem(key))
}

function saveState(key, state) {
  window.localStorage.setItem(key, JSON.stringify(state))
}

function setDefaultAuthHeaders(state) {
  axios.defaults.headers.common.Authorization = state.currentUser
    ? state.currentUser.token
    : ''
}

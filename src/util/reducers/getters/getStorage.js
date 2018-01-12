import store from '../../../store'
import Storage from '../../../../utils/storage'

const storage = new Storage()
import { START_STORAGE } from '../storageReducer'

let getStorage = new Promise((resolve, reject) => {
  storage.start('ipfs-paperchain').then(error => {
    if (error) {
      console.error(error)
    }
    resolve(store.dispatch({
      type: START_STORAGE,
      storage: storage
    }))
  })
})

export default getStorage

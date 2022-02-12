/*
 * Store the URL to the GraphQL database and functions
 * to access it.
 */
import type {User} from '../pages/api/user'
import {adminSuitability} from './suitabilities'

//export const database: string = 'http://localhost:4000/graphql' // URL for the graphql server from our server
export const database: string = 'http://maya:4000/graphql' // URL for the graphql server from our server
export const remoteDB: string = 'http://maya:4000/graphql'    // URL for the graphql server from the client

/*
 * Query to retrieve all users for the users table
 */
export const query_readUsers = `
  query {
    users {
      id
      username
      suitability
      password
    }
  }
`

/*
 * Query to add an entry to the users table. We
 * set a default suitability because it's hidden on
 * the edit form and we assume it will be set from the
 * table.
 */
export const query_createUser = `
  mutation {
    createUser(username:"[[record.username]]", suitability: 0, admin: 0) {
      id
    }
  }
`

/*
 * Query to update a row in the users table
 */
export const query_updateRowUser = `
  mutation {
    updateUser(id:[[record.id]], username:"[[record.username]]", suitability: [[record.suitability]]) {
      id
    }
  }
`

/*
 * Query to update a cell in the users table
 */
export const query_updateCellUser = `
  mutation {
    updateUser(id:[[record.id]],  username:"[[record.username]]", suitability: [[record.suitability]]) {
      id
    }
  }
`

/*
 * Query to delete a row in the users table
 */
export const query_deleteUser = `
  mutation {
    deleteUser(id:[[record.id]]) {
      success
    }
  }
`

/*
 * Query to retrieve all shows for the shows table
 */
export const query_readShows = `
  query {
    shows {
      id
      title
      provider
      genre
      seasons
      suitability
    }
  }
`

/*
 * Query to add an entry to the shows table.
 * We set a default suitability since we're hiding it
 * on the edit form.
 */
export const query_createShow = `
  mutation {
    createShow(title:"[[record.title]]", seasons:[[record.seasons]], provider:"[[record.provider]]", genre:"[[record.genre]]", suitability: 0) {
      id
    }
  }
`

/*
 * Query to update a row in the shows table
 */
export const query_updateRowShow = `
  mutation {
    updateShow(id:[[record.id]], title:"[[record.title]]", seasons:[[record.seasons]], provider:"[[record.provider]]", genre:"[[record.genre]]") {
      id
    }
  }
`

/*
 * Query to update a cell in the shows table
 */
export const query_updateCellShow = `
  mutation {
    updateShow(id:[[record.id]], title:"[[record.title]]", seasons:[[record.seasons]], provider:"[[record.provider]]", genre:"[[record.genre]]") {
      id
    }
  }
`

/*
 * Query to delete a row in the shows table
 */
export const query_deleteShow = `
  mutation {
    deleteShow(id:[[record.id]]) {
      success
    }
  }
`

/*
 * Get the full table of users
 */
export async function getUsers() {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: query_readUsers
    })
  })

  const json = await resp.json()

  return json.data.users
}

/*
 * Get a list of all usernames
 */
export async function getUsernames() {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query {
          users {
            username
          }
        }
      `
    })
  })

  const json = await resp.json()
  const list = json.data.users.map(x => x.username)

  return list
}

/*
 * Get the record for the given user by name. Returns
 * false if no such user exists.
 */
export async function getUserByName(u: string) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query listUsers($username: String!) {
          users(where: {username: $username}) {
            id
            username
            password
            suitability
            admin
          }
        }`,
      variables: {
        username: u
      }
    })
  })

  const json = await resp.json()

  if(json.data.users.length === 0)
    return false
  else
    return json.data.users[0]
}

/*
 * Are there any admin users?
 */
export async function anyAdmins(): boolean {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query {
          users(where: {admin: 1}) {
            id
          }
        }`,
      variables: {
      }
    })
  })

  const json = await resp.json()
  return json.data.users.length > 0
}

/*
 * Create the first new user, the admin. We return
 * the structure representing the new user.
 */
export async function createAdmin(username: string, password: string): User {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation createAdmin($username: String!, $password: String!, $suitability: Int!, $admin: Int!) {
          createUser(username: $username, password: $password, suitability: $suitability, admin: $admin) {
            id
          }
        }`,
      variables: {
        username: username,
        password: password,
        suitability: adminSuitability,
        admin: 1
      }
    })
  })

  const json = await resp.json()
  return {
    username,
    adminSuitability,
    admin: true,
    id: json.data.createUser.id
  }
}

/*
 * Given a user id and password, update the password for that user.
 */
export async function setPasswordForUserId(id: number, password: string) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation updatePassword($id: Int!, $password: String!) {
          updateUser(id: $id, password: $password) {
            id
          }
        }`,
      variables: {
        id: id,
        password: password
      }
    })
  })

  const json = await resp.json()
}


/*
 * Given a user id and suitability, update the suitability for that user.
 */
export async function setSuitabilityForUserId(id: number, suitability: number) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation updateSuitability($id: Int!, $suitability: Int!) {
          updateUser(id: $id, suitability: $suitability) {
            id
          }
        }`,
      variables: {
        id: id,
        suitability: suitability
      }
    })
  })

  const json = await resp.json()
}

/*
 * Given a show id and suitability, update the suitability for that show.
 */
export async function setSuitabilityForShowId(id: number, suitability: number) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation updateSuitability($id: Int!, $suitability: Int!) {
          updateShow(id: $id, suitability: $suitability) {
            id
          }
        }`,
      variables: {
        id: id,
        suitability: suitability
      }
    })
  })

  const json = await resp.json()
}

/*
 * Given a username, return their id and suitability
 */
async function getIdAndSuitabilityForUsername(username: string) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query getIdAndSuitabilityForUsername($username: String!) {
          users(where: {username: $username}) {
            id
            suitability
          }
        }`,
      variables: {
        username: username
      }
    })
  })

  const json = await resp.json()

  if(json.data.users.length > 0)
    return json.data.users[0]
  else 
    return {id: null, suitability: null}
}

/* 
 * Given a userId and suitability, return all shows that are suitable
 * along with any ratings that user might have made.
 */
async function getSuitableShows(userId: number, suitability: number) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query getSuitableShows($suitability: Int!, $userId: Int!) {
          shows(where: {suitability: {lte: $suitability}}) {
            id
            title
            ratings(where: {userId: $userId}) {
              id
              rating
            }
          }
        }`,
      variables: {
        suitability: suitability,
        userId: userId
      }
    })
  })

  const json = await resp.json()
  return json.data.shows
}

/*
 * Given a username, retrieve the shows they can rate and 
 * their rating for each show.
 */
export async function getShowsAndRatingsForUsername(username: string) {
  const {id: userId, suitability} = await getIdAndSuitabilityForUsername(username)
  const shows = await getSuitableShows(userId, suitability)
  debugger
}

/*
 * Store the URL to the GraphQL database and functions
 * to access it.
 */
import type {User} from '../pages/api/user'

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
      levelId
      password
    }
  }
`

/*
 * Query to add an entry to the users table. We
 * set a default suitability level because it's hidden on
 * the edit form and we assume it will be set from the
 * table.
 */
export const query_createUser = `
  mutation {
    createUser(username:"[[record.username]]", levelId: 0, admin: 0) {
      id
    }
  }
`

/*
 * Query to update a row in the users table
 */
export const query_updateRowUser = `
  mutation {
    updateUser(id:[[record.id]], username:"[[record.username]]", levelId: [[record.levelId]]) {
      id
    }
  }
`

/*
 * Query to update a cell in the users table
 */
export const query_updateCellUser = `
  mutation {
    updateUser(id:[[record.id]],  username:"[[record.username]]", levelId: [[record.levelId]]) {
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
      levelId
    }
  }
`

/*
 * Query to add an entry to the shows table.
 * We set a default suitability level since we're hiding it
 * on the edit form.
 */
export const query_createShow = `
  mutation {
    createShow(title:"[[record.title]]", seasons:[[record.seasons]], provider:"[[record.provider]]", genre:"[[record.genre]]", levelId: 0) {
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
 * Get the list of suitability levels 
 */
export async function getSuitabilityLevels() {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query {
          levels {
            id
            name
            rank
          }
        }`
    })
  })

  const json = await resp.json()
  return json.data.levels
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
            levelId
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
        mutation createAdmin($username: String!, $password: String!, $levelId: Int!, $admin: Int!) {
          createUser(username: $username, password: $password, levelId: $levelId, admin: $admin) {
            id
          }
        }`,
      variables: {
        username: username,
        password: password,
        levelId: 0,
        admin: 1
      }
    })
  })

  const json = await resp.json()
  return {
    username,
    levelId: 0,
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
 * Given a user id and suitability level, update the level for that user.
 */
export async function setSuitabilityForUserId(id: number, levelId: number) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation updateSuitability($id: Int!, $levelId: Int!) {
          updateUser(id: $id, levelId: $levelId) {
            id
          }
        }`,
      variables: {
        id: id,
        levelId: levelId
      }
    })
  })

  const json = await resp.json()
}

/*
 * Given a show id and suitability level, update the level for that show.
 */
export async function setSuitabilityForShowId(id: number, levelId: number) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation updateSuitability($id: Int!, $levelId: Int!) {
          updateShow(id: $id, levelId: $levelId) {
            id
          }
        }`,
      variables: {
        id: id,
        levelId: levelId
      }
    })
  })

  const json = await resp.json()
}

/*
 * Given a username, return their id and suitability level
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
            level {
              rank
            }
          }
        }`,
      variables: {
        username: username
      }
    })
  })

  const json = await resp.json()
  if(json.data.users.length > 0)
    return {id: json.data.users[0].id, rank: json.data.users[0].level.rank}
  else 
    return {id: null, rank: null}
}

/* 
 * Given a userId and suitability rank, return all shows that are suitable
 * along with any ratings that user might have made.
 * If we had more control over the graphQL server we could do this with
 * a simple query, instead we filter the results of the query in JS.
 */
async function getSuitableShows(userId: number, suitability: number) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query getSuitableShows($userId: Int!) {
          shows {
            id
            title
            level {
              rank
            }
            ratings(where: {userId: $userId}) {
              id
              rating
            }
          }
        }`,
      variables: {
        userId: userId
      }
    })
  })

  const json = await resp.json()
  const shows = json.data.shows.filter(x => x.level.rank <= suitability)
  return shows
}

/*
 * Given a username, retrieve the shows they can rate and 
 * their rating for each show.
 *
 * Since we're using an auto-generated graphQL server, we 
 * can't add additional resolvers to support doing this as
 * one query.
 */
export async function getShowsAndRatingsForUsername(username: string) {
  const {id, rank} = await getIdAndSuitabilityForUsername(username)
  const shows = await getSuitableShows(id, rank)
  return shows
}
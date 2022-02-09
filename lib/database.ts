/*
 * Store the URL to the GraphQL database and functions
 * to access it.
 */
import type {User} from '../pages/api/user'
import {adminSuitability} from './suitabilities'

export const database: string = 'http://localhost:4000/graphql' // URL for the graphql server from our server
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
    }
  }
`

/*
 * Query to add an entry to the users table
 */
export const query_createUser = `
  mutation {
    createUser(username:"[[record.username]]", suitability: "[[record.suitability]]", admin: 0) {
      id
    }
  }
`

/*
 * Query to update a row in the users table
 */
export const query_updateRowUser = `
  mutation {
    updateUser(id:[[record.id]], username:"[[record.username]]", suitability: "[[record.suitability]]") {
      id
    }
  }
`

/*
 * Query to update a cell in the users table
 */
export const query_updateCellUser = `
  mutation {
    updateUser(id:[[record.id]],  username:"[[record.username]]", suitability: "[[record.suitability]]") {
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
        mutation createAdmin($username: String!, $password: String!, $suitability: String!, $admin: Int!) {
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

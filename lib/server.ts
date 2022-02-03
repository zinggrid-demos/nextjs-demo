/*
 * Store the URL to the GraphQL server and functions
 * to access it.
 */
 import type {User} from '../pages/api/user'
 import {adminSuitability} from './suitabilities'

export const server: string = 'http://localhost:4000/graphql'

/*
 * Get the record for the given user by name. Returns
 * false if no such user exists.
 */
export async function getUserByName(u: string) {
  const resp = await fetch(server, {
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
  const resp = await fetch(server, {
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
  const resp = await fetch(server, {
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
  const resp = await fetch(server, {
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

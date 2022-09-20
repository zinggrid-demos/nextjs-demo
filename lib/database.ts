/*
 * Store the URL to the GraphQL database and functions
 * to access it.
 */
import type {User} from '../pages/api/user'

export const database: string = 'http://localhost:4000/graphql' // URL for the graphql server 
//export const database: string = 'http://maya:4000/graphql'    // URL for the graphql server in author's dev environment

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
 * Query to add an entry to the users table.
 */
export const query_createUser = `
  mutation {
    createUser(username:"[[record.username]]", levelId: [[record.levelId]], admin: 0) {
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
 */
export const query_createShow = `
  mutation {
    createShow(title:"[[record.title]]", seasons:[[record.seasons]], provider:"[[record.provider]]", genre:"[[record.genre]]", levelId: [[record.levelId]]) {
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
        levelId: 1,
        admin: 1
      }
    })
  })

  const json = await resp.json()
  return {
    username,
    levelId: 1,
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

/*
 * Given a user id and a show id, create a rating
 */
export async function addRatingForUserAndShow(userId, showId, rating) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation createRating($userId: Int!, $showId: Int!, $rating: Float!) {
          createRating(userId: $userId, showId: $showId, rating: $rating) {
            id
          }
        }`,
      variables: {
        userId: userId,
        showId: showId,
        rating: rating
      }
    })
  })

  const json = await resp.json()
  debugger
  return json.data.createRating.id
}

/*
 * Given an existing rating id, update the rating value
 */
export async function updateRating(id, rating) {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation updateRating($id: Int!, $rating: Float!) {
          updateRating(id: $id, rating: $rating) {
            id
          }
        }`,
      variables: {
        id: id,
        rating: rating
      }
    })
  })

  const json = await resp.json()
}

/*
 * Return a list of users and whether or not they've entered any
 * ratings.
 */
export async function getHasRated() {
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
            ratings {
              rating
            }
          }
        }
      `
    })
  })

  const json = await resp.json()
  return json.data.users.map(x => ({username: x.username, rated: x.ratings.length > 0}))
}

/* 
 * Return the average of an array of numbers
 */
function avg(x) {
  if(x.length)
    return x.reduce((accum, value) => accum + value, 0) / x.length
  else 
    return 0
}

/*
 * Return the average rating by show
 */
export async function getAvgRatings() {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query {
          shows {
            title
            ratings {
              rating
            }
          }
        }
      `
    })
  })

  const json = await resp.json()
  return json.data.shows.map(x => ({show: x.title, rating: avg(x.ratings.map(y => y.rating))}))
}

/*
 * Return the ratings for each show by user
 */
export async function getRatings() {
  const resp = await fetch(database, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query {
          shows {
            title
          }
          users {
            username
            ratings {
              rating
              show {
                title
              }
            }
          }
        }
      `
    })
  })

  const json = await resp.json()
  return {
    shows: json.data.shows.map(x => x.title),
    users: json.data.users.map(x => ({
      username: x.username,
      ratings: Object.fromEntries(x.ratings.map(y => [y.show.title, y.rating]))
    }))
  }
}
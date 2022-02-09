/* 
 * Table for adding/removing users, visible only to the admin.
 * This is a statically rendered ZingGrid that will be hydrated
 * automatically when it's rendered in the browser.
 *
 * Server-side implementation.
 */
import React from 'react'
import Layout from 'components/Layout'
import {withIronSessionSsr} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import useUser from 'lib/useUser'
import 'zinggrid'

import {database, query_readUsers, query_createUser, query_updateRowUser, query_updateCellUser, query_deleteUser} from 'lib/database'


export default function Users({users}) {
  const {user} = useUser({redirectTo: '/login'})

  return (
    <Layout>
      <h1>Users</h1>
      {user?.isLoggedIn && user?.admin && (
        <>
        <h3>Enter users here and set the highest content rating they're allowed to view. Only the administrator (you)
        can add or remove users. Only users listed here can log in, the first password
        they enter will be stored as their password.</h3>
        <zing-grid server-rendered context-menu caption="Users" head-class="grid-header" editor-controls>
          <zg-colgroup>
            <zg-column index="id" hidden editor="disabled"></zg-column>
            <zg-column index="username" header="User"></zg-column>
            <zg-column index="suitability" header="Highest Content Rating"></zg-column>
          </zg-colgroup>
          <zg-data src={database} adapter="graphql">
            <zg-param name="recordPath" value="data.users"></zg-param>
            <zg-param name="readBody" value={JSON.stringify({query: query_readUsers})}></zg-param>
            <zg-param name="createBody" value={JSON.stringify({query: query_createUser})}></zg-param>
            <zg-param name="updateRowBody" value={JSON.stringify({query: query_updateRowUser})}></zg-param>
            <zg-param name="updateCellBody" value={JSON.stringify({query: query_updateCellUser})}></zg-param>
            <zg-param name="deleteBody" value={JSON.stringify({query: query_deleteUser})}></zg-param> 
          </zg-data>
        </zing-grid>
        </>
      )}
      {user?.isLoggedIn && !user?.admin && (
        <h2>You must be logged in as the administrator to view this page.</h2>
      )}
    </Layout>
  )
}

export const getServerSideProps = withIronSessionSsr(async function ({req, res}) {
  const users = await getUsers()

  return {
    props: {users}
  }
}, sessionOptions)
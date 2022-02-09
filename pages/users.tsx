/* 
 * Table for adding/removing users, visible only to the admin.
 * This is a statically rendered ZingGrid that will be hydrated
 * automatically when it's rendered in the browser.
 */
import React, {useRef, useEffect} from 'react'
import Layout from 'components/Layout'
import {withIronSessionSsr} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import useUser from 'lib/useUser'
import 'zinggrid'

import {database, query_readUsers, getUsers} from 'lib/database'

const dbcs = 'http://maya:4000/graphql'

//export default function Users({users}) {
export default function Users() {
  const {user} = useUser({redirectTo: '/login'})

  const grid = useRef(null)
  async function getData() {
    try {
      const users = await getUsers()
      grid.current.setData(users)
    } catch(err) {
      console.log(err)
    }
  }

  useEffect(() => getData())

  return (
    <Layout>
      <h1>Users</h1>
      {user?.isLoggedIn && user?.admin && (
        <>
        <h3>Enter users here and set the highest content rating they're allowed to view. Only the administrator (you)
        can add or remove users. Only users listed here can log in, the first password
        they enter will be stored as their password.</h3>
        <zing-grid ref={grid} context-menu caption="Users" head-class="grid-header" editor-controls>
          <zg-colgroup>
            <zg-column index="id" hidden editor="disabled"></zg-column>
            <zg-column index="username" header="User"></zg-column>
            <zg-column index="suitability" header="Highest Content Rating"></zg-column>
          </zg-colgroup>

        </zing-grid>
        </>
      )}
      {user?.isLoggedIn && !user?.admin && (
        <h2>You must be logged in as the administrator to view this page.</h2>
      )}
    </Layout>
  )
}

/*
export const getServerSideProps = withIronSessionSsr(async function ({req, res}) {
  const users = await getUsers()

  return {
    props: {users}
  }
}, sessionOptions)
*/

/*
        <zing-grid server-rendered context-menu caption="Users" head-class="grid-header" editor-controls>

          <zg-data src={database} adapter="graphql">
            <zg-param name="recordPath" value="data.users"></zg-param>
            <zg-param name="readBody" value={JSON.stringify({query: query_readUsers})}></zg-param>
          </zg-data>
*/
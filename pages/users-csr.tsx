/* 
 * Table for adding/removing users, visible only to the admin.
 * This is a statically rendered ZingGrid that will be hydrated
 * automatically when it's rendered in the browser.
 * Client-side remix
 */
import React, {useState, useEffect}  from 'react'
import Layout from 'components/Layout'
import {withIronSessionSsr} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import useUser from 'lib/useUser'
import ZingGrid from 'zinggrid'

import {remoteDB, query_readUsers, query_createUser, query_updateRowUser, query_updateCellUser, query_deleteUser,
  setPasswordForUserId, setSuitabilityForUserId} from 'lib/database'


export default function Users() {
  const {user} = useUser({redirectTo: '/login'})

  /*
   * Handle the suitability menu
   */
  const handleSuitability = (customIndex, domCell, cell) => {
    const sel = cell.dom().querySelector('select')
    sel.value = customIndex

    const id = cell.record.id

    sel.addEventListener('change', e => setSuitabilityForUserId(id, parseInt(e.target.value)))
  }

  /*
   * Handle the password button
   */
  const handlePassword = (customIndex, domCell, cell) => {
    const msg = cell.dom().querySelector('div span')
    const btn = cell.dom().querySelector('div button')

    const id = cell.record.id

    btn.onclick = async () => {
      await setPasswordForUserId(id, '')
      msg.style.display = ''
      btn.style.display = 'none'
    }

    if(!customIndex) {
      msg.style.display = ''
      btn.style.display = 'none'
    } else {
      msg.style.display = 'none'
      btn.style.display = ''
    }
  }

  useEffect(() => {
    ZingGrid.registerMethod(handlePassword, "pw")
    ZingGrid.registerMethod(handleSuitability, "hs")
  })

  return (
    <Layout>
      <h1>Users</h1>
      {user?.isLoggedIn && user?.admin == 1 && (
        <>
        <h3>Enter users here and set the highest content rating they're allowed to view. Only the administrator (you)
        can add or remove users. Only users listed here can log in, the first password
        they enter will be stored as their password.</h3>
        <zing-grid context-menu caption="Users" head-class="grid-header" editor-controls>
          <zg-colgroup>
            <zg-column index="id" hidden editor="disabled"></zg-column>
            <zg-column index="username" header="User"></zg-column>
            <zg-column index="levelId" header="Highest Content Rating" type="custom" renderer="hs" editor="disabled">
              <select>
                {user?.levels.map((x, index) => <option value={x.id} key={index}>{x.name}</option>)}
              </select>
            </zg-column>
            <zg-column index="password" header="Password" type="custom" renderer="pw" editor="disabled">
              <div>
                <span>No password set</span>
                <button>Reset password</button>
              </div>
            </zg-column>
          </zg-colgroup>
          <zg-data src={remoteDB} adapter="graphql">
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
      {user?.isLoggedIn && user?.admin == 0 && (
        <h2>You must be logged in as the administrator to view this page.</h2>
      )}
    </Layout>
  )
}
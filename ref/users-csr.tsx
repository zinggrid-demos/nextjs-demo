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

import {database, query_readUsers, query_createUser, query_updateRowUser, query_updateCellUser, query_deleteUser,
  setPasswordForUserId, setSuitabilityForUserId} from 'lib/database'


export default function Users() {
  const {user} = useUser({redirectTo: '/login'})

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

  const hasNullPassword = (pw) => !pw

  useEffect(() => {
    ZingGrid.registerMethod(handlePassword, "pw")
    //ZingGrid.registerMethod(hasNullPassword, "pw")
  })

	// name:value: pairs for the type-select-options attribute below
  const levelOpts = JSON.stringify(user?.levels?.map(x => ({name: x.name, value: x.id})))

							/*
            <zg-column index="password" header="Password" type="custom" editor="disabled" renderer="pw">
              <div>
                <span>No password set</span>
                <button>Reset password</button>
              </div>
            </zg-column>

            <zg-column index="password" header="Password" type="button" editor="disabled" type-button-label="Reset password" type-button-disabled="[[!record.password]]" />
            <zg-column index="password" header="Password" type="button" editor="disabled" type-button-label="Reset password" type-button-disabled="[[record.password]]" />

            <zg-column index="password" header="Password" type="button" editor="disabled" renderer="pw" type-button-label="Reset password" type-button-disabled="[[record.password]]" />
              */
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
            <zg-column index="levelId" header="Highest Content Rating" type="select" type-select-options={levelOpts} />
            <zg-column index="password" header="Password" type="custom" editor="disabled" renderer="pw">
              <div>
                <span>No password set</span>
                <button>Reset password</button>
              </div>
            </zg-column>
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
      {user?.isLoggedIn && user?.admin == 0 && (
        <h2>You must be logged in as the administrator to view this page.</h2>
      )}
    </Layout>
  )
}
/* 
 * Table for adding/removing shows, visible to all logged-in users.
 */
import React, {useEffect}  from 'react'
import Layout from 'components/Layout'
import {withIronSessionSsr} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import useUser from 'lib/useUser'
import ZingGrid from 'zinggrid'

import {remoteDB, query_readShows, query_createShow, query_updateRowShow, query_updateCellShow, query_deleteShow,
  setSuitabilityForShowId} from 'lib/database'
import {suitabilities} from 'lib/suitabilities'

export default function Shows() {
  const {user} = useUser({redirectTo: '/login'})

  /*
   * Handle the suitability menu
   */
  const handleSuitability = (customIndex, domCell, cell) => {
    const sel = cell.dom().querySelector('select')
    sel.value = customIndex

    const id = cell.record.id

    sel.addEventListener('change', e => setSuitabilityForShowId(id, parseInt(e.target.value)))
  }

  useEffect(() => {
    ZingGrid.registerMethod(handleSuitability, "hs")
  })

  return (
    <Layout>
      <h1>Shows</h1>
      {user?.isLoggedIn && (
        <>
        <h3>Enter shows here and set the parental guideline rating for each. Anyone
        can add or remove shows. When giving their personal ratings for shows a user
        will only see shows they're allowed to watch.</h3>
        <zing-grid context-menu caption="Shows" head-class="grid-header" editor-controls>
          <zg-colgroup>
            <zg-column index="id" hidden editor="disabled"></zg-column>
            <zg-column index="title" header="Title"></zg-column>
            <zg-column index="genre" header="Genre"></zg-column>
            <zg-column index="provider" header="Channel"></zg-column>
            <zg-column index="seasons" header="# of Seasons" type="number"></zg-column>
            <zg-column index="suitability" header="Content Rating" type="custom" renderer="hs" editor="disabled">
              <select>
                {suitabilities.map((x, index) => <option value={index} key={index}>{x}</option>)}
              </select>
            </zg-column>
          </zg-colgroup>
          <zg-data src={remoteDB} adapter="graphql">
            <zg-param name="recordPath" value="data.shows"></zg-param>
            <zg-param name="readBody" value={JSON.stringify({query: query_readShows})}></zg-param>
            <zg-param name="createBody" value={JSON.stringify({query: query_createShow})}></zg-param>
            <zg-param name="updateRowBody" value={JSON.stringify({query: query_updateRowShow})}></zg-param>
            <zg-param name="updateCellBody" value={JSON.stringify({query: query_updateCellShow})}></zg-param>
            <zg-param name="deleteBody" value={JSON.stringify({query: query_deleteShow})}></zg-param>
          </zg-data>

        </zing-grid>
        </>
      )}
      {!user?.isLoggedIn && (
        <h2>You must be logged in to view this page.</h2>
      )}
    </Layout>
  )
}
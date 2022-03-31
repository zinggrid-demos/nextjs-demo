/* 
 * Summary of ratings, visible to all users.
 *
 * This sis the client-side rendered (CSR) version.
 */
import Layout from 'components/Layout'
import useUser from 'lib/useUser'
import {useState, useEffect} from 'react'
import getSummaryProps from './_summary_props'

import 'zingchart/es6'
import ZingChart from 'zingchart-react'

export default function Summary() {  
  const {user} = useUser({redirectTo: '/login'})
  const [config, setConfig] = useState({})
  const [config2, setConfig2] = useState({})

  async function getConfigs() {
    const props = await getSummaryProps('')
    setConfig(props.config)
    setConfig2(props.config2)
  }

  useEffect(() => getConfigs(), [])

  return (
    <Layout>
      <h1>Summary</h1>
      {!user?.isLoggedIn && (
        <h2>You must be logged in to view this page.</h2>
      )}
      {user?.isLoggedIn && (
        <>
        <ZingChart data={config} height="600px" width="1000px" />
        <br />
        <ZingChart data={config2} height="600px" width="1000px" />
        </>
      )}
    </Layout>
  )
}
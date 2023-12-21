/* 
 * Summary of ratings, visible to all users.
 *
 * This is the server-side rendered (SSR) version.
 */
import Layout from 'components/Layout'
import {getIronSession} from 'iron-session'
import {sessionOptions} from 'lib/session'
import useUser from 'lib/useUser'
import {useEffect} from 'react'

import getSummaryProps from './_summary_props'

export default function Summary({user, config, config2, summaryImage, detailsImage}) {  
  return (
    <Layout>
      <h1>Summary</h1>
      {!user?.isLoggedIn && (
        <h2>You must be logged in to view this page.</h2>
      )}
      {user?.isLoggedIn && (
        <>
        <img src={summaryImage} alt="Summary plot" />
        <br />
        <img src={detailsImage} alt="Details plot" />
        </>
      )}
    </Layout>
  )
}

export const getServerSideProps = async function ({req, res}) {
  const session = await getIronSession(req, res, sessionOptions)
  const user = session.user
  if(user === undefined) {
    res.setHeader('location', '/login')
    res.statusCode = 302
    res.end()

    return {
      props: {
        user: {isLoggedIn: false, username: '', admin: 0} as User
      }
    }
  }

  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const baseUrl = req ? `${protocol}://${req.headers.host}` : ''

  const {config, config2, summaryImage, detailsImage} = await getSummaryProps(baseUrl)

  return {
    props: {
      user, config, config2, summaryImage, detailsImage
    }
  }
}

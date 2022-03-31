/* 
 * Summary of ratings, visible to all users.
 *
 * This component can use server-side rendering or client-side
 * rendering, but we were unable to make it switch between the two.
 * Move the comments marked SSR and CSR to select where you want
 * the rendering to occur. Note that the SSR version will not have
 * tooltips.
 * 
 * For CSR, the configurations are still computed server-side.
 */
import Layout from 'components/Layout'
import {withIronSessionSsr} from 'iron-session/next'
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

export const getServerSideProps = withIronSessionSsr(async function ({req, res}) {
  const user = req.session.user
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
}, sessionOptions)
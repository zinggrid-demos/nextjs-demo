/*
 * Profile of the logged-in user, rendered server-side
 */
import React from 'react'
import Layout from 'components/Layout'
import { getIronSession } from 'iron-session';
import {sessionOptions} from 'lib/session'
import { User } from 'pages/api/user'
import { InferGetServerSidePropsType } from 'next'

export default function SsrProfile({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout>
      <h1>{user?.username}'s profile</h1>
      {user && (
        <>
          <span className="label">Username: </span>
          <span className="value">{user.username}</span>
          <br />
          <span className="label">Administrator?: </span>
          <span className="value">{user.admin == 1 ? 'yes' : 'no'}</span>
        </>
      )}

      <style jsx>{`
        .label {
          font-size: 110%;
        }

        .value {
          font-size: 110%;
          font-weight: bold;
        }
      `}</style>
    </Layout>
  )
}

/*
 * Retrieve the props for this component, server-side.
 */
export const getServerSideProps = async function({req, res}) {
  const session = await getIronSession(req, res, sessionOptions)
  const user = session.user

  if (user === undefined) {
    res.setHeader('location', '/login')
    res.statusCode = 302
    res.end()
    return {
      props: {
        user: {isLoggedIn: false, username: '', admin: 0} as User,
      },
    }
  }

  return {
    props: {user},
  }
}

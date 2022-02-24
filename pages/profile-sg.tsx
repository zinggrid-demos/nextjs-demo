import React from 'react'
import Layout from 'components/Layout'
import useUser from 'lib/useUser'
import useEvents from 'lib/useEvents'

// Make sure to check https://nextjs.org/docs/basic-features/layouts for more info on how to use layouts
export default function SgProfile() {
  const { user } = useUser({
    redirectTo: '/login',
  })
  const { events } = useEvents(user)

  return (
    <Layout>
      <h1>{user?.username}'s profile</h1>
      <h2>
        This page uses{' '}
        <a href="https://nextjs.org/docs/basic-features/pages#static-generation-recommended">
          Static Generation (SG)
        </a>{' '}
        and the <a href="/api/user">/api/user</a> route
      </h2>
      {user && (
        <>
          <span className="label">Username: </span>
          <span className="value">{user.username}</span>
          <br />
          <span className="label">Password: </span>
          <span className="value">{user.password ? 'set' : 'not set'}</span>
          <br />
          <span className="label">Administrator?: </span>
          <span className="value">{user.admin == 1 ? 'yes' : 'no'}</span>
          <br />
          <pre>{JSON.stringify(user, null, 2)}</pre>
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

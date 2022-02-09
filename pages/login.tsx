import React, {useState} from 'react'
import useUser from 'lib/useUser'
import Layout from 'components/Layout'
import LoginForm from 'components/LoginForm'
import fetchJson, { FetchError } from 'lib/fetchJson'
import {anyAdmins} from 'lib/database'

export default function Login({haveAdmin}) {
  // here we just check if user is already logged in and redirect to profile
  const { mutateUser } = useUser({
    redirectTo: '/profile-sg',
    redirectIfFound: true,
  })

  const [errorMsg, setErrorMsg] = useState('')

  return (
    <Layout>
      <div className="login">
        <LoginForm
          notice={haveAdmin ? '' : 'You are the first user so you will become the administrator'}
          errorMessage={errorMsg}
          onSubmit={async function handleSubmit(event) {
            event.preventDefault()

            const body = {
              username: event.currentTarget.username.value,
              password: event.currentTarget.password.value
            }

            try {
              mutateUser(
                await fetchJson('/api/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body),
                })
              )
            } catch (error) {
              if (error instanceof FetchError) {
                setErrorMsg(error.data.message)
              } else {
                console.error('An unexpected error happened:', error)
              }
            }
          }}
        />
      </div>
      <style jsx>{`
        .login {
          max-width: 21rem;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
    </Layout>
  )
}

/*
 * Check if we have no admins. If not, we prompt user
 * that they're going to be the admin on the login form.
 */
export async function getServerSideProps() {
  const haveAdmin = await anyAdmins()

  return {props: {haveAdmin}}
}
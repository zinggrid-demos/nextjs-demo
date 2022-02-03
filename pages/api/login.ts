import type { User } from './user'

import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions}  from 'lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {anyAdmins, getUserByName, createAdmin, setPasswordForUserId} from 'lib/server'

export default withIronSessionApiRoute(loginRoute, sessionOptions)

/*
 * Attempt to log in. We first check if there are any admins. 
 * If not, allow any login and make them the admin.
 * If the user exists, but has no password, log them in and
 * accept the password provided, storing it.
 *
 * Note that we're not doing any encryption of passwords, so
 * this is not a secure solution. The focus of this demo is
 * authorization, not authentication.
 */
async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  try {
    const haveAdmin = await anyAdmins()
    const {username, password} = await req.body
    let user

    if(!haveAdmin) {
      user = await createAdmin(username, password)
    } else {
      user = await getUserByName(username)
      if(!user) {
        res.status(403).json({message: `User "${username}" not listed, ask the adminstrator to create your account`})
        return
      }

      if(!user.password) {
        await setPasswordForUserId(user.id, password)
      } else if(user.password !== password) {
        res.status(403).json({message: "Invalid password"})
        return
      }
    }

    req.session.user = {
      isLoggedIn: true,
      username: username,
      suitability: user.suitability,
      admin: !haveAdmin || user.admin === 1
    }

    await req.session.save()
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}

import {getIronSession} from 'iron-session'
import {sessionOptions} from 'lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {getUserByName, getSuitabilityLevels} from 'lib/database'

export type User = {
  isLoggedIn?: boolean
  id?: number
  username: string
  levelId: number
  admin: boolean
  levels: unknown
}

export default userRoute

/*
 * We obtain both the user info and the levels, since the levels are
 * static and needed everywhere the user data is needed.
 */
async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  const session = await getIronSession(req, res, sessionOptions)

  const levels = await getSuitabilityLevels()
  if (session.user) {
    const u = await getUserByName(session.user.username)
    if(u) {
      res.json({
        ...u,
        isLoggedIn: true,
        levels
      })
    } else {
      res.json({
        ...session.user,
        isLoggedIn: true,
        levels
      })
    }
  } else {
    res.json({
      isLoggedIn: false,
      username: '',
      levelId: 0,
      admin: false,
      levels
    })
  }
}

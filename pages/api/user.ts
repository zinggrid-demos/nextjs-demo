import {withIronSessionApiRoute} from 'iron-session/next'
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

export default withIronSessionApiRoute(userRoute, sessionOptions)

/*
 * We obtain both the user info and the levels, since the levels are
 * static and needed everywhere the user data is needed.
 */
async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  const levels = await getSuitabilityLevels()
  if (req.session.user) {
    const u = await getUserByName(req.session.user.username)
    if(u) {
      res.json({
        ...u,
        isLoggedIn: true,
        levels
      })
    } else {
      res.json({
        ...req.session.user,
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

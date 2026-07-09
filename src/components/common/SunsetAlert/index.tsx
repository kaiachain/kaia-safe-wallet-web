import { Alert, Link } from '@mui/material'
import { SAFE_GLOBAL_APP_URL, SUNSET_DATE } from '@/config/constants'
import { AppRoutes } from '@/config/routes'

const WELCOME_ROUTES = [AppRoutes.welcome.index, AppRoutes.welcome.accounts, AppRoutes.welcome.socialLogin]

type SunsetAlertProps = {
  pathname: string
}

const SunsetAlert = ({ pathname }: SunsetAlertProps) => {
  if (!WELCOME_ROUTES.includes(pathname)) return null

  return (
    <Alert severity="warning" sx={{ mx: 3, mt: 3 }}>
      safe.kaia.io will sunset on <b>{SUNSET_DATE}</b>. Please use{' '}
      <Link href={SAFE_GLOBAL_APP_URL} target="_blank" rel="noopener noreferrer" fontWeight={700}>
        Safe{'{Wallet}'}
      </Link>{' '}
      at app.safe.global to manage your accounts going forward. Your existing Safe Accounts will be automatically
      compatible with Safe{'{Wallet}'}.
    </Alert>
  )
}

export default SunsetAlert

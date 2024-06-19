import type { NextPage } from 'next'
import Head from 'next/head'
import { IS_OFFICIAL_HOST } from '@/config/constants'
import { Typography, Table, TableBody, TableRow, TableCell, TableHead, TableContainer, Box } from '@mui/material'
import ExternalLink from '@/components/common/ExternalLink'
import Paper from '@mui/material/Paper'

const SafeAPIs = () => (
  <>
    <Typography variant="h1" mb={2}>
      API references
    </Typography>
    <Box mb={4}>
      <Typography mb={3}>
        This page contains a list of swagger documentations for all {'KaiaSafe{Wallet}'} services.
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="30%">
                <strong>Service</strong>
              </TableCell>
              <TableCell>
                <strong>Swagger Docs</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Safe Gateway service</TableCell>
              <TableCell>
                <ExternalLink href="https://safe-gateway.klaytn.foundation/cgw/api">
                  https://safe-gateway.klaytn.foundation/cgw/api
                </ExternalLink>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Safe Cypress Transaction service</TableCell>
              <TableCell>
                <ExternalLink href="https://docs-safe.klaytn.foundation/txs-cypress/">
                  https://docs-safe.klaytn.foundation/txs-cypress/
                </ExternalLink>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Safe Baobab Transaction service</TableCell>
              <TableCell>
                <ExternalLink href="https://docs-safe.klaytn.foundation/txs-baobab/">
                  https://docs-safe.klaytn.foundation/txs-baobab/
                </ExternalLink>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Safe Config service</TableCell>
              <TableCell>
                <ExternalLink href="https://docs-safe.klaytn.foundation/cfg/">
                  https://docs-safe.klaytn.foundation/cfg/
                </ExternalLink>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  </>
)

const Licenses: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'KaiaSafe{Wallet} – Safe APIs'}</title>
      </Head>

      <main>{IS_OFFICIAL_HOST && <SafeAPIs />}</main>
    </>
  )
}

export default Licenses

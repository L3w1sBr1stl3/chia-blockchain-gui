import type { Connection } from '@chia-network/api';
import { ServiceName } from '@chia-network/api';
import { useGetFarmerFullNodeConnectionsQuery, useService } from '@chia-network/api-react';
import { Table, Card, FormatBytes, FormatConnectionStatus } from '@chia-network/core';
import { Trans } from '@lingui/macro';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Link, Typography, Tooltip, IconButton } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

import FarmCloseConnection from './FarmCloseConnection';

const StyledIconButton = styled(IconButton)`
  padding: 0.2rem;
`;

const cols = [
  {
    minWidth: '200px',
    field(row: Connection) {
      return (
        <Tooltip title={row.nodeId}>
          <span>{row.nodeId}</span>
        </Tooltip>
      );
    },
    title: <Trans>Node ID</Trans>,
  },
  {
    field: 'peerHost',
    title: <Trans>Host Name</Trans>,
  },
  {
    field(row: Connection) {
      return `${row.peerPort}/${row.peerServerPort}`;
    },
    title: <Trans>Port</Trans>,
  },
  {
    field(row: Connection) {
      return (
        <>
          <FormatBytes value={row.bytesWritten} unit="KiB" removeUnit fixedDecimals />
          /
          <FormatBytes value={row.bytesRead} unit="KiB" removeUnit fixedDecimals />
        </>
      );
    },
    title: <Trans>KiB Up/Down</Trans>,
  },
  {
    title: <Trans>Actions</Trans>,
    field(row: Connection) {
      return (
        <FarmCloseConnection nodeId={row.nodeId}>
          {({ onClose }) => (
            <StyledIconButton onClick={() => onClose()}>
              <DeleteIcon color="info" />
            </StyledIconButton>
          )}
        </FarmCloseConnection>
      );
    },
  },
];

export default function FarmFullNodeConnections() {
  const { data: connections = [] } = useGetFarmerFullNodeConnectionsQuery();
  const { isRunning, isLoading } = useService(ServiceName.FARMER);

  return (
    <Card
      gap={1}
      title={<Trans>Your Full Node Connection</Trans>}
      titleVariant="h6"
      tooltip={
        <Trans>
          {'The full node that your farmer is connected to is below. '}
          <Link target="_blank" href="https://github.com/Chia-Network/chia-blockchain/wiki/Network-Architecture">
            Learn more
          </Link>
        </Trans>
      }
      transparent
    >
      <Typography variant="caption" color="textSecondary">
        <Trans>Connection Status:</Trans>
        &nbsp;
        <FormatConnectionStatus connected={isRunning} />
      </Typography>
      <Table cols={cols} rows={connections} isLoading={isLoading} />
    </Card>
  );
}

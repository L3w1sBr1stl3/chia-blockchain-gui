import { HarvesterInfo, LatencyData } from '@chia-network/api';
import { Flex, FormatBytes, Tooltip } from '@chia-network/core';
import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, LinearProgress, Chip } from '@mui/material';
import * as React from 'react';

import isLocalhost from '../../util/isLocalhost';
import { UI_ACTUAL_SPACE_CONSTANT_FACTOR, expectedPlotSize } from '../../util/plot';
import HarvesterLatency from './HarvesterLatency';
import HarvesterPlotDetails from './HarvesterPlotDetails';

export type HarvesterLatencyGraphProps = {
  harvester?: HarvesterInfo;
  latencyData?: LatencyData;
  totalFarmSizeRaw?: number;
  totalFarmSizeEffective?: number;
};

export default React.memo(HarvesterLatencyGraph);

function HarvesterLatencyGraph(props: HarvesterLatencyGraphProps) {
  const { harvester, latencyData, totalFarmSizeRaw, totalFarmSizeEffective } = props;
  // const { isDarkMode } = useDarkMode();
  const nodeId = harvester?.connection.nodeId;
  const host = harvester?.connection.host;
  // const latencyRecords = latencyData && nodeId ? latencyData[nodeId] : undefined;
  const isLocal = host ? isLocalhost(host) : undefined;
  const simpleNodeId = nodeId ? `${nodeId.substring(0, 6)}...${nodeId.substring(nodeId.length - 6)}` : undefined;
  const harvestingMode = harvester?.harvestingMode;

  const cardTitle = React.useMemo(() => {
    let chip;
    if (harvestingMode === 2) {
      chip = <Chip label="GPU" color="primary" />;
    } else if (typeof harvestingMode !== 'number') {
      chip = <Chip label="Old" />;
    }

    return (
      <Box marginBottom={2}>
        <Flex flexDirection="column">
          <Flex alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
            <Flex alignItems="baseline">
              <Typography variant="h6">
                {isLocal ? <Trans>Local Harvester</Trans> : <Trans>Remote Harvester</Trans>}
              </Typography>
              &nbsp;
              <Tooltip title={nodeId}>
                <Typography variant="body2" color="textSecondary">
                  {simpleNodeId}
                </Typography>
              </Tooltip>
            </Flex>
            <Box>{chip}</Box>
          </Flex>
          <Flex alignItems="center" gap={2}>
            <Typography variant="body2" color="textSecondary">
              {host}
            </Typography>
          </Flex>
        </Flex>
      </Box>
    );
  }, [isLocal, nodeId, simpleNodeId, host, harvestingMode]);

  const space = React.useMemo(() => {
    const effectiveSpace = harvester
      ? harvester.plots.reduce((acc, val) => acc + UI_ACTUAL_SPACE_CONSTANT_FACTOR * expectedPlotSize(val.size), 0)
      : undefined;
    const totalSpaceOccupation =
      harvester && totalFarmSizeRaw ? (harvester.totalPlotSize / totalFarmSizeRaw) * 100 : undefined;
    const effectiveSpaceOccupation =
      effectiveSpace && totalFarmSizeEffective ? (effectiveSpace / totalFarmSizeEffective) * 100 : undefined;

    return (
      <Paper variant="outlined">
        <Box sx={{ p: 1.5 }}>
          <Flex direction="column" gap={1}>
            <Typography sx={{ fontWeight: 500 }}>
              <Trans>Space</Trans>
            </Typography>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td colSpan={2}>
                    <Typography variant="body2" color="textSecondary">
                      <Trans>Total Space</Trans>
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td style={{ width: 1, whiteSpace: 'nowrap' }}>
                    <FormatBytes value={harvester?.totalPlotSize} precision={3} />
                  </td>
                  <td>
                    <Box sx={{ paddingLeft: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={totalSpaceOccupation}
                        sx={{ height: 20, '& > span': { backgroundColor: '#1a8284' } }}
                      />
                    </Box>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <Box sx={{ height: 1 }} />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <Typography variant="body2" color="textSecondary">
                      <Trans>Effective Space</Trans>
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td style={{ width: 1, whiteSpace: 'nowrap' }}>
                    <FormatBytes value={effectiveSpace} precision={3} />
                  </td>
                  <td>
                    <Box sx={{ paddingLeft: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={effectiveSpaceOccupation}
                        sx={{ height: 20, '& > span': { backgroundColor: '#5ece71' } }}
                      />
                    </Box>
                  </td>
                </tr>
              </tbody>
            </table>
          </Flex>
        </Box>
      </Paper>
    );
  }, [harvester, totalFarmSizeRaw, totalFarmSizeEffective]);

  const harvesterLatency = React.useMemo(
    () => <HarvesterLatency latencyInfo={latencyData && nodeId ? latencyData[nodeId] : undefined} />,
    [latencyData, nodeId]
  );

  const plotDetails = React.useMemo(() => <HarvesterPlotDetails harvester={harvester} />, [harvester]);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {cardTitle}
      <Flex direction="column" gap={3}>
        {space}
        {harvesterLatency}
        {plotDetails}
      </Flex>
    </Paper>
  );
}
